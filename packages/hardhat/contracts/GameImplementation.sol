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

    address public owner;
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
    /**
     * @notice Player structure that contain all usefull data for a player
     */
    struct Player {
        address playerAddress;
        uint256 roundRangeLowerLimit;
        uint256 roundRangeUpperLimit;
        bool hasPlayedRound;
        uint256 roundCount;
        bool hasLost;
        bool isSplitOk;
    }

    /**
     * @notice WinnerPlayerData structure that contain all usefull data for a winner
     */
    struct WinnerPlayerData {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        bool prizeClaimed;
    }

    /**
     * @notice Winner structure that contain a list of winner for a current roundId
     */
    struct Winner {
        address[] gameWinnerAddresses;
        mapping(address => WinnerPlayerData) gameWinners;
    }

    /**
     * @notice Initialization structure that contain all the data that are needed to create a new game
     */
    struct Initialization {
        address _owner;
        address _creator;
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

    ///
    ///EVENTS
    ///

    /**
     * @notice Called when a player has registered for a game
     */
    event RegisteredForGame(address playerAddress, uint256 playersCount);
    /**
     * @notice Called when the keeper start the game
     */
    event StartedGame(uint256 timelock, uint256 playersCount);
    /**
     * @notice Called when the keeper reset the game
     */
    event ResetGame(uint256 timelock, uint256 resetGameId);
    /**
     * @notice Called when a player lost a game
     */
    event GameLost(uint256 roundId, address playerAddress, uint256 roundCount);
    /**
     * @notice Called when a player play a round
     */
    event PlayedRound(address playerAddress);
    /**
     * @notice Called when a player won the game
     */
    event GameWon(uint256 roundId, address playerAddress, uint256 amountWon);
    /**
     * @notice Called when some player(s) split the game
     */
    event GameSplitted(uint256 roundId, address playerAddress, uint256 amountWon);
    /**
     * @notice Called when a player vote to split pot
     */
    event VoteToSplitPot(uint256 roundId, address playerAddress);
    /**
     * @notice Called when a transfert have failed
     */
    event FailedTransfer(address receiver, uint256 amount);
    /**
     * @notice Called when the contract have receive funds via receive() or fallback() function
     */
    event Received(address sender, uint256 amount);
    /**
     * @notice Called when a player have claimed his prize
     */
    event GamePrizeClaimed(address claimer, uint256 roundId, uint256 amountClaimed);
    /**
     * @notice Called when the creator or admin update encodedCron
     */
    event EncodedCronUpdated(uint256 jobId, string encodedCron);
    /**
     * @notice Called when the factory or admin update cronUpkeep
     */
    event CronUpkeepUpdated(uint256 jobId, address cronUpkeep);

    ///
    /// CONSTRUCTOR AND INITIALISATION
    ///
    /**
     * @notice Constructor the is tagged ad base
     * Base can only been initialised once
     */
    constructor() {
        _isBase = true;
    }

    /**
     * @notice Create a new Game Implementation by cloning the base contract
     * @param initialization the initialisation data with params as follow :
     *  @param initialization._creator the game creator
     *  @param initialization._owner the general admin address
     *  @param initialization._cronUpkeep the cron upkeep address
     *  @param initialization._gameImplementationVersion the version of the game implementation
     *  @param initialization._gameId the unique game id (fix)
     *  @param initialization._playTimeRange the time range during which a player can play in hour
     *  @param initialization._maxPlayers the maximum number of players for a game
     *  @param initialization._registrationAmount the amount that players will need to pay to enter in the game
     *  @param initialization._houseEdge the house edge in percent
     *  @param initialization._creatorEdge creator edge in percent
     *  @param initialization._encodedCron the cron string
     */
    function initialize(Initialization calldata initialization)
        external
        onlyIfNotBase
        onlyIfNotAlreadyInitialized
        onlyAllowedNumberOfPlayers(initialization._maxPlayers)
        onlyAllowedPlayTimeRange(initialization._playTimeRange)
    {
        // TODO create modifier for this require
        // TODO create constant for max house edge
        // require(initialization._creatorEdge <= 5, "Creator Edge need to be less or equal to 10");

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        owner = initialization._owner;
        creator = initialization._creator;
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

    /**
     * @notice Function that is called by the keeper when game is ready to start
     *  TODO IMPORTANT for development use remove in next smart contract version
     */
    function startGame() external onlyAdminOrCreator onlyNotPaused onlyIfFull {
        _startGame();
    }

    ///
    /// MAIN FUNCTIONS
    ///

    /**
     * @notice Function that allow players to register for a game
     */
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

    /**
     * @notice Function that allow players to play for the current round
     */
    function playRound()
        external
        onlyHumans
        onlyNotPaused
        onlyIfFull
        onlyIfAlreadyEntered
        onlyIfHasNotLost
        onlyIfHasNotPlayedThisRound
        onlyNotCreator
        onlyIfGameIsInProgress
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

    /**
     * @notice Function that is called by the keeper based on the keeper cron
     */
    function triggerDailyCheckpoint() external onlyAdminOrKeeper onlyNotPaused {
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

    /**
     * @notice Function that allow player to vote to split pot
     * Only callable if less than 50% of the players remain
     */
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

    /**
     * @notice Function that is called by a winner to claim his prize
     */
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

    /**
     * @notice Start the game(called when all conditions are ok)
     */
    function _startGame() internal {
        for (uint256 i = 0; i < numPlayers; i++) {
            Player storage player = players[playerAddresses[i]];
            _resetRoundRange(player);
        }

        gameInProgress = true;
        emit StartedGame(block.timestamp, numPlayers);
    }

    /**
     * @notice Reset the game (called at the end of the current game)
     */
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
     * @notice Check if game as ended
     * If so, it will create winners and reset the game
     */
    function _checkIfGameEnded() internal {
        // TODO GUIGUI houseEdge + creatorEdge are cumultate.
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

    /**
     * @notice Refresh players status for remaining players
     */
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

    /**
     * @notice Returns a number between 0 and 24 minus the current length of a round
     * @param playerAddress the player address
     * @return the generated number
     */
    function _randMod(address playerAddress) internal returns (uint256) {
        // increase nonce
        randNonce++;
        uint256 maxUpperRange = 25 - playTimeRange; // We use 25 because modulo excludes the higher limit
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, playerAddress, randNonce))) %
            maxUpperRange;
        return randomNumber;
    }

    /**
     * @notice Reset the round range for a player
     * @param player the player
     */
    function _resetRoundRange(Player storage player) internal {
        uint256 newRoundLowerLimit = _randMod(player.playerAddress);
        player.roundRangeLowerLimit = block.timestamp + newRoundLowerLimit * 60 * 60;
        player.roundRangeUpperLimit = player.roundRangeLowerLimit + playTimeRange * 60 * 60;
    }

    /**
     * @notice Update looser player
     * @param player the player
     */
    function _setPlayerAsHavingLost(Player storage player) internal {
        player.hasLost = true;
        player.isSplitOk = false;

        emit GameLost(roundId, player.playerAddress, player.roundCount);
    }

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return true if all remaining players are ok to split pot, false otherwise
     */
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

    /**
     * @notice Get the number of remaining players for the current game
     * @return the number of remaining players for the current game
     */
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
    /// GETTERS FUNCTIONS
    ///

    /**
     * @notice Return game informations
     */
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

    /**
     * @notice Return the players addresses for the current game
     * @return list of players addresses
     */
    function getPlayerAddresses() external view returns (address[] memory) {
        return playerAddresses;
    }

    /**
     * @notice Return a player for the current game
     * @param player the player address
     * @return player if finded
     */
    function getPlayer(address player) external view returns (Player memory) {
        return players[player];
    }

    /**
     * @notice Return the winners for a round id
     * @param _roundId the round id
     * @return list of WinnerPlayerData
     */
    function getWinners(uint256 _roundId) external view onlyIfRoundId(_roundId) returns (WinnerPlayerData[] memory) {
        uint256 gameWinnerAddressesLength = winners[_roundId].gameWinnerAddresses.length;
        WinnerPlayerData[] memory winnersPlayerData = new WinnerPlayerData[](gameWinnerAddressesLength);

        for (uint256 i = 0; i < gameWinnerAddressesLength; i++) {
            address currentWinnerAddress = winners[_roundId].gameWinnerAddresses[i];
            winnersPlayerData[i] = winners[_roundId].gameWinners[currentWinnerAddress];
        }
        return winnersPlayerData;
    }

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return true if all remaining players are ok to split pot, false otherwise
     */
    function isAllPlayersSplitOk() external view returns (bool) {
        return _isAllPlayersSplitOk();
    }

    /**
     * @notice Get the number of remaining players for the current game
     * @return the number of remaining players for the current game
     */
    function getRemainingPlayersCount() external view returns (uint256) {
        return _getRemainingPlayersCount();
    }

    ///
    /// SETTERS FUNCTIONS
    ///

    /**
     * @notice Set the name of the game
     * @param _gameName the new game name
     */
    function setGameName(string calldata _gameName) external onlyCreator {
        gameName = _gameName;
    }

    /**
     * @notice Set the image of the game
     * @param _gameImage the new game image
     */
    function setGameImage(string calldata _gameImage) external onlyCreator {
        gameImage = _gameImage;
    }

    /**
     * @notice Set the maximum allowed players for the game
     * @param _maxPlayers the new max players limit
     */
    function setMaxPlayers(uint256 _maxPlayers)
        external
        onlyAdminOrCreator
        onlyAllowedNumberOfPlayers(_maxPlayers)
        onlyIfGameIsNotInProgress
    {
        maxPlayers = _maxPlayers;
    }

    /**
     * @notice Set the creator edge for the game
     * @param _creatorEdge the new creator edge in %
     */
    function setCreatorEdge(uint256 _creatorEdge) external onlyAdminOrCreator onlyIfGameIsNotInProgress {
        // TODO create modifier for this require
        // TODO create constant for max house edge
        // require(initialization._creatorEdge <= 5, "Creator Edge need to be less or equal to 10");

        creatorEdge = _creatorEdge;
    }

    /**
     * @notice Allow creator to withdraw his Edge
     */
    function withdrawCreatorEdge() external onlyCreator {
        // TODO Guigui handle better creatorEdge management to avoid multipl withdraw
        // count each creator edge part balance at the start of each game. If the amount is withdrawn, the creator edge balance is set to zero
        require(address(this).balance >= creatorEdge);
        _safeTransfert(creator, creatorEdge);
    }

    ///
    /// ADMIN FUNCTIONS
    ///

    /**
     * @notice Withdraw Admin Edge
     */
    function withdrawAdminEdge() external onlyAdmin {
        // TODO Guigui handle better houseEdge management to avoid multipl withdraw
        // count each house edge part balance at the start of each game. If the amount is withdrawn, the house edge balance is set to zero
        require(address(this).balance >= houseEdge);
        _safeTransfert(owner, houseEdge);
    }

    /**
     * @notice Withdraw Admin edge and send it to factory
     */
    function withdrawAdminEdgToFactory() external onlyFactory {
        require(address(this).balance >= houseEdge);
        _safeTransfert(factory, houseEdge);
    }

    /**
     * @notice Set the house edge for the game
     * @param _houseEdge the new house edge in %
     */
    function setHouseEdge(uint256 _houseEdge) external onlyAdmin onlyIfGameIsNotInProgress {
        houseEdge = _houseEdge;
    }

    /**
     * @notice Set the keeper address
     * @param _cronUpkeep the new keeper address
     */
    function setCronUpkeep(address _cronUpkeep) external onlyAdminOrFactory {
        require(_cronUpkeep != address(0), "Keeper need to be initialised");

        // TODO verify cron limitation : not less than every hour
        // verify that should not contains "*/" in first value
        // Pattern is : * * * * *
        // https://stackoverflow.com/questions/44179638/string-conversion-to-array-in-solidity

        cronUpkeep = _cronUpkeep;

        CronUpkeepInterface(cronUpkeep).updateCronJob(
            cronUpkeepJobId,
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
        emit CronUpkeepUpdated(cronUpkeepJobId, cronUpkeep);
    }

    /**
     * @notice Set the encoded cron
     * @param _encodedCron the new encoded cron
     */
    function setEncodedCron(string memory _encodedCron) external onlyAdminOrCreator {
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
        emit EncodedCronUpdated(cronUpkeepJobId, _encodedCron);
    }

    /**
     * @notice Pause the current game and associated keeper job
     */
    function pause() external onlyAdmin onlyNotPaused {
        // pause first to ensure no more interaction with contract
        contractPaused = true;
        CronUpkeepInterface(cronUpkeep).deleteCronJob(cronUpkeepJobId);
    }

    /**
     * @notice Unpause the current game and associated keeper job
     */
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
    /// EMERGENCY
    ///

    /**
     * @notice Transfert Admin Ownership
     * @param _adminAddress the new admin address
     */
    function transferAdminOwnership(address _adminAddress) public onlyAdmin {
        require(_adminAddress != address(0), "adminAddress need to be initialised");
        owner = _adminAddress;
    }

    /**
     * @notice Transfert Creator Ownership
     * @param _creator the new creator address
     */
    function transferCreatorOwnership(address _creator) public onlyCreator {
        require(_creator != address(0), "creator need to be initialised");
        creator = _creator;
    }

    /**
     * @notice Transfert Factory Ownership
     * @param _factory the new factory address
     */
    function transferFactoryOwnership(address _factory) public onlyCreator {
        require(_factory != address(0), "factory need to be initialised");
        factory = _factory;
    }

    /**
     * @notice Allow admin to withdraw all funds of smart contract
     * @param receiver the receiver for the funds (admin or factory)
     */
    function withdrawFunds(address receiver) external onlyAdminOrFactory {
        _safeTransfert(receiver, address(this).balance);
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
        require(msg.sender == owner, "Caller is not the admin");
        _;
    }

    /**
     * @notice Modifier that ensure only creator can access this function
     */
    modifier onlyCreator() {
        require(msg.sender == creator, "Caller is not the creator");
        _;
    }

    /**
     * @notice Modifier that ensure only factory can access this function
     */
    modifier onlyFactory() {
        require(msg.sender == factory, "Caller is not the factory");
        _;
    }

    /**
     * @notice Modifier that ensure only not creator can access this function
     */
    modifier onlyNotCreator() {
        require(msg.sender != creator, "Caller can't be the creator");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or creator can access this function
     */
    modifier onlyAdminOrCreator() {
        require(msg.sender == creator || msg.sender == owner, "Caller is not the creator or admin");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or keeper can access this function
     */
    modifier onlyAdminOrKeeper() {
        require(msg.sender == creator || msg.sender == owner, "Caller is not the keeper");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or factory can access this function
     */
    modifier onlyAdminOrFactory() {
        require(msg.sender == factory || msg.sender == owner, "Caller is not the factory or admin");
        _;
    }

    /**
     * @notice Modifier that ensure only keeper can access this function
     */
    modifier onlyKeeper() {
        require(msg.sender == cronUpkeep, "Caller is not the keeper");
        _;
    }

    /**
     * @notice Modifier that ensure that keeper data are initialised
     */
    modifier onlyIfKeeperDataInit() {
        require(cronUpkeep != address(0), "Keeper need to be initialised");
        require(bytes(encodedCron).length != 0, "Keeper cron need to be initialised");
        _;
    }

    /**
     * @notice Modifier that ensure that game is not full
     */
    modifier onlyIfNotFull() {
        require(numPlayers < maxPlayers, "This game is full");
        _;
    }

    /**
     * @notice Modifier that ensure that game is full
     */
    modifier onlyIfFull() {
        require(numPlayers == maxPlayers, "This game is not full");
        _;
    }

    /**
     * @notice Modifier that ensure that player not already entered in the game
     */
    modifier onlyIfNotAlreadyEntered() {
        require(players[msg.sender].playerAddress == address(0), "Player already entered in this game");
        _;
    }

    /**
     * @notice Modifier that ensure that player already entered in the game
     */
    modifier onlyIfAlreadyEntered() {
        require(players[msg.sender].playerAddress != address(0), "Player has not entered in this game");
        _;
    }

    /**
     * @notice Modifier that ensure that player has not lost
     */
    modifier onlyIfHasNotLost() {
        require(!players[msg.sender].hasLost, "Player has already lost");
        _;
    }

    /**
     * @notice Modifier that ensure that player has not already played this round
     */
    modifier onlyIfHasNotPlayedThisRound() {
        require(!players[msg.sender].hasPlayedRound, "Player has already played in this round");
        _;
    }

    /**
     * @notice Modifier that ensure that there is less than 50% of remaining players
     */
    modifier onlyIfPlayersLowerHalfRemaining() {
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        require(
            remainingPlayersLength <= maxPlayers / 2,
            "Remaining players must be less or equal than half of started players"
        );
        _;
    }

    /**
     * @notice Modifier that ensure that the game is in progress
     */
    modifier onlyIfGameIsInProgress() {
        require(gameInProgress, "Game is not in progress");
        _;
    }

    /**
     * @notice Modifier that ensure that the game is not in progress
     */
    modifier onlyIfGameIsNotInProgress() {
        require(!gameInProgress, "Game is already in progress");
        _;
    }

    /**
     * @notice Modifier that ensure that caller is not a smart contract
     */
    modifier onlyHumans() {
        uint256 size;
        address addr = msg.sender;
        assembly {
            size := extcodesize(addr)
        }
        require(size == 0, "No contract allowed");
        _;
    }

    /**
     * @notice Modifier that ensure that amount sended is registration amount
     */
    modifier onlyRegistrationAmount() {
        require(msg.value == registrationAmount, "Only game amount is allowed");
        _;
    }

    /**
     * @notice Modifier that ensure that roundId exist
     */
    modifier onlyIfRoundId(uint256 _roundId) {
        require(_roundId <= roundId, "Wrong roundId");
        _;
    }

    /**
     * @notice Modifier that ensure that we can't initialize the implementation contract
     */
    modifier onlyIfNotBase() {
        require(_isBase == false, "The implementation contract can't be initialized");
        _;
    }

    /**
     * @notice Modifier that ensure that we can't initialize a cloned contract twice
     */
    modifier onlyIfNotAlreadyInitialized() {
        require(creator == address(0), "Contract already initialized");
        _;
    }

    /**
     * @notice Modifier that ensure that max players is in allowed range
     */
    modifier onlyAllowedNumberOfPlayers(uint256 _maxPlayers) {
        require(_maxPlayers > 1, "maxPlayers should be bigger than or equal to 2");
        require(_maxPlayers <= 100, "maxPlayers should not be bigger than 100");
        _;
    }

    /**
     * @notice Modifier that ensure that play time range is in allowed range
     */
    modifier onlyAllowedPlayTimeRange(uint256 _playTimeRange) {
        require(_playTimeRange > 0, "playTimeRange should be bigger than 0");
        require(_playTimeRange < 9, "playTimeRange should not be bigger than 8");
        _;
    }

    /**
     * @notice Modifier that ensure that game is not paused
     */
    modifier onlyNotPaused() {
        require(!contractPaused, "Contract is paused");
        _;
    }

    /**
     * @notice Modifier that ensure that game is paused
     */
    modifier onlyPaused() {
        require(contractPaused, "Contract is not paused");
        _;
    }
}
