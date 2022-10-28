// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

// TODO REMOVE AFTER TEST
import "hardhat/console.sol";

// console.log("jobIdLength creating job %s", nextCronJobIDs);

contract GameImplementation {
    using Address for address;

    bool private _isBase;
    uint256 private randNonce;

    // TODO GUIGUI rename generalAdmin to factory?
    address public generalAdmin;
    address public creator;
    address public factory;

    address public cronUpkeep;
    bytes public encodedCron;
    uint256 private cronUpkeepJobId;

    uint256 public registrationAmount;
    uint256 public houseEdge;
    uint256 public creatorEdge;

    // gameId is fix and represent the fixed id for the game
    uint256 public gameId;
    // roundId gets incremented every time the game restarts
    uint256 public roundId;

    string public gameName;
    string public gameImage;

    uint256 public gameImplementationVersion;

    // Time length of a round in hours
    uint256 public playTimeRange;
    uint256 public maxPlayers;
    uint256 public numPlayers;

    // Helps the keeper determine if a game has started or if we need to start it
    bool public gameInProgress;
    bool public contractPaused;

    address[] public playerAddresses;
    mapping(address => Player) public players;
    mapping(uint256 => Winner) winners;

    ///STRUCTS
    struct Player {
        address playerAddress;
        uint256 roundRangeLowerLimit;
        uint256 roundRangeUpperLimit;
        bool hasPlayedRound;
        uint256 roundCount;
        bool hasLost;
        bool isSplitOk;
    }

    struct WinnerPlayerData {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        bool prizeClaimed;
    }

    struct Winner {
        address[] gameWinnerAddresses;
        mapping(address => WinnerPlayerData) gameWinners;
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
    event GameSplitted(uint256 roundId, address playerAddress, uint256 amountWon);
    event VoteToSplitPot(uint256 roundId, address playerAddress);
    event FailedTransfer(address receiver, uint256 amount);
    event Received(address sender, uint256 amount);
    event GamePrizeClaimed(address claimer, uint256 roundId, uint256 amountClaimed);
    event UpkeepUpdated(address cronUpkeep, string encodedCron, uint256 jobId);

    ///
    /// CONSTRUCTOR AND DEFAULT
    ///
    constructor() {
        _isBase = true;
    }

    // TODO GUIGUI add only admin here
    function initialize(Initialization calldata initialization) external onlyIfNotBase onlyIfNotAlreadyInitialized {
        // TODO create constant for max house edge
        // require(initialization._creatorEdge <= 5, "Creator Edge need to be less or equal to 10");

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        generalAdmin = initialization._factoryOwner;
        creator = initialization._initializer;
        factory = msg.sender;
        randNonce = 0;

        registrationAmount = initialization._registrationAmount;
        houseEdge = initialization._houseEdge;
        creatorEdge = initialization._creatorEdge;

        gameId = initialization._gameId;
        gameImplementationVersion = initialization._gameImplementationVersion;

        roundId = 0;
        playTimeRange = initialization._playTimeRange;
        maxPlayers = initialization._maxPlayers;

        encodedCron = CronExternal.toEncodedSpec(initialization._encodedCron);
        cronUpkeep = initialization._cronUpkeep;

        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    // TODO IMPORTANT for development use remove in next smart contract version
    function startGame() external onlyCreatorOrAdmin onlyNotPaused onlyIfFull {
        _startGame();
    }

    ///
    /// MAIN FUNCTIONS
    ///
    function registerForGame()
        external
        payable
        onlyHumans
        onlyNotPaused
        onlyIfGameIsNotInProgress
        onlyIfNotFull
        onlyIfNotAlreadyEntered
        onlyRegistrationAmount
        onlyNotCreator
    {
        numPlayers++;
        players[msg.sender] = Player({
            playerAddress: msg.sender,
            roundCount: 0,
            hasPlayedRound: false,
            hasLost: false,
            isSplitOk: false,
            roundRangeUpperLimit: 0,
            roundRangeLowerLimit: 0
        });
        playerAddresses.push(msg.sender);

        emit RegisteredForGame(players[msg.sender].playerAddress, numPlayers);
    }

    function playRound()
        external
        onlyHumans
        onlyNotPaused
        onlyIfGameIsInProgress
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

    function triggerDailyCheckpoint() external onlyKeeperOrAdmin onlyNotPaused onlyIfGameIsInProgress {
        // function triggerDailyCheckpoint() external onlyKeeper onlyNotPaused {
        if (gameInProgress == true) {
            _refreshPlayerStatus();
            _checkIfGameEnded();
        } else {
            if (numPlayers == maxPlayers) {
                _startGame();
            }
        }
    }

    function voteToSplitPot()
        external
        onlyIfGameIsInProgress
        onlyIfAlreadyEntered
        onlyIfHasNotLost
        onlyIfPlayersLowerHalfRemaining
    {
        players[msg.sender].isSplitOk = true;
        emit VoteToSplitPot(roundId, players[msg.sender].playerAddress);
    }

    function claimPrize(uint256 _roundId) external {
        WinnerPlayerData storage winnerPlayerData = winners[_roundId].gameWinners[msg.sender];

        // TODO pass all require to modifier
        require(_roundId <= roundId, "This game does not exist");
        require(winnerPlayerData.playerAddress == msg.sender, "Player did not win this game");
        require(winnerPlayerData.prizeClaimed == false, "Prize for this game already claimed");
        require(address(this).balance >= winnerPlayerData.amountWon, "Not enough funds in contract");

        winnerPlayerData.prizeClaimed = true;
        _safeTransfert(msg.sender, winnerPlayerData.amountWon);
        emit GamePrizeClaimed(msg.sender, _roundId, winnerPlayerData.amountWon);
    }

    ///
    /// INTERNAL FUNCTIONS
    ///
    function _startGame() internal {
        for (uint256 i = 0; i < numPlayers; i++) {
            Player storage player = players[playerAddresses[i]];
            _resetRoundRange(player);
        }

        gameInProgress = true;
        emit StartedGame(block.timestamp, numPlayers);
    }

    function _resetGame() internal {
        gameInProgress = false;
        for (uint256 i = 0; i < numPlayers; i++) {
            delete players[playerAddresses[i]];
            delete playerAddresses[i];
        }
        numPlayers = 0;

        emit ResetGame(block.timestamp, roundId);
        roundId += 1;
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
        // TODO houseEdge + creatorEdge are cumultate.
        uint256 prize = registrationAmount * numPlayers - houseEdge - creatorEdge;
        uint256 remainingPlayersCounter = 0;

        address lastNonLoosingPlayerAddress;
        for (uint256 i = 0; i < numPlayers; i++) {
            Player memory currentPlayer = players[playerAddresses[i]];
            if (!currentPlayer.hasLost) {
                remainingPlayersCounter += 1;
                lastNonLoosingPlayerAddress = currentPlayer.playerAddress;
            }
        }

        //Check if Game is over with one winner
        if (remainingPlayersCounter == 1) {
            Winner storage winner = winners[roundId];
            winner.gameWinners[lastNonLoosingPlayerAddress] = WinnerPlayerData({
                roundId: roundId,
                playerAddress: lastNonLoosingPlayerAddress,
                amountWon: prize,
                prizeClaimed: false
            });
            winner.gameWinnerAddresses.push(lastNonLoosingPlayerAddress);

            emit GameWon(roundId, lastNonLoosingPlayerAddress, prize);

            _resetGame();
        }

        // Check if remaining players have vote to split pot
        if (_isAllPlayersSplitOk()) {
            uint256 splittedPrize = prize / remainingPlayersCounter;

            Winner storage gameWinner = winners[roundId];

            for (uint256 i = 0; i < numPlayers; i++) {
                Player memory currentPlayer = players[playerAddresses[i]];
                if (!currentPlayer.hasLost && currentPlayer.isSplitOk) {
                    gameWinner.gameWinners[currentPlayer.playerAddress] = WinnerPlayerData({
                        roundId: roundId,
                        playerAddress: currentPlayer.playerAddress,
                        amountWon: splittedPrize,
                        prizeClaimed: false
                    });
                    gameWinner.gameWinnerAddresses.push(currentPlayer.playerAddress);

                    emit GameSplitted(roundId, currentPlayer.playerAddress, splittedPrize);
                }
            }
            _resetGame();
        }

        // If no winner, the house keeps the prize and reset the game
        if (remainingPlayersCounter == 0) {
            _resetGame();
        }
    }

    function _refreshPlayerStatus() internal {
        // if everyone is ok to split, we wait
        if (_isAllPlayersSplitOk()) return;

        for (uint256 i = 0; i < numPlayers; i++) {
            Player storage player = players[playerAddresses[i]];
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
        uint256 maxUpperRange = 25 - playTimeRange; // We use 25 because modulo excludes the higher limit
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, playerAddress, randNonce))) %
            maxUpperRange;
        return randomNumber;
    }

    function _resetRoundRange(Player storage player) internal {
        uint256 newRoundLowerLimit = _randMod(player.playerAddress);
        player.roundRangeLowerLimit = block.timestamp + newRoundLowerLimit * 60 * 60;
        player.roundRangeUpperLimit = player.roundRangeLowerLimit + playTimeRange * 60 * 60;
    }

    function _setPlayerAsHavingLost(Player storage player) internal {
        player.hasLost = true;
        player.isSplitOk = false;

        emit GameLost(roundId, player.playerAddress, player.roundCount);
    }

    function _isAllPlayersSplitOk() internal view returns (bool) {
        uint256 remainingPlayersSplitOkCounter = 0;
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        for (uint256 i = 0; i < numPlayers; i++) {
            Player memory currentPlayer = players[playerAddresses[i]];
            if (currentPlayer.isSplitOk) {
                remainingPlayersSplitOkCounter++;
            }
        }

        return remainingPlayersLength != 0 && remainingPlayersSplitOkCounter == remainingPlayersLength;
    }

    function _getRemainingPlayersCount() internal view returns (uint256) {
        uint256 remainingPlayers = 0;
        for (uint256 i = 0; i < numPlayers; i++) {
            if (!players[playerAddresses[i]].hasLost) {
                remainingPlayers++;
            }
        }
        return remainingPlayers;
    }

    ///
    /// SETTERS FUNCTIONS
    ///

    /// CREATOR FUNCTIONS

    function setGameName(string calldata _gameName) external onlyCreator {
        gameName = _gameName;
    }

    function setGameImage(string calldata _gameImage) external onlyCreator {
        gameImage = _gameImage;
    }

    // TODO GUIGUI (the game need to not be in progress)
    // function setMaxPlayers(uint256 _maxPlayers) external;

    function withdrawCreatorEdge() external onlyCreator {
        require(address(this).balance >= creatorEdge);
        _safeTransfert(creator, creatorEdge);
    }

    /// ADMIN FUNCTIONS
    function withdrawAdminEdge() external onlyAdmin {
        require(address(this).balance >= houseEdge);
        _safeTransfert(generalAdmin, houseEdge);
    }

    function updateUpKeep(address _cronUpkeep, string memory _encodedCron) external onlyAdmin {
        require(_cronUpkeep != address(0), "Keeper need to be initialised");
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        encodedCron = CronExternal.toEncodedSpec(_encodedCron);
        cronUpkeep = _cronUpkeep;

        CronUpkeepInterface(cronUpkeep).updateCronJob(
            cronUpkeepJobId,
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
        emit UpkeepUpdated(cronUpkeep, _encodedCron, 0);
    }

    function updateUpKeepCron(string memory _encodedCron) external onlyCreatorOrAdmin {
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        encodedCron = CronExternal.toEncodedSpec(_encodedCron);

        CronUpkeepInterface(cronUpkeep).updateCronJob(
            cronUpkeepJobId,
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
        emit UpkeepUpdated(cronUpkeep, _encodedCron, 0);
    }

    function pause() external onlyAdmin onlyNotPaused {
        // pause first to ensure no more interaction with contract
        contractPaused = true;
        CronUpkeepInterface(cronUpkeep).deleteCronJob(cronUpkeepJobId);
    }

    function unpause() external onlyAdmin onlyPaused onlyIfKeeperDataInit {
        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );

        // Reset round limits and round status for each remaining user
        for (uint256 i = 0; i < numPlayers; i++) {
            Player storage player = players[playerAddresses[i]];
            if (player.hasLost == false) {
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }

        // unpause last to ensure that everything is ok
        contractPaused = false;
    }

    ///
    /// GETTERS FUNCTIONS
    ///

    function getStatus()
        external
        view
        returns (
            address,
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool
        )
    {
        // uint256 balance = address(this).balance;

        return (
            creator,
            roundId,
            gameName,
            gameImage,
            numPlayers,
            maxPlayers,
            registrationAmount,
            playTimeRange,
            houseEdge,
            creatorEdge,
            contractPaused,
            gameInProgress
        );
    }

    function getPlayerAddresses() external view returns (address[] memory) {
        return playerAddresses;
    }

    function getPlayer(address player) external view returns (Player memory) {
        return players[player];
    }

    function getWinners(uint256 _roundId) external view onlyIfRoundId(_roundId) returns (WinnerPlayerData[] memory) {
        uint256 gameWinnerAddressesLength = winners[_roundId].gameWinnerAddresses.length;
        WinnerPlayerData[] memory winnersPlayerData = new WinnerPlayerData[](gameWinnerAddressesLength);

        for (uint256 i = 0; i < gameWinnerAddressesLength; i++) {
            address currentWinnerAddress = winners[_roundId].gameWinnerAddresses[i];
            winnersPlayerData[i] = winners[_roundId].gameWinners[currentWinnerAddress];
        }
        return winnersPlayerData;
    }

    function isAllPlayersSplitOk() external view returns (bool) {
        return _isAllPlayersSplitOk();
    }

    function getRemainingPlayersCount() external view returns (uint256) {
        return _getRemainingPlayersCount();
    }

    ///
    /// EMERGENCY
    ///

    function withdrawFunds(address receiver) external onlyCreatorOrAdmin {
        _safeTransfert(receiver, address(this).balance);
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

    ///
    /// MODIFIERS
    ///

    modifier onlyAdmin() {
        require(msg.sender == generalAdmin, "Caller is not the admin");
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
        require(msg.sender == cronUpkeep, "Caller is not the keeper");
        _;
    }

    modifier onlyIfKeeperDataInit() {
        require(cronUpkeep != address(0), "Keeper need to be initialised");
        require(bytes(encodedCron).length != 0, "Keeper cron need to be initialised");
        _;
    }

    modifier onlyIfNotFull() {
        require(numPlayers < maxPlayers, "This game is full");
        _;
    }

    modifier onlyIfFull() {
        require(numPlayers == maxPlayers, "This game is not full");
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

    modifier onlyIfPlayersLowerHalfRemaining() {
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        require(
            remainingPlayersLength <= maxPlayers / 2,
            "Remaining players must be less or equal than half of started players"
        );
        _;
    }

    modifier onlyIfGameIsInProgress() {
        // TODO GUIGUI
        // require(gameInProgress, "Game is not in progress");
        _;
    }

    modifier onlyIfGameIsNotInProgress() {
        // TODO GUIGUI
        // require(!gameInProgress, "Game is already in progress");
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
        require(msg.value == registrationAmount, "Only game amount is allowed");
        _;
    }

    modifier onlyIfRoundId(uint256 _roundId) {
        require(_roundId <= roundId, "Wrong roundId");
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
        require(!contractPaused, "Contract is paused");
        _;
    }

    modifier onlyPaused() {
        require(contractPaused, "Contract is not paused");
        _;
    }
}
