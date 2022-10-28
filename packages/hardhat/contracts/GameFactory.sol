// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import { GameImplementationInterface } from "./interfaces/GameImplementationInterface.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";

contract GameFactory is Pausable, Ownable {
    address public cronUpkeep;

    // TODO should be entered as percent
    uint256 public houseEdge;
    // TODO should be entered as percent
    uint256 public creatorEdge;
    uint256 public latestGameImplementationVersionId;
    GameImplementationVersion[] public gameImplementations;
    uint256 public gameId = 0;
    Game[] public deployedGames;

    uint256[] authorizedAmounts;
    mapping(uint256 => AuthorizedAmount) public usedAuthorisedAmounts;

    ///
    ///STRUCTS
    ///
    struct AuthorizedAmount {
        uint256 amount;
        bool isUsed;
    }
    struct GameImplementationVersion {
        uint256 id;
        address deployedAddress;
    }
    struct Game {
        uint256 id;
        uint256 versionId;
        address creator;
        address deployedAddress;
    }
    ///
    ///EVENTS
    ///
    event GameCreated(uint256 gameId, address gameAddress, uint256 implementationVersion, address creatorAddress);
    event FailedTransfer(address receiver, uint256 amount);

    constructor(
        address _gameImplementation,
        address _cronUpkeep,
        uint256 _houseEdge,
        uint256 _creatorEdge,
        uint256[] memory _authorizedAmounts
    ) onlyIfAuthorizedAmountsIsNotEmpty(_authorizedAmounts) {
        cronUpkeep = _cronUpkeep;

        houseEdge = _houseEdge;
        creatorEdge = _creatorEdge;
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
    /// MODIFIERS
    ///
    modifier onlyAdmin() {
        require(msg.sender == owner(), "Caller is not the admin");
        _;
    }
    modifier onlyAllowedNumberOfPlayers(uint256 _maxPlayers) {
        require(_maxPlayers > 1, "maxPlayers should be bigger than or equal to 2");
        require(_maxPlayers < 21, "maxPlayers should not be bigger than 20");
        _;
    }
    modifier onlyAllowedPlayTimeRange(uint256 _playTimeRange) {
        require(_playTimeRange > 0, "playTimeRange should be bigger than 0");
        require(_playTimeRange < 9, "playTimeRange should not be bigger than 8");
        _;
    }

    modifier onlyAllowedRegistrationAmount(uint256 _registrationAmount) {
        require(
            usedAuthorisedAmounts[_registrationAmount].amount == _registrationAmount,
            "registrationAmout is not allowed"
        );
        _;
    }

    modifier onlyIfNotUsedRegistrationAmounts(uint256 _registrationAmount) {
        require(usedAuthorisedAmounts[_registrationAmount].isUsed == false, "registrationAmout is already used");
        _;
    }

    modifier onlyIfAuthorizedAmountsIsNotEmpty(uint256[] memory _authorizedAmounts) {
        require(_authorizedAmounts.length >= 1, "authorizedAmounts should be greather or equal to 1");
        _;
    }

    ///
    ///BUSINESS LOGIC FUNCTIONS
    ///
    // TODO add Name and image url as argument to createNewGame & initialize functions
    function createNewGame(
        uint256 _maxPlayers,
        uint256 _playTimeRange,
        uint256 _registrationAmount,
        string memory _encodedCron
    )
        public
        whenNotPaused
        onlyAllowedNumberOfPlayers(_maxPlayers)
        onlyAllowedPlayTimeRange(_playTimeRange)
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
                _initializer: msg.sender,
                _factoryOwner: owner(),
                _cronUpkeep: cronUpkeep,
                _gameImplementationVersion: latestGameImplementationVersionId,
                _gameId: gameId,
                _playTimeRange: _playTimeRange,
                _maxPlayers: _maxPlayers,
                _registrationAmount: _registrationAmount,
                _houseEdge: houseEdge,
                _creatorEdge: creatorEdge,
                _encodedCron: _encodedCron
            })
        );
        deployedGames.push(
            Game({
                id: gameId,
                versionId: latestGameImplementationVersionId,
                creator: msg.sender,
                deployedAddress: newGameAddress
            })
        );
        emit GameCreated(gameId, newGameAddress, latestGameImplementationVersionId, msg.sender);
        gameId += 1;
        usedAuthorisedAmounts[_registrationAmount].isUsed = true;
        return newGameAddress;
    }

    ///
    ///INTERNAL FUNCTIONS
    ///
    function _safeTransfert(address receiver, uint256 amount) internal {
        uint256 balance = address(this).balance;
        if (balance < amount) require(false, "Not enough in contract balance");
        (bool success, ) = receiver.call{ value: amount }("");
        if (!success) {
            emit FailedTransfer(receiver, amount);
            require(false, "Transfer failed.");
        }
    }

    function _isExistAuthorizedAmounts(uint256 _authorizedAmount) internal view returns (bool) {
        for (uint256 i = 0; i < authorizedAmounts.length; i++) {
            if (authorizedAmounts[i] == _authorizedAmount) {
                return true;
            }
        }
        return false;
    }

    ///
    ///ADMIN FUNCTIONS
    ///
    function setAdmin(address _adminAddress) public onlyAdmin {
        transferOwnership(_adminAddress);
    }

    function setCronUpkeep(address _cronUpkeep) public onlyAdmin {
        require(_cronUpkeep != address(0), "Keeper need to be initialised");
        cronUpkeep = _cronUpkeep;
        // TODO set cronUpKeep for all Games
        // TODO add parameter to know if it's needed to register encodedCron again
    }

    function withdrawFunds(address receiver) public onlyAdmin {
        _safeTransfert(receiver, address(this).balance);
    }

    function setNewGameImplementation(address _gameImplementation) public onlyAdmin {
        latestGameImplementationVersionId += 1;
        gameImplementations.push(
            GameImplementationVersion({ id: latestGameImplementationVersionId, deployedAddress: _gameImplementation })
        );
    }

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

    // TODO create a function to pause all games and the cronupKeep

    function pause() public onlyAdmin whenNotPaused {
        _pause();
    }

    function unpause() public onlyAdmin whenPaused {
        _unpause();
    }

    ///
    ///GETTER FUNCTIONS
    ///
    function getDeployedGames() external view returns (Game[] memory) {
        return deployedGames;
    }

    function getAuthorisedAmounts() external view returns (uint256[] memory) {
        return authorizedAmounts;
    }

    function getAuthorisedAmount(uint256 _authorizedAmount) external view returns (AuthorizedAmount memory) {
        return usedAuthorisedAmounts[_authorizedAmount];
    }
}
