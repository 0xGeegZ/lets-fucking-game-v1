// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

contract GameImplementationV1 is ReentrancyGuard {
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

    uint256 public playTimeRange; // time length of a round in hours

    uint256 public maxPlayers;

    bool public gameInProgress; // helps the keeper determine if a game has started or if we need to start it
    bool public contractPaused;

    address[] public playerAddresses;
    mapping(address => Player) public players;
    mapping(uint256 => Winner[]) winners;
    mapping(uint256 => Prize[]) prizes;

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
     * @notice Winner structure that contain all usefull data for a winner
     */
    struct Winner {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        uint256 position;
        bool prizeClaimed;
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
     * @notice Prize structure that contain a list of prizes for the current roundId
     */
    struct Prize {
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
        address contractAddress;
        uint256 tokenId;
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
        Prize[] prizes;
    }

    struct GameStatus {
        address creator;
        uint256 roundId;
        string gameName;
        string gameImage;
        uint256 playerAddressesCount;
        uint256 maxPlayers;
        uint256 registrationAmount;
        uint256 playTimeRange;
        uint256 treasuryFee;
        uint256 creatorFee;
        bool contractPaused;
        bool gameInProgress;
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
     *  @param _initialization.prizes the cron string
     * @dev TODO NEXT VERSION Remove _isGameAllPrizesStandard limitation to include other prize typ
     * @dev TODO NEXT VERSION Make it only accessible to factory
     */
    function initialize(Initialization calldata _initialization)
        external
        payable
        onlyIfNotBase
        onlyIfNotAlreadyInitialized
        onlyAllowedNumberOfPlayers(_initialization.maxPlayers)
        onlyAllowedPlayTimeRange(_initialization.playTimeRange)
        onlyTreasuryFee(_initialization.treasuryFee)
        onlyCreatorFee(_initialization.creatorFee)
        onlyIfPrizesParam(_initialization.prizes)
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
        _checkIfPrizeAmountIfNeeded(_initialization.prizes);
        _addPrizes(_initialization.prizes);

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

        emit RegisteredForGame(players[msg.sender].playerAddress, playerAddresses.length);
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
     * @dev TODO NEXT VERSION Update triggerDailyCheckpoint to mae it only callable by keeper
     */
    function triggerDailyCheckpoint() external onlyAdminOrKeeper onlyNotPaused {
        if (gameInProgress) {
            _refreshPlayerStatus();
            _checkIfGameEnded();
        } else if (playerAddresses.length == maxPlayers) _startGame();
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
        for (uint256 i = 0; i < winners[_roundId].length; i++)
            if (winners[_roundId][i].playerAddress == msg.sender) {
                require(!winners[_roundId][i].prizeClaimed, "Prize for this game already claimed");
                require(address(this).balance >= winners[_roundId][i].amountWon, "Not enough funds in contract");

                winners[_roundId][i].prizeClaimed = true;
                emit GamePrizeClaimed(msg.sender, _roundId, winners[_roundId][i].amountWon);
                _safeTransfert(msg.sender, winners[_roundId][i].amountWon);
                return;
            }
        require(false, "Player did not win this game");
    }

    /**
     * @notice Prizes adding management
     * @dev Callable by admin or creator
     * @dev TODO NEXT VERSION add a taxe for creator in case of free games
     *      Need to store the factory gameCreationAmount in this contract on initialisation
     * @dev TODO NEXT VERSION Remove _isGameAllPrizesStandard limitation to include other prize typ
     */
    function addPrizes(Prize[] memory _prizes)
        external
        payable
        onlyAdminOrCreator
        onlyIfGameIsNotInProgress
        onlyIfPrizesParam(_prizes)
        onlyIfPrizeAmountIfNeeded(_prizes)
    {
        _addPrizes(_prizes);
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
        for (uint256 i = 0; i < playerAddresses.length; i++) _resetRoundRange(players[playerAddresses[i]]);
        gameInProgress = true;
        emit StartedGame(block.timestamp, playerAddresses.length);
    }

    /**
     * @notice Reset the game (called at the end of the current game)
     */
    function _resetGame() internal {
        gameInProgress = false;
        for (uint256 i = 0; i < playerAddresses.length; i++) delete players[playerAddresses[i]];

        delete playerAddresses;

        emit ResetGame(block.timestamp, roundId);
        roundId += 1;

        // Stop game if not payable to allow creator to add prizes
        if (!_isGamePayable()) return _pause();

        Prize[] storage oldPrize = prizes[roundId - 1];

        for (uint256 i = 0; i < oldPrize.length; i++) _addPrize(oldPrize[i]);
    }

    /**
     * @notice Transfert funds
     * @param _receiver the receiver address
     * @param _amount the amount to transfert
     * @dev TODO NEXT VERSION use SafeERC20 library from OpenZeppelin
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

        uint256 treasuryRoundAmount = 0;
        uint256 creatorRoundAmount = 0;

        Prize[] memory _prizes = prizes[roundId];

        if (remainingPlayersCount == 1)
            // Distribute prizes over winners
            for (uint256 i = 0; i < playerAddresses.length; i++) {
                Player memory currentPlayer = players[playerAddresses[i]];

                if (!currentPlayer.hasLost) {
                    // Player is winner
                    treasuryRoundAmount = (_prizes[0].amount * treasuryFee) / 10000;
                    creatorRoundAmount = (_prizes[0].amount * creatorFee) / 10000;
                    uint256 rewardAmount = _prizes[0].amount - treasuryRoundAmount - creatorRoundAmount;

                    _addWinner(0, currentPlayer.playerAddress, rewardAmount);
                } else if (i < _prizes.length && currentPlayer.position <= _prizes[i].position) {
                    // Player has won a prize
                    treasuryRoundAmount = (_prizes[0].amount * treasuryFee) / 10000;
                    creatorRoundAmount = (_prizes[0].amount * creatorFee) / 10000;
                    uint256 rewardAmount = _prizes[0].amount - treasuryRoundAmount - creatorRoundAmount;

                    _addWinner(currentPlayer.position, currentPlayer.playerAddress, rewardAmount);
                }
            }

        if (isPlitPot) {
            // Split with remaining player
            uint256 prizepool = 0;
            for (uint256 i = 0; i < _prizes.length; i++) prizepool += _prizes[i].amount;

            treasuryRoundAmount = (prizepool * treasuryFee) / 10000;
            creatorRoundAmount = (prizepool * creatorFee) / 10000;
            uint256 rewardAmount = prizepool - treasuryRoundAmount - creatorRoundAmount;
            uint256 splittedPrize = rewardAmount / remainingPlayersCount;

            for (uint256 i = 0; i < playerAddresses.length; i++) {
                Player memory currentPlayer = players[playerAddresses[i]];
                if (!currentPlayer.hasLost && currentPlayer.isSplitOk)
                    _addWinner(1, currentPlayer.playerAddress, splittedPrize);
            }
            emit GameSplitted(roundId, remainingPlayersCount, splittedPrize);
        }

        if (remainingPlayersCount == 0)
            // Creator will take everything except the first prize
            for (uint256 i = 0; i < _prizes.length; i++) {
                treasuryRoundAmount = (_prizes[i].amount * treasuryFee) / 10000;
                creatorRoundAmount = (_prizes[i].amount * creatorFee) / 10000;

                uint256 rewardAmount = _prizes[i].amount - treasuryRoundAmount - creatorRoundAmount;

                address winnerAddress = i == 1 ? owner : creator;
                _addWinner(_prizes[i].position, winnerAddress, rewardAmount);
            }

        treasuryAmount += treasuryRoundAmount;
        creatorAmount += creatorRoundAmount;
        _resetGame();
    }

    /**
     * @notice Refresh players status for remaining players
     */
    function _refreshPlayerStatus() internal {
        // If everyone is ok to split, we wait
        if (_isAllPlayersSplitOk()) return;

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            Player storage player = players[playerAddresses[i]];
            // Refresh player status to having lost if player has not played
            if (!player.hasPlayedRound && !player.hasLost) _setPlayerAsHavingLost(player);
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
        winners[roundId].push(
            Winner({
                roundId: roundId,
                position: _position,
                playerAddress: _playerAddress,
                amountWon: _amount,
                prizeClaimed: false
            })
        );
        emit GameWon(roundId, winners[roundId].length, _playerAddress, _amount);
    }

    /**
     * @notice Check if msg.value have the right amount if needed
     * @param _prizes list of prize details
     */
    function _checkIfPrizeAmountIfNeeded(Prize[] memory _prizes) internal view {
        if (_isGamePayable()) return;

        uint256 prizepool = 0;
        for (uint256 i = 0; i < _prizes.length; i++) prizepool += _prizes[i].amount;

        require(msg.value == prizepool, "Need to send prizepool amount");
    }

    /**
     * @notice Internal function for prizes adding management
     * @param _prizes list of prize details
     */
    function _addPrizes(Prize[] memory _prizes) internal {
        uint256 prizepool = 0;
        for (uint256 i = 0; i < _prizes.length; i++) {
            _addPrize(_prizes[i]);
            prizepool += _prizes[i].amount;
        }

        if (_isGamePayable()) {
            uint256 prizepoolVerify = registrationAmount * maxPlayers;
            require(prizepool == prizepoolVerify, "Wrong total amount to won");
        }
    }

    /**
     * @notice Internal function to add a Prize
     * @param _prize the prize to add
     */
    function _addPrize(Prize memory _prize) internal {
        prizes[roundId].push(_prize);
        emit PrizeAdded(
            roundId,
            _prize.position,
            _prize.amount,
            _prize.standard,
            _prize.contractAddress,
            _prize.tokenId
        );
    }

    /**
     * @notice Internal function to check if game is payable
     * @return isPayable set to true if game is payable
     */
    function _isGamePayable() internal view returns (bool isPayable) {
        return registrationAmount > 0;
    }

    /**
     * @notice Internal function to check if all games are of type standard
     * @return isStandard set to true if all games are of type standard
     */
    function _isGameAllPrizesStandard() internal view returns (bool isStandard) {
        for (uint256 i = 0; i < prizes[roundId].length; i++) if (prizes[roundId][i].standard != 0) return false;
        return true;
    }

    /**
     * @notice Returns a number between 0 and 24 minus the current length of a round
     * @param _playerAddress the player address
     * @return randomNumber the generated number
     */
    function _randMod(address _playerAddress) internal returns (uint256 randomNumber) {
        // Increase nonce
        randNonce++;
        uint256 maxUpperRange = 25 - playTimeRange; // We use 25 because modulo excludes the higher limit
        uint256 randNumber = uint256(keccak256(abi.encodePacked(block.timestamp, _playerAddress, randNonce))) %
            maxUpperRange;
        return randNumber;
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
     * @return isSplitOk set to true if all remaining players are ok to split pot, false otherwise
     */
    function _isAllPlayersSplitOk() internal view returns (bool isSplitOk) {
        uint256 remainingPlayersSplitOkCounter = 0;
        uint256 remainingPlayersLength = _getRemainingPlayersCount();
        for (uint256 i = 0; i < playerAddresses.length; i++)
            if (players[playerAddresses[i]].isSplitOk) remainingPlayersSplitOkCounter++;

        return remainingPlayersLength != 0 && remainingPlayersSplitOkCounter == remainingPlayersLength;
    }

    /**
     * @notice Get the number of remaining players for the current game
     * @return remainingPlayersCount the number of remaining players for the current game
     */
    function _getRemainingPlayersCount() internal view returns (uint256 remainingPlayersCount) {
        uint256 remainingPlayers = 0;
        for (uint256 i = 0; i < playerAddresses.length; i++)
            if (!players[playerAddresses[i]].hasLost) remainingPlayers++;

        return remainingPlayers;
    }

    /**
     * @notice Pause the current game and associated keeper job
     * @dev Callable by admin or creator
     */

    function _pause() internal onlyNotPaused {
        contractPaused = true;
        CronUpkeepInterface(cronUpkeep).deleteCronJob(cronUpkeepJobId);
    }

    /**
     * @notice Unpause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function _unpause() internal onlyPaused {
        contractPaused = false;

        // Reset round limits and round status for each remaining user
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            Player storage player = players[playerAddresses[i]];
            if (!player.hasLost) {
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }
        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    ///
    /// GETTERS FUNCTIONS
    ///

    /**
     * @notice Return game informations
     * @return gameStatus the game status data with params as follow :
     *  gameStatus.creator the creator address of the game
     *  gameStatus.roundId the roundId of the game
     *  gameStatus.gameName the name of the game
     *  gameStatus.gameImage the image of the game
     *  gameStatus.playerAddressesCount the number of registered players
     *  gameStatus.maxPlayers the maximum players of the game
     *  gameStatus.registrationAmount the registration amount of the game
     *  gameStatus.playTimeRange the player time range of the game
     *  gameStatus.treasuryFee the treasury fee of the game
     *  gameStatus.creatorFee the creator fee of the game
     *  gameStatus.contractPaused a boolean set to true if game is paused
     *  gameStatus.gameInProgress a boolean set to true if game is in progress
     */
    function getStatus() external view returns (GameStatus memory gameStatus) {
        return
            GameStatus({
                creator: creator,
                roundId: roundId,
                gameName: gameName,
                gameImage: gameImage,
                playerAddressesCount: playerAddresses.length,
                maxPlayers: maxPlayers,
                registrationAmount: registrationAmount,
                playTimeRange: playTimeRange,
                treasuryFee: treasuryFee,
                creatorFee: creatorFee,
                contractPaused: contractPaused,
                gameInProgress: gameInProgress
            });
    }

    /**
     * @notice Return the players addresses for the current game
     * @return gamePlayerAddresses list of players addresses
     */
    function getPlayerAddresses() external view returns (address[] memory gamePlayerAddresses) {
        return playerAddresses;
    }

    /**
     * @notice Return a player for the current game
     * @param _player the player address
     * @return gamePlayer if finded
     */
    function getPlayer(address _player) external view returns (Player memory gamePlayer) {
        return players[_player];
    }

    /**
     * @notice Return the winners for a round id
     * @param _roundId the round id
     * @return gameWinners list of Winner
     */
    function getWinners(uint256 _roundId) external view onlyIfRoundId(_roundId) returns (Winner[] memory gameWinners) {
        return winners[_roundId];
    }

    /**
     * @notice Return the winners for a round id
     * @param _roundId the round id
     * @return gamePrizes list of Prize
     */
    function getPrizes(uint256 _roundId) external view onlyIfRoundId(_roundId) returns (Prize[] memory gamePrizes) {
        return prizes[_roundId];
    }

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return isSplitOk set to true if all remaining players are ok to split pot, false otherwise
     */
    function isAllPlayersSplitOk() external view returns (bool isSplitOk) {
        return _isAllPlayersSplitOk();
    }

    /**
     * @notice Check if Game is payable
     * @return isPayable set to true if game is payable, false otherwise
     */
    function isGamePayable() external view returns (bool isPayable) {
        return _isGamePayable();
    }

    /**
     * @notice Check if Game prizes are standard
     * @return isStandard true if game prizes are standard, false otherwise
     */
    function isGameAllPrizesStandard() external view returns (bool isStandard) {
        return _isGameAllPrizesStandard();
    }

    /**
     * @notice Get the number of remaining players for the current game
     * @return remainingPlayersCount the number of remaining players for the current game
     */
    function getRemainingPlayersCount() external view returns (uint256 remainingPlayersCount) {
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
        emit CreatorFeeClaimed(currentCreatorAmount);
        _safeTransfert(creator, currentCreatorAmount);
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
        emit TreasuryFeeClaimed(currentTreasuryAmount);
        _safeTransfert(owner, currentTreasuryAmount);
    }

    /**
     * @notice Withdraw Treasury fee and send it to factory
     * @dev Callable by factory
     */
    function claimTreasuryFeeToFactory()
        external
        onlyAdminOrFactory
        onlyIfClaimableAmount(treasuryAmount)
        onlyIfEnoughtBalance(treasuryAmount)
    {
        uint256 currentTreasuryAmount = treasuryAmount;
        treasuryAmount = 0;
        emit TreasuryFeeClaimedByFactory(currentTreasuryAmount);
        _safeTransfert(factory, currentTreasuryAmount);
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
        emit CronUpkeepUpdated(cronUpkeepJobId, cronUpkeep);

        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @notice Set the encoded cron
     * @param _encodedCron the new encoded cron as * * * * *
     * @dev Callable by admin or creator
     */
    function setEncodedCron(string memory _encodedCron) external onlyAdminOrCreator {
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");

        encodedCron = CronExternal.toEncodedSpec(_encodedCron);

        emit EncodedCronUpdated(cronUpkeepJobId, _encodedCron);

        CronUpkeepInterface(cronUpkeep).updateCronJob(
            cronUpkeepJobId,
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @notice Pause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function pause() external onlyAdminOrCreatorOrFactory onlyNotPaused {
        _pause();
    }

    /**
     * @notice Unpause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function unpause() external onlyAdminOrCreatorOrFactory onlyPaused onlyIfKeeperDataInit onlyIfPrizesIsNotEmpty {
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
        owner = _adminAddress;
    }

    /**
     * @notice Transfert Creator Ownership
     * @param _creator the new creator address
     * @dev Callable by creator
     */
    function transferCreatorOwnership(address _creator) external onlyCreator onlyAddressInit(_creator) {
        creator = _creator;
    }

    /**
     * @notice Transfert Factory Ownership
     * @param _factory the new factory address
     * @dev Callable by factory
     */
    function transferFactoryOwnership(address _factory) external onlyAdminOrFactory onlyAddressInit(_factory) {
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
     * @notice Called for empty calldata (and any value)
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
     * @notice Modifier that ensure only admin or creator or factory can access this function
     */
    modifier onlyAdminOrCreatorOrFactory() {
        require(
            msg.sender == creator || msg.sender == owner || msg.sender == factory,
            "Caller is not the admin or creator or factory"
        );
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
        require(playerAddresses.length < maxPlayers, "This game is full");
        _;
    }

    /**
     * @notice Modifier that ensure that game is full
     */
    modifier onlyIfFull() {
        require(playerAddresses.length == maxPlayers, "This game is not full");
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
        require(!_isBase, "The implementation contract can't be initialized");
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
     * @param _prizes list of prize details
     */
    modifier onlyIfPrizesParam(Prize[] memory _prizes) {
        require(_prizes.length > 0, "Prizes should be greather or equal to 1");
        for (uint256 i = 0; i < _prizes.length; i++) require(_prizes[i].position == i + 1, "Prize list is not ordered");
        _;
    }

    /**
     * @notice Modifier that ensure thatmsg.value have the right amount if needed
     * @param _prizes list of prize details
     */
    modifier onlyIfPrizeAmountIfNeeded(Prize[] memory _prizes) {
        _checkIfPrizeAmountIfNeeded(_prizes);
        _;
    }

    /**
     * @notice Modifier that ensure that prize details is not empty
     */
    modifier onlyIfPrizesIsNotEmpty() {
        require(prizes[roundId].length > 0, "Prizes should be greather or equal to 1");
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
