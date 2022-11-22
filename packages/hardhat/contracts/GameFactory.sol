// SPDX-License-Identifier: MIT
pragma solidity >=0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import { GameV1Interface } from "./interfaces/GameV1Interface.sol";
import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";

contract GameFactory is Pausable, Ownable, ReentrancyGuard {
    using Address for address;

    address public cronUpkeep;

    uint256 public nextId = 0;

    uint256 public gameCreationAmount;

    uint256 public latestVersionId;
    GameV1Version[] public games;

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
        uint256 gameCreationAmount;
    }

    /**
     * @notice GameV1Version structure that contain all usefull data for a game Implementation version
     */
    struct GameV1Version {
        uint256 id;
        address deployedAddress;
    }

    /**
     * @notice AuthorizedAmount structure that contain all usefull data bout an authorized amount
     * @dev TODO NEXT VERSION add default Name and Image to AuthorizedAmount
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
    event GameCreated(uint256 nextId, address gameAddress, uint256 implementationVersion, address creatorAddress);
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
     * @param _game the game implementation address
     * @param _cronUpkeep the keeper address
     * @param _gameCreationAmount the game creation amount
     * @param _authorizedAmounts the list of authorized amounts for game creation
     */
    constructor(
        address _game,
        address _cronUpkeep,
        uint256 _gameCreationAmount,
        uint256[] memory _authorizedAmounts
    ) onlyIfAuthorizedAmountsIsNotEmpty(_authorizedAmounts) onlyAddressInit(_game) onlyAddressInit(_cronUpkeep) {
        cronUpkeep = _cronUpkeep;
        gameCreationAmount = _gameCreationAmount;

        games.push(GameV1Version({ id: latestVersionId, deployedAddress: _game }));

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
     * @param _name the game name
     * @param _maxPlayers the max players for the game
     * @param _playTimeRange the player time range
     * @param _registrationAmount the registration amount
     * @param _treasuryFee the treasury fee in percent
     * @param _creatorFee the creator fee in %
     * @param _encodedCron the encoded cron as * * * * *
     */
    function createNewGame(
        bytes32 _name,
        uint256 _maxPlayers,
        uint256 _playTimeRange,
        uint256 _registrationAmount,
        uint256 _treasuryFee,
        uint256 _creatorFee,
        string memory _encodedCron,
        GameV1Interface.Prize[] memory _prizes
    )
        external
        payable
        whenNotPaused
        onlyGameCreationAmount
        onlyAllowedRegistrationAmount(_registrationAmount)
        onlyIfNotUsedRegistrationAmounts(_registrationAmount)
        returns (address game)
    {
        address latestGameV1Address = games[latestVersionId].deployedAddress;
        address payable newGameAddress = payable(Clones.clone(latestGameV1Address));

        usedAuthorizedAmounts[_registrationAmount].isUsed = true;
        deployedGames.push(
            Game({
                id: nextId,
                versionId: latestVersionId,
                creator: msg.sender,
                deployedAddress: newGameAddress,
                gameCreationAmount: gameCreationAmount
            })
        );

        CronUpkeepInterface(cronUpkeep).addDelegator(newGameAddress);

        // Declare structure and initialize later to avoid stack too deep exception
        GameV1Interface.Initialization memory initialization;
        initialization.creator = msg.sender;
        initialization.owner = owner();
        initialization.cronUpkeep = cronUpkeep;
        initialization.name = _name;
        initialization.version = latestVersionId;
        initialization.id = nextId;
        initialization.playTimeRange = _playTimeRange;
        initialization.maxPlayers = _maxPlayers;
        initialization.registrationAmount = _registrationAmount;
        initialization.treasuryFee = _treasuryFee;
        initialization.creatorFee = _creatorFee;
        initialization.encodedCron = _encodedCron;
        initialization.prizes = _prizes;

        uint256 prizepool = msg.value - gameCreationAmount;
        GameV1Interface(newGameAddress).initialize{ value: prizepool }(initialization);

        emit GameCreated(nextId, newGameAddress, latestVersionId, msg.sender);
        nextId += 1;

        return newGameAddress;
    }

    ///
    ///INTERNAL FUNCTIONS
    ///
    /**
     * @notice Transfert funds
     * @param _receiver the receiver address
     * @param _amount the amount to transfert
     * @dev TODO NEXT VERSION use SafeERC20 library from OpenZeppelin
     */
    function _safeTransfert(address _receiver, uint256 _amount) internal {
        uint256 balance = address(this).balance;
        if (balance < _amount) require(false, "Not enough in contract balance");
        (bool success, ) = _receiver.call{ value: _amount }("");
        if (!success) {
            emit FailedTransfer(_receiver, _amount);
            require(false, "Transfer failed.");
        }
    }

    /**
     * @notice Check if authorized amount exist
     * @param _authorizedAmount the authorized amount to check
     * @return isExist true if exist false if not
     */
    function _isExistAuthorizedAmounts(uint256 _authorizedAmount) internal view returns (bool isExist) {
        for (uint256 i = 0; i < authorizedAmounts.length; i++) {
            if (authorizedAmounts[i] == _authorizedAmount) return true;
        }
        return false;
    }

    ///
    ///GETTER FUNCTIONS
    ///

    /**
     * @notice Get the list of deployed games
     * @return allGames the list of games
     */
    function getDeployedGames() external view returns (Game[] memory allGames) {
        return deployedGames;
    }

    /**
     * @notice Get the list of authorized amounts
     * @return gameAuthorisedAmounts the list of authorized amounts
     */
    function getAuthorizedAmounts() external view returns (uint256[] memory gameAuthorisedAmounts) {
        return authorizedAmounts;
    }

    /**
     * @notice Get authorized amount
     * @param _authorizedAmount the authorized amount to get
     * @return gameAuthorisedAmount the authorized amount
     */
    function getAuthorizedAmount(uint256 _authorizedAmount)
        external
        view
        returns (AuthorizedAmount memory gameAuthorisedAmount)
    {
        return usedAuthorizedAmounts[_authorizedAmount];
    }

    ///
    ///ADMIN FUNCTIONS
    ///

    /**
     * @notice Set the game implementation address
     * @param _game the new game implementation address
     * @dev Callable by admin
     */
    function setNewGameV1(address _game) external onlyAdmin {
        latestVersionId += 1;
        games.push(GameV1Version({ id: latestVersionId, deployedAddress: _game }));
    }

    /**
     * @notice Add some authorized amounts
     * @param _authorizedAmounts the list of authorized amounts to add
     * @dev Callable by admin
     */
    function addAuthorizedAmounts(uint256[] memory _authorizedAmounts) external onlyAdmin {
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
    function updateCronUpkeep(address _cronUpkeep) external onlyAdmin onlyAddressInit(_cronUpkeep) {
        cronUpkeep = _cronUpkeep;
        emit CronUpkeepUpdated(cronUpkeep);

        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            CronUpkeepInterface(cronUpkeep).addDelegator(game.deployedAddress);

            GameV1Interface(payable(game.deployedAddress)).setCronUpkeep(cronUpkeep);
        }
    }

    /**
     * @notice Pause the factory and all games and associated keeper job
     * @dev Callable by admin
     */
    function pauseAllGamesAndFactory() external onlyAdmin whenNotPaused {
        // pause first to ensure no more interaction with contract
        _pause();
        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameV1Interface(payable(game.deployedAddress)).pause();
        }
    }

    /**
     * @notice Resume the factory and all games and associated keeper job
     * @dev Callable by admin
     */
    function resumeAllGamesAndFactory() external onlyAdmin whenPaused {
        // unpause last to ensure that everything is ok
        _unpause();

        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameV1Interface(payable(game.deployedAddress)).unpause();
        }
    }

    /**
     * @notice Pause the factory
     */
    function pause() external onlyAdmin whenNotPaused {
        _pause();
    }

    /**
     * @notice Unpause the factory
     */
    function unpause() external onlyAdmin whenPaused {
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
    function transferAdminOwnership(address _adminAddress) external onlyAdmin onlyAddressInit(_adminAddress) {
        transferOwnership(_adminAddress);
    }

    /**
     * @notice Allow admin to withdraw all funds of smart contract
     * @dev Callable by admin
     */
    function withdrawFunds() external onlyAdmin {
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
        require(msg.sender == owner() || msg.value >= gameCreationAmount, "Only game creation amount is allowed");
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
        require(
            _registrationAmount == 0 || !usedAuthorizedAmounts[_registrationAmount].isUsed,
            "registrationAmout is already used"
        );
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
