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

    // TODO GUIGUI should be entered as percent
    uint256 public houseEdge;

    uint256 public latestGameImplementationVersionId;
    GameImplementationVersion[] public gameImplementations;

    Game[] public deployedGames;

    uint256[] authorizedAmounts;
    mapping(uint256 => AuthorizedAmount) public usedAuthorisedAmounts;

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
     * @notice AuthorizedAmount structure that contain all usefull data bout an authorised amount
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
     * @notice Constructor the is tagged ad base
     * Base can only been initialised once
     */
    // TODO GUIGUI add game amount to pay when creating a new game
    constructor(
        address _gameImplementation,
        address _cronUpkeep,
        uint256 _houseEdge,
        uint256[] memory _authorizedAmounts
    ) onlyIfAuthorizedAmountsIsNotEmpty(_authorizedAmounts) {
        // TODO transfor requires to modifiers (SEE: onlyAllowedNumberOfPlayers for _houseEdge require)
        require(_gameImplementation != address(0), "Game Implementation need to be initialised");
        require(_cronUpkeep != address(0), "Keeper need to be initialised");
        // TODO create constant for max house edge
        // require(_houseEdge <= 10, "House Edge need to be less or equal to 10");

        cronUpkeep = _cronUpkeep;

        houseEdge = _houseEdge;
        gameImplementations.push(
            GameImplementationVersion({ id: latestGameImplementationVersionId, deployedAddress: _gameImplementation })
        );

        for (uint256 i = 0; i < _authorizedAmounts.length; i++) {
            if (!_isExistAuthorizedAmounts(_authorizedAmounts[i])) {
                authorizedAmounts.push(_authorizedAmounts[i]);
                usedAuthorisedAmounts[_authorizedAmounts[i]] = AuthorizedAmount({
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
     * @param _maxPlayers the max players for the game
     * @param _playTimeRange the player time range
     * @param _registrationAmount the registration amount
     * @param _creatorEdge the creator edge in %
     * @param _encodedCron the encoded cron as * * * * *
     */
    // TODO add Name and image url as argument to createNewGame & initialize functions
    function createNewGame(
        uint256 _maxPlayers,
        uint256 _playTimeRange,
        uint256 _registrationAmount,
        uint256 _creatorEdge,
        string memory _encodedCron
    )
        public
        whenNotPaused
        onlyAllowedRegistrationAmount(_registrationAmount)
        onlyIfNotUsedRegistrationAmounts(_registrationAmount)
        returns (address game)
    {
        address latestGameImplementationAddress = gameImplementations[latestGameImplementationVersionId]
            .deployedAddress;
        address payable newGameAddress = payable(Clones.clone(latestGameImplementationAddress));

        CronUpkeepInterface(cronUpkeep).addDelegator(newGameAddress);

        GameImplementationInterface(newGameAddress).initialize(
            GameImplementationInterface.Initialization({
                _creator: msg.sender,
                _owner: owner(),
                _cronUpkeep: cronUpkeep,
                _gameImplementationVersion: latestGameImplementationVersionId,
                _gameId: nextGameId,
                _playTimeRange: _playTimeRange,
                _maxPlayers: _maxPlayers,
                _registrationAmount: _registrationAmount,
                _houseEdge: houseEdge,
                _creatorEdge: _creatorEdge,
                _encodedCron: _encodedCron
            })
        );
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
        usedAuthorisedAmounts[_registrationAmount].isUsed = true;
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
     * @notice Check if authorised amount exist
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
     * @notice Get the list of authorised amounts
     * @return the list of authorised amounts
     */
    function getAuthorisedAmounts() external view returns (uint256[] memory) {
        return authorizedAmounts;
    }

    /**
     * @notice Get authorised amount
     * @param _authorizedAmount the authorized amount to get
     * @return the authorised amount
     */
    function getAuthorisedAmount(uint256 _authorizedAmount) external view returns (AuthorizedAmount memory) {
        return usedAuthorisedAmounts[_authorizedAmount];
    }

    ///
    ///ADMIN FUNCTIONS
    ///

    /**
     * @notice Set the game implementation address
     * @param _gameImplementation the new game implementation address
     */
    function setNewGameImplementation(address _gameImplementation) public onlyAdmin {
        latestGameImplementationVersionId += 1;
        gameImplementations.push(
            GameImplementationVersion({ id: latestGameImplementationVersionId, deployedAddress: _gameImplementation })
        );
    }

    /**
     * @notice Add some authorised amounts
     * @param _authorizedAmounts the list of authorised amounts to add
     */
    function addAuthorizedAmounts(uint256[] memory _authorizedAmounts) public onlyAdmin {
        for (uint256 i = 0; i < _authorizedAmounts.length; i++) {
            if (!_isExistAuthorizedAmounts(_authorizedAmounts[i])) {
                authorizedAmounts.push(_authorizedAmounts[i]);
                usedAuthorisedAmounts[_authorizedAmounts[i]] = AuthorizedAmount({
                    isUsed: false,
                    amount: _authorizedAmounts[i]
                });
            }
        }
    }

    /**
     * @notice Update the keeper address for the factory and all games and associated keeper job
     * @param _cronUpkeep the new keeper address
     */
    function updateCronUpkeep(address _cronUpkeep) public onlyAdmin {
        require(_cronUpkeep != address(0), "Keeper need to be initialised");

        cronUpkeep = _cronUpkeep;

        for (uint256 i = 0; i < deployedGames.length; i++) {
            Game memory game = deployedGames[i];
            GameImplementationInterface(payable(game.deployedAddress)).setCronUpkeep(cronUpkeep);
        }
        emit CronUpkeepUpdated(cronUpkeep);
    }

    /**
     * @notice Pause the factory and all games and associated keeper job
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
     */
    function transferAdminOwnership(address _adminAddress) public onlyAdmin {
        require(_adminAddress != address(0), "adminAddress need to be initialised");
        transferOwnership(_adminAddress);
    }

    /**
     * @notice Allow admin to withdraw all funds of smart contract
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
     * @notice Modifier that ensure that registration amount is part of allowed registration amounts
     * @param _registrationAmount the receiver for the funds (admin or factory)
     */
    modifier onlyAllowedRegistrationAmount(uint256 _registrationAmount) {
        require(
            usedAuthorisedAmounts[_registrationAmount].amount == _registrationAmount,
            "registrationAmout is not allowed"
        );
        _;
    }

    /**
     * @notice Modifier that ensure that registration amount is part of allowed registration amounts
     * @param _registrationAmount authorized amount
     */
    modifier onlyIfNotUsedRegistrationAmounts(uint256 _registrationAmount) {
        require(usedAuthorisedAmounts[_registrationAmount].isUsed == false, "registrationAmout is already used");
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
