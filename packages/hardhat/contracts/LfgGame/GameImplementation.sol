// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

contract GameImplementation {
    using Address for address;

    bool private _isBase;
    uint256 private randNonce;

    address public generalAdmin;
    address public creator;
    address public factory;
    address public keeper;

    mapping(address => Player) public players;
    mapping(uint256 => Winner) public gameWinners;

    Game public game;

    ///STRUCTS
    struct Game {
        bytes encodedCron;
        uint256 registrationAmount;
        uint256 houseEdge;
        uint256 creatorEdge;
        uint256 gameId;
        uint256 roundId;
        string gameName;
        string gameImage;
        uint256 gameImplementationVersion;
        uint256 playTimeRange;
        uint256 maxPlayers;
        uint256 numPlayers;
        bool gameInProgress;
        address[] playerAddresses;
    }

    struct Player {
        address playerAddress;
        uint256 roundRangeLowerLimit;
        uint256 roundRangeUpperLimit;
        bool hasPlayedRound;
        uint256 roundCount;
        bool hasLost;
        bool isSplitOk;
    }

    struct Winner {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        bool prizeClaimed;
    }

    struct Initialization {
        address _initializer;
        address _factoryOwner;
        address _cronUpkeep;
        uint256 _gameImplementationVersion;
        uint256 _gameId;
        uint256 _playTimeRange;
        uint256 _maxPlayers;
        uint256 _registrationAmount;
        uint256 _houseEdge;
        uint256 _creatorEdge;
        string _encodedCron;
    }

    ///EVENTS
    event RegisteredForGame(address playerAddress, uint256 playersCount);
    event StartedGame(uint256 timelock, uint256 playersCount);
    event ResetGame(uint256 timelock, uint256 resetGameId);
    event GameLost(uint256 roundId, address playerAddress, uint256 roundCount);
    event PlayedRound(address playerAddress);
    event GameWon(uint256 roundId, address playerAddress, uint256 amountWon);
    event FailedTransfer(address receiver, uint256 amount);
    event Received(address sender, uint256 amount);
    event GamePrizeClaimed(address claimer, uint256 roundId, uint256 amountClaimed);

    ///
    /// CONSTRUCTOR AND DEFAULT
    ///
    constructor() {
        _isBase = true;
    }

    function initialize(Initialization calldata initialization) external onlyIfNotBase onlyIfNotAlreadyInitialized {
        generalAdmin = initialization._factoryOwner;
        creator = initialization._initializer;
        factory = msg.sender;
        randNonce = 0;

        game.registrationAmount = initialization._registrationAmount;
        game.houseEdge = initialization._houseEdge;
        game.creatorEdge = initialization._creatorEdge;

        game.gameId = initialization._gameId;
        game.gameImplementationVersion = initialization._gameImplementationVersion;

        game.roundId = 0;
        game.playTimeRange = initialization._playTimeRange;
        game.maxPlayers = initialization._maxPlayers;

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        game.encodedCron = CronExternal.toEncodedSpec(initialization._encodedCron);
        game.cronUpkeep = initialization._cronUpkeep;

        CronUpkeepInterface(game.cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            game.encodedCron
        );
    }

    // TODO for development use remove in next smart contract version
    function startGame() external onlyCreatorOrAdmin onlyNotPaused onlyIfFull {
        _startGame();
    }

    ///
    /// MODIFIERS
    ///

    modifier onlyAdmin() {
        require(msg.sender == generalAdmin, "Caller is not the creator");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Caller is not the creator");
        _;
    }

    modifier onlyNotCreator() {
        require(msg.sender != creator, "Caller can't be the creator");
        _;
    }

    modifier onlyCreatorOrAdmin() {
        require(msg.sender == creator || msg.sender == generalAdmin, "Caller is not the creator or admin");
        _;
    }

    modifier onlyKeeperOrAdmin() {
        require(msg.sender == creator || msg.sender == generalAdmin, "Caller is not the keeper");
        _;
    }

    modifier onlyKeeper() {
        require(msg.sender == game.cronUpkeep, "Caller is not the keeper");
        _;
    }

    modifier onlyIfKeeperDataInit() {
        require(game.cronUpkeep != address(0), "Keeper need to be initialised");
        require(bytes(game.encodedCron).length != 0, "Keeper cron need to be initialised");
        _;
    }

    modifier onlyIfNotFull() {
        require(game.numPlayers < game.maxPlayers, "This game is full");
        _;
    }

    modifier onlyIfFull() {
        require(game.numPlayers == game.maxPlayers, "This game is not full");
        _;
    }

    modifier onlyIfNotAlreadyEntered() {
        require(players[msg.sender].playerAddress == address(0), "Player already entered in this game");
        _;
    }

    modifier onlyIfAlreadyEntered() {
        require(players[msg.sender].playerAddress != address(0), "Player has not entered in this game");
        _;
    }

    modifier onlyIfHasNotLost() {
        require(!players[msg.sender].hasLost, "Player has already lost");
        _;
    }

    modifier onlyIfHasNotPlayedThisRound() {
        require(!players[msg.sender].hasPlayedRound, "Player has already played in this round");
        _;
    }

    modifier onlyHumans() {
        uint256 size;
        address addr = msg.sender;
        assembly {
            size := extcodesize(addr)
        }
        require(size == 0, "No contract allowed");
        _;
    }

    modifier onlyRegistrationAmount() {
        require(msg.value == game.registrationAmount, "Only game amount is allowed");
        _;
    }

    // This makes sure we can't initialize the implementation contract.
    modifier onlyIfNotBase() {
        require(_isBase == false, "The implementation contract can't be initialized");
        _;
    }

    // This makes sure we can't initialize a cloned contract twice.
    modifier onlyIfNotAlreadyInitialized() {
        require(creator == address(0), "Contract already initialized");
        _;
    }

    modifier onlyNotPaused() {
        require(game.contractPaused != true, "Contract is paused");
        _;
    }

    modifier onlyPaused() {
        require(game.contractPaused != false, "Contract is not paused");
        _;
    }

    ///
    /// MAIN FUNCTIONS
    ///
    function registerForGame()
        external
        payable
        onlyHumans
        onlyNotPaused
        onlyIfNotFull
        onlyIfNotAlreadyEntered
        onlyRegistrationAmount
        onlyNotCreator
    {
        game.numPlayers++;
        players[msg.sender] = Player({
            playerAddress: msg.sender,
            roundCount: 0,
            hasPlayedRound: false,
            hasLost: false,
            isSplitOk: false,
            roundRangeUpperLimit: 0,
            roundRangeLowerLimit: 0
        });
        game.playerAddresses.push(msg.sender);

        emit RegisteredForGame(players[msg.sender].playerAddress, game.numPlayers);
    }

    function playRound()
        external
        onlyHumans
        onlyNotPaused
        onlyIfFull
        onlyIfAlreadyEntered
        onlyIfHasNotLost
        onlyIfHasNotPlayedThisRound
        onlyNotCreator
    {
        Player storage player = players[msg.sender];

        //Check if attempt is in the allowed time slot
        if (block.timestamp < player.roundRangeLowerLimit || block.timestamp > player.roundRangeUpperLimit) {
            _setPlayerAsHavingLost(player);
        } else {
            player.hasPlayedRound = true;
            player.roundCount += 1;
            emit PlayedRound(player.playerAddress);
        }
    }

    // TODO remoove onlyKeeperOrAdmin and make test works
    function triggerDailyCheckpoint() external onlyKeeperOrAdmin onlyNotPaused {
        // function triggerDailyCheckpoint() external onlyKeeper onlyNotPaused {
        if (game.gameInProgress == true) {
            _refreshPlayerStatus();
            _checkIfGameEnded();
        } else {
            if (game.numPlayers == game.maxPlayers) {
                _startGame();
            }
        }
    }

    function claimPrize(uint256 _roundId) external {
        require(_roundId <= game.roundId, "This game does not exist");
        require(msg.sender == gameWinners[_roundId].playerAddress, "Player did not win this game");
        require(gameWinners[_roundId].prizeClaimed == false, "Prize for this game already claimed");
        require(address(this).balance >= gameWinners[_roundId].amountWon, "Not enough funds in contract");

        gameWinners[_roundId].prizeClaimed = true;
        _safeTransfert(msg.sender, gameWinners[_roundId].amountWon);
        emit GamePrizeClaimed(msg.sender, gameWinners[_roundId].roundId, gameWinners[_roundId].amountWon);
    }

    ///
    /// INTERNAL FUNCTIONS
    ///
    function _startGame() internal {
        for (uint256 i = 0; i < game.numPlayers; i++) {
            Player storage player = players[game.playerAddresses[i]];
            _resetRoundRange(player);
        }

        game.gameInProgress = true;
        emit StartedGame(block.timestamp, game.numPlayers);
    }

    function _resetGame() internal {
        game.gameInProgress = false;
        for (uint256 i = 0; i < game.numPlayers; i++) {
            delete players[game.playerAddresses[i]];
            delete game.playerAddresses[i];
        }
        game.numPlayers = 0;

        emit ResetGame(block.timestamp, game.roundId);
        game.roundId += 1;
    }

    function _safeTransfert(address receiver, uint256 amount) internal {
        uint256 balance = address(this).balance;
        if (balance < amount) require(false, "Not enough in contract balance");

        (bool success, ) = receiver.call{ value: amount }("");

        if (!success) {
            emit FailedTransfer(receiver, amount);
            require(false, "Transfer failed.");
        }
    }

    function _checkIfGameEnded() internal {
        uint256 remainingPlayersCounter;
        address lastNonLoosingPlayerAddress;
        for (uint256 i = 0; i < game.numPlayers; i++) {
            Player memory currentPlayer = players[game.playerAddresses[i]];
            if (!currentPlayer.hasLost) {
                remainingPlayersCounter += 1;
                lastNonLoosingPlayerAddress = currentPlayer.playerAddress;
            }
        }

        //Game is over, set the last non loosing player as winner and reset game.
        if (remainingPlayersCounter == 1) {
            // TODO houseEdge + creatorEdge are cumultate.
            uint256 prize = game.registrationAmount * game.numPlayers - game.houseEdge - game.creatorEdge;
            gameWinners[game.roundId] = Winner({
                playerAddress: lastNonLoosingPlayerAddress,
                amountWon: prize,
                prizeClaimed: false,
                roundId: game.roundId
            });

            emit GameWon(game.roundId, lastNonLoosingPlayerAddress, prize);

            _resetGame();
        }

        // If no winner, the house keeps the prize and reset the game
        if (remainingPlayersCounter == 0) {
            _resetGame();
        }
    }

    function _refreshPlayerStatus() internal {
        for (uint256 i = 0; i < game.numPlayers; i++) {
            Player storage player = players[game.playerAddresses[i]];
            // Refresh player status to having lost if player has not played
            if (player.hasPlayedRound == false && player.hasLost == false) {
                _setPlayerAsHavingLost(player);
            } else {
                // Reset round limits and round status for each remaining user
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }
    }

    // This function returns a number between 0 and 24 minus the current length of a round
    function _randMod(address playerAddress) internal returns (uint256) {
        // increase nonce
        randNonce++;
        uint256 maxUpperRange = 25 - game.playTimeRange; // We use 25 because modulo excludes the higher limit
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, playerAddress, randNonce))) %
            maxUpperRange;
        return randomNumber;
    }

    function _resetRoundRange(Player storage player) internal {
        uint256 newRoundLowerLimit = _randMod(player.playerAddress);
        player.roundRangeLowerLimit = block.timestamp + newRoundLowerLimit * 60 * 60;
        player.roundRangeUpperLimit = player.roundRangeLowerLimit + game.playTimeRange * 60 * 60;
    }

    function _setPlayerAsHavingLost(Player storage player) internal {
        player.hasLost = true;
        player.isSplitOk = false;

        emit GameLost(game.roundId, player.playerAddress, player.roundCount);
    }

    /// CREATOR FUNCTIONS

    function setGameName(string calldata _gameName) external onlyCreator {
        game.gameName = _gameName;
    }

    function setGameImage(string calldata _gameImage) external onlyCreator {
        game.gameImage = _gameImage;
    }

    function withdrawCreatorEdge() external onlyCreator {
        require(address(this).balance >= game.creatorEdge);
        _safeTransfert(creator, game.creatorEdge);
    }

    /// ADMIN FUNCTIONS
    function withdrawAdminEdge() external onlyAdmin {
        require(address(this).balance >= game.houseEdge);
        _safeTransfert(generalAdmin, game.houseEdge);
    }

    ///
    /// EMERGENCY
    ///

    function withdrawFunds(address receiver) external onlyCreatorOrAdmin {
        _safeTransfert(receiver, address(this).balance);
    }

    ///
    /// SETTERS FUNCTIONS
    ///

    // TODO create a function to set keeper address & keeper cron
    function setCronUpkeep(address _cronUpkeep) public onlyCreatorOrAdmin {
        require(_cronUpkeep != address(0), "Keeper need to be initialised");
        // cronUpkeep = CronUpkeepInterface(_cronUpkeep);
        game.cronUpkeep = _cronUpkeep;
        // TODO add parameter to know if it's needed to register encodedCron again
    }

    function setEncodedCron(bytes memory _encodedCron) external onlyCreatorOrAdmin {
        game.encodedCron = _encodedCron;
    }

    function pause() external onlyCreatorOrAdmin onlyNotPaused {
        // TODO pause Keeper JOB
        game.contractPaused = true;
    }

    // TODO (Will need a big refactor for tests cases) reactivate to ensure that keeper is initialised
    // function unpause() external onlyCreatorOrAdmin onlyPaused onlyIfKeeperDataInit {
    function unpause() external onlyCreatorOrAdmin onlyPaused onlyIfKeeperDataInit {
        // TODO unpause Keeper JOB
        game.contractPaused = false;
    }

    ///
    /// GETTERS FUNCTIONS
    ///

    function getStatus() external view returns (Game memory) {
        return game;
    }

    function getPlayerAddresses() external view returns (address[] memory) {
        return game.playerAddresses;
    }

    function getPlayer(address player) external view returns (Player memory) {
        return players[player];
    }

    ///
    /// HELPERS FUNCTIONS
    ///

    function getRemainingPlayersCount() external view returns (uint256) {
        uint256 remainingPlayers = 0;
        for (uint256 i = 0; i < game.numPlayers; i++) {
            if (!players[game.playerAddresses[i]].hasLost) {
                remainingPlayers++;
            }
        }
        return remainingPlayers;
    }

    ///
    /// FALLBACK FUNCTIONS
    ///

    // Called for empty calldata (and any value)
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // Called when no other function matches (not even the receive function). Optionally payable
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }
}
