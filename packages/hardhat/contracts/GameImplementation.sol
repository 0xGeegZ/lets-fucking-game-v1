// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

import "hardhat/console.sol";

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

    uint256 public constant MAX_TREASURY_FEE = 1000; // 10%
    uint256 public constant MAX_CREATOR_FEE = 500; // 5%

    uint256 public treasuryFee; // treasury rate (e.g. 200 = 2%, 150 = 1.50%)
    uint256 public treasuryAmount; // treasury amount that was not claimed

    uint256 public creatorFee; // treasury rate (e.g. 200 = 2%, 150 = 1.50%)
    uint256 public creatorAmount; // treasury amount that was not claimed

    uint256 public gameId; // gameId is fix and represent the fixed id for the game
    uint256 public roundId; // roundId gets incremented every time the game restarts

    string public gameName;
    string public gameImage;

    uint256 public gameImplementationVersion;

    uint256 public playTimeRange; // Time length of a round in hours

    uint256 public maxPlayers;
    // TODO GUIGUI LAST remove numPlayers to replace it by players.length ??
    uint256 public numPlayers;

    bool public gameInProgress; // Helps the keeper determine if a game has started or if we need to start it
    bool public contractPaused;

    address[] public playerAddresses;
    mapping(address => Player) public players;
    mapping(uint256 => Winner) winners;
    mapping(uint256 => Prize) prizes;

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
        uint256 position;
        bool hasLost;
        bool isSplitOk;
    }

    /**
     * @notice WinnerDetail structure that contain all usefull data for a winner
     */
    struct WinnerDetail {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        uint256 position;
        bool prizeClaimed;
    }

    /**
     * @notice Winner structure that contain a list of winners for the current roundId
     */
    struct Winner {
        uint256 winnersCounter;
        mapping(uint256 => WinnerDetail) winnerDetails;
    }

    /**
     * @notice PrizeStandard ENUM
     */
    enum PrizeStandard {
        STANDARD,
        ERC20,
        ERC721,
        ERC1155
    }
    /**
     * @notice PrizeDetail structure that contain the prize information
     */
    struct PrizeDetail {
        uint256 position;
        uint256 amount;
        /*
         * This will return a single integer between 0 and 5.
         * The numbers represent different ‘states’ a name is currently in.
         * 0 - STANDARD
         * 1 - ERC20
         * 2 - ERC721
         * 3 - ERC1155
         */
        uint256 standard;
        // TODO NEXT VERSION USE ENUM
        // PrizeStandard standard;
        address contractAddress;
        uint256 tokenId;
    }

    /**
     * @notice Prize structure that contain a list of prizes for the current roundId
     */
    struct Prize {
        uint256 prizesCounter;
        mapping(uint256 => PrizeDetail) prizeDetails;
    }

    /**
     * @notice Initialization structure that contain all the data that are needed to create a new game
     */
    struct Initialization {
        address owner;
        address creator;
        address cronUpkeep;
        string gameName;
        string gameImage;
        uint256 gameImplementationVersion;
        uint256 gameId;
        uint256 playTimeRange;
        uint256 maxPlayers;
        uint256 registrationAmount;
        uint256 treasuryFee;
        uint256 creatorFee;
        string encodedCron;
        PrizeDetail[] prizeDetails;
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
    event GameWon(uint256 roundId, uint256 winnersCounter, address playerAddress, uint256 amountWon);
    /**
     * @notice Called when some player(s) split the game
     */
    event GameSplitted(uint256 roundId, uint256 remainingPlayersCount, uint256 amountWon);
    /**
     * @notice Called when a player vote to split pot
     */
    event VoteToSplitPot(uint256 roundId, address playerAddress);
    /**
     * @notice Called when a prize is added
     */
    event PrizeAdded(
        uint256 roundId,
        uint256 position,
        uint256 amount,
        uint256 standard,
        address contractAddress,
        uint256 tokenId
    );
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
     * @notice Called when the treasury fee are claimed
     */
    event TreasuryFeeClaimed(uint256 amount);
    /**
     * @notice Called when the treasury fee are claimed by factory
     */
    event TreasuryFeeClaimedByFactory(uint256 amount);
    /**
     * @notice Called when the creator fee are claimed
     */
    event CreatorFeeClaimed(uint256 amount);
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
     * @notice Constructor that define itself as base
     */
    constructor() {
        _isBase = true;
    }

    /**
     * @notice Create a new Game Implementation by cloning the base contract
     * @param _initialization the initialisation data with params as follow :
     *  @param _initialization.creator the game creator
     *  @param _initialization.owner the general admin address
     *  @param _initialization.cronUpkeep the cron upkeep address
     *  @param _initialization.gameName the game name
     *  @param _initialization.gameImage the game image path
     *  @param _initialization.gameImplementationVersion the version of the game implementation
     *  @param _initialization.gameId the unique game id (fix)
     *  @param _initialization.playTimeRange the time range during which a player can play in hour
     *  @param _initialization.maxPlayers the maximum number of players for a game
     *  @param _initialization.registrationAmount the amount that players will need to pay to enter in the game
     *  @param _initialization.treasuryFee the treasury fee in percent
     *  @param _initialization.creatorFee creator fee in percent
     *  @param _initialization.encodedCron the cron string
     *  @param _initialization.prizeDetails the cron string
     * @dev TODO NEXT VERSION Remove _isGameAllPrizesStandard limitation to include other prize typ
     */
    function initialize(Initialization calldata _initialization)
        external
        onlyIfNotBase
        // TODO Only Factory ?
        onlyIfNotAlreadyInitialized
        onlyAllowedNumberOfPlayers(_initialization.maxPlayers)
        onlyAllowedPlayTimeRange(_initialization.playTimeRange)
        onlyTreasuryFee(_initialization.treasuryFee)
        onlyCreatorFee(_initialization.creatorFee)
        onlyIfPrizeDetailsParam(_initialization.prizeDetails)
    // todo only if smg.value right amount if game is not payable and standard prize
    {
        owner = _initialization.owner;
        creator = _initialization.creator;
        factory = msg.sender;

        gameName = _initialization.gameName;
        gameImage = _initialization.gameImage;

        randNonce = 0;

        registrationAmount = _initialization.registrationAmount;
        treasuryFee = _initialization.treasuryFee;
        creatorFee = _initialization.creatorFee;

        treasuryAmount = 0;
        creatorAmount = 0;

        gameId = _initialization.gameId;
        gameImplementationVersion = _initialization.gameImplementationVersion;

        roundId = 0;
        playTimeRange = _initialization.playTimeRange;
        maxPlayers = _initialization.maxPlayers;

        encodedCron = CronExternal.toEncodedSpec(_initialization.encodedCron);
        cronUpkeep = _initialization.cronUpkeep;

        // Setup prizes structure
        _addPrizes(_initialization.prizeDetails);

        // Verify Game Configuration :
        // Game can only be payable only if also standard
        // OR Game can be not payable and everything else
        require((_isGamePayable() && _isGameAllPrizesStandard()) || !_isGamePayable(), "Configuration missmatch");

        // Limitation for current version as standard for NFT is not implemented
        require(_isGameAllPrizesStandard(), "This version only allow standard prize");

        // Register the keeper job
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
     * @dev TODO NEXT VERSION remove this function in next smart contract version
     */
    function startGame() external onlyAdminOrCreator onlyNotPaused onlyIfFull {
        _startGame();
    }

    ///
    /// MAIN FUNCTIONS
    ///

    /**
     * @notice Function that allow players to register for a game
     * @dev Creator cannot register for his own game
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
            position: maxPlayers,
            roundRangeUpperLimit: 0,
            roundRangeLowerLimit: 0
        });
        playerAddresses.push(msg.sender);

        emit RegisteredForGame(players[msg.sender].playerAddress, numPlayers);
    }

    /**
     * @notice Function that allow players to play for the current round
     * @dev Creator cannot play for his own game
     * @dev Callable by remaining players
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
        if (block.timestamp < player.roundRangeLowerLimit || block.timestamp > player.roundRangeUpperLimit)
            _setPlayerAsHavingLost(player);
        else {
            player.hasPlayedRound = true;
            player.roundCount += 1;
            emit PlayedRound(player.playerAddress);
        }
    }

    /**
     * @notice Function that is called by the keeper based on the keeper cron
     * @dev Callable by admin or keeper
     */
    function triggerDailyCheckpoint() external onlyAdminOrKeeper onlyNotPaused {
        // function triggerDailyCheckpoint() external onlyKeeper onlyNotPaused {
        if (gameInProgress == true) {
            _refreshPlayerStatus();
            _checkIfGameEnded();
        } else if (numPlayers == maxPlayers) _startGame();
    }

    /**
     * @notice Function that allow player to vote to split pot
     * @dev Only callable if less than 50% of the players remain
     * @dev Callable by remaining players
     */
    function voteToSplitPot()
        external
        onlyIfGameIsInProgress
        onlyIfAlreadyEntered
        onlyIfHasNotLost
        onlyIfPlayersLowerHalfRemaining
        onlyIfGameIsSplittable
    {
        players[msg.sender].isSplitOk = true;
        emit VoteToSplitPot(roundId, players[msg.sender].playerAddress);
    }

    /**
     * @notice Function that is called by a winner to claim his prize
     * @dev TODO NEXT VERSION Update claim process according to prize type
     */
    function claimPrize(uint256 _roundId) external onlyIfRoundId(_roundId) {
        // TODO GUIGUI WWY this works and not the other version ??
        // for (uint256 i = 0; i < winners[_roundId].winnersCounter; i++)
        //     if (winners[_roundId].winnerDetails[i].playerAddress == msg.sender) {
        //         require(
        //             winners[_roundId].winnerDetails[i].prizeClaimed == false,
        //             "Prize for this game already claimed"
        //         );
        //         require(
        //             address(this).balance >= winners[_roundId].winnerDetails[i].amountWon,
        //             "Not enough funds in contract"
        //         );

        //         winners[_roundId].winnerDetails[i].prizeClaimed = true;
        //         _safeTransfert(msg.sender, winners[_roundId].winnerDetails[i].amountWon);
        //         emit GamePrizeClaimed(msg.sender, _roundId, winners[_roundId].winnerDetails[i].amountWon);
        //     }

        (bool exists, WinnerDetail memory winnerPlayerData) = _findWinnerPlayerData(_roundId, msg.sender);
        require(exists, "Player did not win this game");
        require(winnerPlayerData.prizeClaimed == false, "Prize for this game already claimed");
        require(address(this).balance >= winnerPlayerData.amountWon, "Not enough funds in contract");

        winnerPlayerData.prizeClaimed = true;
        _safeTransfert(msg.sender, winnerPlayerData.amountWon);
        emit GamePrizeClaimed(msg.sender, _roundId, winnerPlayerData.amountWon);
    }

    /**
     * @notice Prizes adding management
     * @dev Callable by admin or creator
     * @dev TODO NEXT VERSION add a taxe for creator in case of not payable games
     *      Need to store the factory gameCreationAmount in this contract on initialisation
     * @dev TODO NEXT VERSION Remove _isGameAllPrizesStandard limitation to include other prize typ
     */
    function addPrizes(PrizeDetail[] memory _prizeDetails)
        external
        payable
        onlyAdminOrCreator
        onlyIfGameIsNotInProgress
        onlyIfPrizeDetailsParam(_prizeDetails)
    // todo only if smg.value right amount if game is not payable and standard prize
    {
        _addPrizes(_prizeDetails);

        // Limitation for current version as standard for NFT is not implemented
        require(_isGameAllPrizesStandard(), "This version only allow standard prize");
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
        winners[roundId].winnersCounter = 0;

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

        // stop game if not payable to allow creator to add prizes
        if (!_isGamePayable()) return _pause();

        Prize storage oldPrize = prizes[roundId - 1];
        Prize storage newPrize = prizes[roundId];

        newPrize.prizesCounter = oldPrize.prizesCounter;

        for (uint256 i = 0; i < oldPrize.prizesCounter; i++) {
            _addPrizeDetail(newPrize, oldPrize.prizeDetails[i]);
        }
    }

    /**
     * @notice Transfert funds
     * @param _receiver the receiver address
     * @param _amount the amount to transfert
     */
    function _safeTransfert(address _receiver, uint256 _amount) internal onlyIfEnoughtBalance(_amount) {
        (bool success, ) = _receiver.call{ value: _amount }("");

        if (!success) {
            emit FailedTransfer(_receiver, _amount);
            require(false, "Transfer failed.");
        }
    }

    /**
     * @notice Check if game as ended
     * If so, it will create winners and reset the game
     */
    function _checkIfGameEnded() internal {
        uint256 remainingPlayersCount = _getRemainingPlayersCount();

        bool isPlitPot = _isAllPlayersSplitOk();

        if (remainingPlayersCount > 1 && !isPlitPot) return;

        Prize storage prize = prizes[roundId];
        uint256 treasuryRoundAmount = 0;
        uint256 creatorRoundAmount = 0;

        if (remainingPlayersCount == 1) {
            // Distribute prizes over winners
            for (uint256 i = 0; i < numPlayers; i++) {
                Player memory currentPlayer = players[playerAddresses[i]];

                if (!currentPlayer.hasLost) {
                    // player is winner
                    console.log(" player is winner");

                    PrizeDetail memory prizeDetail = prize.prizeDetails[1];

                    treasuryRoundAmount = (prizeDetail.amount * treasuryFee) / 10000;
                    creatorRoundAmount = (prizeDetail.amount * creatorFee) / 10000;
                    uint256 rewardAmount = prizeDetail.amount - treasuryRoundAmount - creatorRoundAmount;

                    _addWinner(1, currentPlayer.playerAddress, rewardAmount);
                } else if (currentPlayer.position <= prize.prizesCounter) {
                    // player has won a prize
                    console.log(
                        "player has won a prize currentPlayer.position %s prize.prizesCounter %s",
                        currentPlayer.position,
                        prize.prizesCounter
                    );

                    PrizeDetail memory prizeDetail = prize.prizeDetails[currentPlayer.position - 1];

                    treasuryRoundAmount = (prizeDetail.amount * treasuryFee) / 10000;
                    creatorRoundAmount = (prizeDetail.amount * creatorFee) / 10000;
                    uint256 rewardAmount = prizeDetail.amount - treasuryRoundAmount - creatorRoundAmount;

                    _addWinner(currentPlayer.position, currentPlayer.playerAddress, rewardAmount);
                }
            }
        }

        if (isPlitPot) {
            // Split with remaining player
            console.log("Split with remaining player");

            uint256 prizepool = 0;
            for (uint256 i = 1; i <= prize.prizesCounter; i++) {
                PrizeDetail memory prizeDetail = prize.prizeDetails[i];

                // console.log("PrizeDetail amount %s ", prizeDetail.amount);
                prizepool += prizeDetail.amount;
            }

            treasuryRoundAmount = (prizepool * treasuryFee) / 10000;
            creatorRoundAmount = (prizepool * creatorFee) / 10000;
            uint256 rewardAmount = prizepool - treasuryRoundAmount - creatorRoundAmount;
            uint256 splittedPrize = rewardAmount / remainingPlayersCount;

            // console.log(
            //     "prizepool %s splittedPrize %s prize.prizesCounter %s",
            //     prizepool,
            //     splittedPrize,
            //     prize.prizesCounter
            // );

            for (uint256 i = 0; i < numPlayers; i++) {
                Player memory currentPlayer = players[playerAddresses[i]];
                if (!currentPlayer.hasLost && currentPlayer.isSplitOk) {
                    console.log(
                        "_addWinner currentPlayer.playerAddress %s splittedPrize %s",
                        currentPlayer.playerAddress,
                        splittedPrize
                    );
                    _addWinner(1, currentPlayer.playerAddress, splittedPrize);
                }
            }
            emit GameSplitted(roundId, remainingPlayersCount, splittedPrize);
        }

        if (remainingPlayersCount == 0) {
            // Creator will take everything except the first prize
            console.log("Creator will take everything except the first prizer");
            for (uint256 i = 1; i <= prize.prizesCounter; i++) {
                PrizeDetail memory prizeDetail = prize.prizeDetails[i];
                treasuryRoundAmount = (prizeDetail.amount * treasuryFee) / 10000;
                creatorRoundAmount = (prizeDetail.amount * creatorFee) / 10000;

                uint256 rewardAmount = prizeDetail.amount - treasuryRoundAmount - creatorRoundAmount;

                address winnerAddress = i == 0 ? owner : creator;
                _addWinner(prizeDetail.position, winnerAddress, rewardAmount);
            }
        }

        treasuryAmount += treasuryRoundAmount;
        creatorAmount += creatorRoundAmount;
        _resetGame();
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
            if (player.hasPlayedRound == false && player.hasLost == false) _setPlayerAsHavingLost(player);
            else {
                // Reset round limits and round status for each remaining user
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }
    }

    function _addWinner(
        uint256 _position,
        address _playerAddress,
        uint256 _amount
    ) internal {
        // Winner storage winner = winners[roundId];

        // console.log("_addWinner winner.winnersCounter %s", winner.winnersCounter);
        // console.log("_addWinner winner.winnersCounter %s", winner.winnersCounter);
        winners[roundId].winnersCounter += 1;

        winners[roundId].winnerDetails[winners[roundId].winnersCounter] = WinnerDetail({
            roundId: roundId,
            position: _position,
            playerAddress: _playerAddress,
            amountWon: _amount,
            prizeClaimed: false
        });
        // winner.winnersCounter += 1;
        console.log("_addWinner winner.winnersCounter %s", winners[roundId].winnersCounter);

        emit GameWon(roundId, winners[roundId].winnersCounter, _playerAddress, _amount);
    }

    function _addPrizes(PrizeDetail[] memory prizeDetails) internal {
        uint256 prizepool = 0;

        Prize storage prize = prizes[roundId];
        // prize.prizesCounter = prizeDetails.length;

        console.log("_addPrizes prizeDetails.length %s", prizeDetails.length);
        for (uint256 i = 0; i < prizeDetails.length; i++) {
            _addPrizeDetail(prize, prizeDetails[i]);
            prizepool += prizeDetails[i].amount;
        }

        if (_isGamePayable()) {
            uint256 prizepoolVerify = registrationAmount * maxPlayers;
            require(prizepool == prizepoolVerify, "Wrong total amount to won");
        }
    }

    function _addPrizeDetail(Prize storage prize, PrizeDetail memory prizeDetail) internal {
        prize.prizeDetails[prizeDetail.position] = prizeDetail;
        emit PrizeAdded(
            roundId,
            prizeDetail.position,
            prizeDetail.amount,
            prizeDetail.standard,
            prizeDetail.contractAddress,
            prizeDetail.tokenId
        );
        prize.prizesCounter += 1;
    }

    function _isGamePayable() internal view returns (bool) {
        return registrationAmount > 0;
    }

    function _isGameAllPrizesStandard() internal view returns (bool) {
        Prize storage prize = prizes[roundId];
        for (uint256 i = 0; i < prize.prizesCounter; i++) {
            PrizeDetail storage prizeDetail = prize.prizeDetails[i];
            // if (prizeDetail.standard != PrizeStandard.STANDARD) return false;
            if (prizeDetail.standard != 0) return false;
        }
        return true;
    }

    /**
     * @notice Returns a number between 0 and 24 minus the current length of a round
     * @param _playerAddress the player address
     * @return the generated number
     */
    function _randMod(address _playerAddress) internal returns (uint256) {
        // increase nonce
        randNonce++;
        uint256 maxUpperRange = 25 - playTimeRange; // We use 25 because modulo excludes the higher limit
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, _playerAddress, randNonce))) %
            maxUpperRange;
        return randomNumber;
    }

    /**
     * @notice Reset the round range for a player
     * @param _player the player
     */
    function _resetRoundRange(Player storage _player) internal {
        uint256 newRoundLowerLimit = _randMod(_player.playerAddress);
        _player.roundRangeLowerLimit = block.timestamp + newRoundLowerLimit * 60 * 60;
        _player.roundRangeUpperLimit = _player.roundRangeLowerLimit + playTimeRange * 60 * 60;
    }

    /**
     * @notice Update looser player
     * @param _player the player
     */
    function _setPlayerAsHavingLost(Player storage _player) internal {
        _player.position = _getRemainingPlayersCount();
        _player.hasLost = true;
        _player.isSplitOk = false;

        emit GameLost(roundId, _player.playerAddress, _player.roundCount);
    }

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return true if all remaining players are ok to split pot, false otherwise
     */
    function _isAllPlayersSplitOk() internal view returns (bool) {
        uint256 remainingPlayersSplitOkCounter = 0;
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        for (uint256 i = 0; i < numPlayers; i++)
            if (players[playerAddresses[i]].isSplitOk) remainingPlayersSplitOkCounter++;

        return remainingPlayersLength != 0 && remainingPlayersSplitOkCounter == remainingPlayersLength;
    }

    /**
     * @notice Get the number of remaining players for the current game
     * @return the number of remaining players for the current game
     */
    function _getRemainingPlayersCount() internal view returns (uint256) {
        uint256 remainingPlayers = 0;
        for (uint256 i = 0; i < numPlayers; i++) if (!players[playerAddresses[i]].hasLost) remainingPlayers++;

        return remainingPlayers;
    }

    /**
     * @notice find if the given address have associated winner player data
     * @return winnerPlayerData if finded
     */
    function _findWinnerPlayerData(uint256 _roundId, address _address)
        internal
        view
        returns (bool, WinnerDetail memory)
    {
        for (uint256 i = 0; i < winners[_roundId].winnersCounter; i++)
            if (winners[_roundId].winnerDetails[i].playerAddress == _address)
                return (true, winners[_roundId].winnerDetails[i]);

        WinnerDetail memory winnerDetail;
        return (false, winnerDetail);
    }

    /**
     * @notice Pause the current game and associated keeper job
     * @dev Callable by admin or creator
     */

    function _pause() internal onlyNotPaused {
        // pause first to ensure no more interaction with contract
        contractPaused = true;
        CronUpkeepInterface(cronUpkeep).deleteCronJob(cronUpkeepJobId);
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
        return (
            creator,
            roundId,
            gameName,
            gameImage,
            numPlayers,
            maxPlayers,
            registrationAmount,
            playTimeRange,
            treasuryFee,
            creatorFee,
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
     * @param _player the player address
     * @return player if finded
     */
    function getPlayer(address _player) external view returns (Player memory) {
        return players[_player];
    }

    /**
     * @notice Return the winners for a round id
     * @param _roundId the round id
     * @return list of WinnerDetail
     */
    function getWinners(uint256 _roundId) external view onlyIfRoundId(_roundId) returns (WinnerDetail[] memory) {
        uint256 winnersCounter = winners[_roundId].winnersCounter;
        WinnerDetail[] memory winnersPlayerData = new WinnerDetail[](winnersCounter);

        for (uint256 i = 1; i <= winnersCounter; i++) {
            winnersPlayerData[i - 1] = winners[_roundId].winnerDetails[winnersCounter];
        }
        return winnersPlayerData;
    }

    // TODO create getPrizes

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return true if all remaining players are ok to split pot, false otherwise
     */
    function isAllPlayersSplitOk() external view returns (bool) {
        return _isAllPlayersSplitOk();
    }

    /**
     * @notice Check if Game is payable
     * @return true if game is payable, false otherwise
     */
    function isGamePayable() external view returns (bool) {
        return _isGamePayable();
    }

    /**
     * @notice Check if Game prizes are standard
     * @return true if game prizes are standard, false otherwise
     */
    function isGameAllPrizesStandard() external view returns (bool) {
        return _isGameAllPrizesStandard();
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
     * @dev Callable by creator
     */
    function setGameName(string calldata _gameName) external onlyCreator {
        gameName = _gameName;
    }

    /**
     * @notice Set the image of the game
     * @param _gameImage the new game image
     * @dev Callable by creator
     */
    function setGameImage(string calldata _gameImage) external onlyCreator {
        gameImage = _gameImage;
    }

    /**
     * @notice Set the maximum allowed players for the game
     * @param _maxPlayers the new max players limit
     * @dev Callable by admin or creator
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
     * @notice Set the creator fee for the game
     * @param _creatorFee the new creator fee in %
     * @dev Callable by admin or creator
     * @dev Callable when game if not in progress
     */
    function setCreatorFee(uint256 _creatorFee)
        external
        onlyAdminOrCreator
        onlyIfGameIsNotInProgress
        onlyCreatorFee(_creatorFee)
    {
        creatorFee = _creatorFee;
    }

    /**
     * @notice Allow creator to withdraw his fee
     * @dev Callable by admin
     */
    function claimCreatorFee()
        external
        onlyCreator
        onlyIfClaimableAmount(creatorAmount)
        onlyIfEnoughtBalance(creatorAmount)
    {
        uint256 currentCreatorAmount = creatorAmount;
        creatorAmount = 0;
        _safeTransfert(creator, currentCreatorAmount);

        emit CreatorFeeClaimed(currentCreatorAmount);
    }

    ///
    /// ADMIN FUNCTIONS
    ///

    /**
     * @notice Withdraw Treasury fee
     * @dev Callable by admin
     */
    function claimTreasuryFee()
        external
        onlyAdmin
        onlyIfClaimableAmount(treasuryAmount)
        onlyIfEnoughtBalance(treasuryAmount)
    {
        uint256 currentTreasuryAmount = treasuryAmount;
        treasuryAmount = 0;
        _safeTransfert(owner, currentTreasuryAmount);

        emit TreasuryFeeClaimed(currentTreasuryAmount);
    }

    /**
     * @notice Withdraw Treasury fee and send it to factory
     * @dev Callable by factory
     */
    function claimTreasuryFeeToFactory()
        external
        onlyFactory
        onlyIfClaimableAmount(treasuryAmount)
        onlyIfEnoughtBalance(treasuryAmount)
    {
        uint256 currentTreasuryAmount = treasuryAmount;
        treasuryAmount = 0;
        _safeTransfert(factory, currentTreasuryAmount);

        emit TreasuryFeeClaimedByFactory(currentTreasuryAmount);
    }

    /**
     * @notice Set the treasury fee for the game
     * @param _treasuryFee the new treasury fee in %
     * @dev Callable by admin
     * @dev Callable when game if not in progress
     */
    function setTreasuryFee(uint256 _treasuryFee)
        external
        onlyAdmin
        onlyIfGameIsNotInProgress
        onlyTreasuryFee(_treasuryFee)
    {
        treasuryFee = _treasuryFee;
    }

    /**
     * @notice Set the keeper address
     * @param _cronUpkeep the new keeper address
     * @dev Callable by admin or factory
     */
    function setCronUpkeep(address _cronUpkeep) external onlyAdminOrFactory onlyAddressInit(_cronUpkeep) {
        cronUpkeep = _cronUpkeep;

        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );

        emit CronUpkeepUpdated(cronUpkeepJobId, cronUpkeep);
    }

    /**
     * @notice Set the encoded cron
     * @param _encodedCron the new encoded cron as * * * * *
     * @dev Callable by admin or creator
     */
    function setEncodedCron(string memory _encodedCron) external onlyAdminOrCreator {
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");

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
     * @dev Callable by admin or creator
     */
    function pause() external onlyAdminOrCreator onlyNotPaused {
        _pause();
    }

    /**
     * @notice Unpause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function unpause() external onlyAdminOrCreator onlyPaused onlyIfKeeperDataInit onlyIfPrizeDetailsIsNotEmpty {
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
     * @dev Callable by admin
     */
    function transferAdminOwnership(address _adminAddress) public onlyAdmin onlyAddressInit(_adminAddress) {
        owner = _adminAddress;
    }

    /**
     * @notice Transfert Creator Ownership
     * @param _creator the new creator address
     * @dev Callable by creator
     */
    function transferCreatorOwnership(address _creator) public onlyCreator onlyAddressInit(_creator) {
        creator = _creator;
    }

    /**
     * @notice Transfert Factory Ownership
     * @param _factory the new factory address
     * @dev Callable by factory
     */
    function transferFactoryOwnership(address _factory) public onlyFactory onlyAddressInit(_factory) {
        factory = _factory;
    }

    /**
     * @notice Allow admin to withdraw all funds of smart contract
     * @param _receiver the receiver for the funds (admin or factory)
     * @dev Callable by admin or factory
     */
    function withdrawFunds(address _receiver) external onlyAdminOrFactory {
        _safeTransfert(_receiver, address(this).balance);
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
        require(msg.sender == creator || msg.sender == owner, "Caller is not the admin or creator");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or keeper can access this function
     */
    modifier onlyAdminOrKeeper() {
        require(msg.sender == creator || msg.sender == owner, "Caller is not the admin or keeper");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or factory can access this function
     */
    modifier onlyAdminOrFactory() {
        require(msg.sender == factory || msg.sender == owner, "Caller is not the admin or factory");
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
     * @notice Modifier that ensure that address is initialised
     */
    modifier onlyAddressInit(address _toCheck) {
        require(_toCheck != address(0), "address need to be initialised");
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
        require(msg.value == registrationAmount, "Only registration amount is allowed");
        _;
    }

    /**
     * @notice Modifier that ensure that roundId exist
     */
    modifier onlyIfRoundId(uint256 _roundId) {
        require(_roundId <= roundId, "This round does not exist");
        _;
    }

    /**
     * @notice Modifier that ensure that there is less than 50% of remaining players
     */
    modifier onlyIfPlayerWon() {
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        require(
            remainingPlayersLength <= maxPlayers / 2,
            "Remaining players must be less or equal than half of started players"
        );
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
     * @notice Modifier that ensure that treasury fee are not too high
     */
    modifier onlyIfClaimableAmount(uint256 _amount) {
        require(_amount > 0, "Nothing to claim");
        _;
    }

    /**
     * @notice Modifier that ensure that treasury fee are not too high
     */
    modifier onlyIfEnoughtBalance(uint256 _amount) {
        require(address(this).balance >= _amount, "Not enough in contract balance");
        _;
    }

    /**
     * @notice Modifier that ensure that treasury fee are not too high
     */
    modifier onlyTreasuryFee(uint256 _treasuryFee) {
        require(_treasuryFee <= MAX_TREASURY_FEE, "Treasury fee too high");
        _;
    }

    /**
     * @notice Modifier that ensure that creator fee are not too high
     */
    modifier onlyCreatorFee(uint256 _creatorFee) {
        require(_creatorFee <= MAX_CREATOR_FEE, "Creator fee too high");
        _;
    }

    /**
     * @notice Modifier that ensure that game is payable
     */
    modifier onlyIfGameIsPayable() {
        require(_isGamePayable(), "Game is not payable");
        _;
    }

    /**
     * @notice Modifier that ensure that game is not payable
     */
    modifier onlyIfGameIsNotPayable() {
        require(!_isGamePayable(), "Game is payable");
        _;
    }

    /**
     * @notice Modifier that ensure that game is splittable
     */
    modifier onlyIfGameIsSplittable() {
        require(_isGameAllPrizesStandard(), "Game is not splittable");
        _;
    }

    /**
     * @notice Modifier that ensure that prize details param is not empty
     * @param _prizeDetails list of prize details
     */
    modifier onlyIfPrizeDetailsParam(PrizeDetail[] memory _prizeDetails) {
        require(_prizeDetails.length > 0, "prizeDetails should be greather or equal to 1");
        bool isListOrdered = true;
        for (uint256 i = 0; i < _prizeDetails.length; i++) {
            PrizeDetail memory prizeDetail = _prizeDetails[i];
            require(prizeDetail.position == i + 1, "Prize list is not ordered");
        }
        _;
    }

    /**
     * @notice Modifier that ensure that prize details is not empty
     */
    modifier onlyIfPrizeDetailsIsNotEmpty() {
        require(prizes[roundId].prizesCounter > 0, "prizeDetails should be greather or equal to 1");
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
