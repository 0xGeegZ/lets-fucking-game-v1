// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import { GameImplementationInterface } from "./interfaces/GameImplementationInterface.sol";
import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";

contract GameFactory is Pausable, Ownable {
    address public cronUpkeep;

    uint256 public nextGameId = 0;

    uint256 public gameCreationAmount;

    uint256 public latestGameImplementationVersionId;
    GameImplementationVersion[] public gameImplementations;

    Game[] public deployedGames;

    uint256[] public authorizedAmounts;
    mapping(uint256 => AuthorizedAmount) public usedAuthorizedAmounts;

    ///
    ///STRUCTS
    ///

    /**
     * @notice Game structure that contain all usefull data for a game
     */
    struct Game {
        uint256 id;
        uint256 versionId;
        address creator;
        address deployedAddress;
    }

    /**
     * @notice GameImplementationVersion structure that contain all usefull data for a game Implementation version
     */
    struct GameImplementationVersion {
        uint256 id;
        address deployedAddress;
    }

    /**
     * @notice AuthorizedAmount structure that contain all usefull data bout an authorized amount
     */
    struct AuthorizedAmount {
        uint256 amount;
        bool isUsed;
    }

    ///
    ///EVENTS
    ///

    /**
     * @notice Called when a game is created
     */
    event GameCreated(uint256 nextGameId, address gameAddress, uint256 implementationVersion, address creatorAddress);
    /**
     * @notice Called when a transfert have failed
     */
    event FailedTransfer(address receiver, uint256 amount);
    /**
     * @notice Called when the factory or admin update cronUpkeep
     */
    event CronUpkeepUpdated(address cronUpkeep);
    /**
     * @notice Called when the contract have receive funds via receive() or fallback() function
     */
    event Received(address sender, uint256 amount);

    /**
     * @notice Constructor Tha initialised the factory configuration
     * @param _gameImplementation the game implementation address
     * @param _cronUpkeep the keeper address
     * @param _gameCreationAmount the game creation amount
     * @param _authorizedAmounts the list of authorized amounts for game creation
     */
    constructor(
        address _gameImplementation,
        address _cronUpkeep,
        uint256 _gameCreationAmount,
        uint256[] memory _authorizedAmounts
    )
        onlyIfAuthorizedAmountsIsNotEmpty(_authorizedAmounts)
        onlyAddressInit(_gameImplementation)
        onlyAddressInit(_cronUpkeep)
    {
        cronUpkeep = _cronUpkeep;
        gameCreationAmount = _gameCreationAmount;

        gameImplementations.push(
            GameImplementationVersion({ id: latestGameImplementationVersionId, deployedAddress: _gameImplementation })
        );

        for (uint256 i = 0; i < _authorizedAmounts.length; i++) {
            if (!_isExistAuthorizedAmounts(_authorizedAmounts[i])) {
                authorizedAmounts.push(_authorizedAmounts[i]);
                usedAuthorizedAmounts[_authorizedAmounts[i]] = AuthorizedAmount({
                    isUsed: false,
                    amount: _authorizedAmounts[i]
                });
            }
        }
    }

    ///
    /// MAIN FUNCTIONS
    ///

    /**
     * @notice Create a new game
     * @param _gameName the game name
     * @param _gameImage the game image path
     * @param _maxPlayers the max players for the game
     * @param _playTimeRange the player time range
     * @param _registrationAmount the registration amount
     * @param _treasuryFee the treasury fee in percent
     * @param _creatorFee the creator fee in %
     * @param _encodedCron the encoded cron as * * * * *
     */
    function createNewGame(
        string memory _gameName,
        string memory _gameImage,
        uint256 _maxPlayers,
        uint256 _playTimeRange,
        uint256 _registrationAmount,
        uint256 _treasuryFee,
        uint256 _creatorFee,
        string memory _encodedCron
    )
        public
        payable
        whenNotPaused
        onlyGameCreationAmount
        onlyAllowedRegistrationAmount(_registrationAmount)
        onlyIfNotUsedRegistrationAmounts(_registrationAmount)
        returns (address game)
    {
        address latestGameImplementationAddress = gameImplementations[latestGameImplementationVersionId]
            .deployedAddress;
        address payable newGameAddress = payable(Clones.clone(latestGameImplementationAddress));

        CronUpkeepInterface(cronUpkeep).addDelegator(newGameAddress);

        GameImplementationInterface.Initialization memory initialization;
        initialization._creator = msg.sender;
        initialization._owner = owner();
        initialization._cronUpkeep = cronUpkeep;
        initialization._gameName = _gameName;
        initialization._gameImage = _gameImage;
        initialization._gameImplementationVersion = latestGameImplementationVersionId;
        initialization._gameId = nextGameId;
        initialization._playTimeRange = _playTimeRange;
        initialization._maxPlayers = _maxPlayers;
        initialization._registrationAmount = _registrationAmount;
        initialization._treasuryFee = _treasuryFee;
        initialization._creatorFee = _creatorFee;
        initialization._encodedCron = _encodedCron;

        GameImplementationInterface(newGameAddress).initialize(initialization);

        deployedGames.push(
            Game({
                id: nextGameId,
                versionId: latestGameImplementationVersionId,
                creator: msg.sender,
                deployedAddress: newGameAddress
            })
        );
        emit GameCreated(nextGameId, newGameAddress, latestGameImplementationVersionId, msg.sender);
        nextGameId += 1;
        usedAuthorizedAmounts[_registrationAmount].isUsed = true;
        return newGameAddress;
    }

    ///
    ///INTERNAL FUNCTIONS
    ///
    /**
     * @notice Transfert funds
     * @param receiver the receiver address
     * @param amount the amount to transfert
     */
    function _safeTransfert(address receiver, uint256 amount) internal {
        uint256 balance = address(this).balance;
        if (balance < amount) require(false, "Not enough in contract balance");
        (bool success, ) = receiver.call{ value: amount }("");
        if (!success) {
            emit FailedTransfer(receiver, amount);
            require(false, "Transfer failed.");
        }
    }

    /**
     * @notice Check if authorized amount exist
     * @param _authorizedAmount the authorized amount to check
     * @return true if exist false if not
     */
    function _isExistAuthorizedAmounts(uint256 _authorizedAmount) internal view returns (bool) {
        for (uint256 i = 0; i < authorizedAmounts.length; i++) {
            if (authorizedAmounts[i] == _authorizedAmount) {
                return true;
            }
        }
        return false;
    }

    ///
    ///GETTER FUNCTIONS
    ///

    /**
     * @notice Get the list of deployed games
     * @return the list of games
     */
    function getDeployedGames() external view returns (Game[] memory) {
        return deployedGames;
    }

    /**
     * @notice Get the list of authorized amounts
     * @return the list of authorized amounts
     */
    function getAuthorizedAmounts() external view returns (uint256[] memory) {
        return authorizedAmounts;
    }

    /**
     * @notice Get authorized amount
     * @param _authorizedAmount the authorized amount to get
     * @return the authorized amount
     */
    function getAuthorizedAmount(uint256 _authorizedAmount) external view returns (AuthorizedAmount memory) {
        return usedAuthorizedAmounts[_authorizedAmount];
    }

    ///
    ///ADMIN FUNCTIONS
    ///

    /**
     * @notice Set the game implementation address
     * @param _gameImplementation the new game implementation address
     * @dev Callable by admin
     */
    function setNewGameImplementation(address _gameImplementation) public onlyAdmin {
        latestGameImplementationVersionId += 1;
        gameImplementations.push(
            GameImplementationVersion({ id: latestGameImplementationVersionId, deployedAddress: _gameImplementation })
        );
    }

    /**
     * @notice Add some authorized amounts
     * @param _authorizedAmounts the list of authorized amounts to add
     * @dev Callable by admin
     */
    function addAuthorizedAmounts(uint256[] memory _authorizedAmounts) public onlyAdmin {
        for (uint256 i = 0; i < _authorizedAmounts.length; i++) {
            if (!_isExistAuthorizedAmounts(_authorizedAmounts[i])) {
                authorizedAmounts.push(_authorizedAmounts[i]);
                usedAuthorizedAmounts[_authorizedAmounts[i]] = AuthorizedAmount({
                    isUsed: false,
                    amount: _authorizedAmounts[i]
                });
            }
        }
    }

    /**
     * @notice Update the keeper address for the factory and all games and associated keeper job
     * @param _cronUpkeep the new keeper address
     * @dev Callable by admin
     */
    function updateCronUpkeep(address _cronUpkeep) public onlyAdmin onlyAddressInit(_cronUpkeep) {
        cronUpkeep = _cronUpkeep;

        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameImplementationInterface(payable(game.deployedAddress)).setCronUpkeep(cronUpkeep);
        }
        emit CronUpkeepUpdated(cronUpkeep);
    }

    /**
     * @notice Pause the factory and all games and associated keeper job
     * @dev Callable by admin
     */
    function pauseAllGamesAndFactory() public onlyAdmin {
        // pause first to ensure no more interaction with contract
        pause();
        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameImplementationInterface(payable(game.deployedAddress)).pause();
        }
    }

    /**
     * @notice Resume the factory and all games and associated keeper job
     * @dev Callable by admin
     */
    function ResumeAllGamesAndFactory() public onlyAdmin {
        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameImplementationInterface(payable(game.deployedAddress)).unpause();
        }
        // unpause last to ensure that everything is ok
        unpause();
    }

    /**
     * @notice Pause the factory
     */
    function pause() public onlyAdmin whenNotPaused {
        _pause();
    }

    /**
     * @notice Unpause the factory
     */
    function unpause() public onlyAdmin whenPaused {
        _unpause();
    }

    ///
    /// EMERGENCY
    ///

    /**
     * @notice Transfert Admin Ownership
     * @param _adminAddress the new admin address
     * @dev Callable by admin
     */
    function transferAdminOwnership(address _adminAddress) public onlyAdmin onlyAddressInit(_adminAddress) {
        transferOwnership(_adminAddress);
    }

    /**
     * @notice Allow admin to withdraw all funds of smart contract
     * @dev Callable by admin
     */
    function withdrawFunds() public onlyAdmin {
        _safeTransfert(owner(), address(this).balance);
    }

    ///
    /// FALLBACK FUNCTIONS
    ///

    /**
     * @notice  Called for empty calldata (and any value)
     */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Called when no other function matches (not even the receive function). Optionally payable
     */
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    ///
    /// MODIFIERS
    ///

    /**
     * @notice Modifier that ensure only admin can access this function
     */
    modifier onlyAdmin() {
        require(msg.sender == owner(), "Caller is not the admin");
        _;
    }

    /**
     * @notice Modifier that ensure that address is initialised
     */
    modifier onlyAddressInit(address _toCheck) {
        require(_toCheck != address(0), "address need to be initialised");
        _;
    }

    /**
     * @notice Modifier that ensure that amount sended is game creation amount
     */
    modifier onlyGameCreationAmount() {
        require(msg.value == gameCreationAmount, "Only game creation amount is allowed");
        _;
    }

    /**
     * @notice Modifier that ensure that registration amount is part of allowed registration amounts
     * @param _registrationAmount the receiver for the funds (admin or factory)
     */
    modifier onlyAllowedRegistrationAmount(uint256 _registrationAmount) {
        require(
            usedAuthorizedAmounts[_registrationAmount].amount == _registrationAmount,
            "registrationAmout is not allowed"
        );
        _;
    }

    /**
     * @notice Modifier that ensure that registration amount is part of allowed registration amounts
     * @param _registrationAmount authorized amount
     */
    modifier onlyIfNotUsedRegistrationAmounts(uint256 _registrationAmount) {
        require(usedAuthorizedAmounts[_registrationAmount].isUsed == false, "registrationAmout is already used");
        _;
    }

    /**
     * @notice Modifier that ensure that authorized amounts param is not empty
     * @param _authorizedAmounts list of authorized amounts
     */
    modifier onlyIfAuthorizedAmountsIsNotEmpty(uint256[] memory _authorizedAmounts) {
        require(_authorizedAmounts.length >= 1, "authorizedAmounts should be greather or equal to 1");
        _;
    }
}
