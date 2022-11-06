// SPDX-License-Identifier: MIT
pragma solidity >=0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import { IKeeper } from "./interfaces/IKeeper.sol";

contract GameV2 is Pausable {
    using Address for address;

    bool private _isBase;

    uint256 public id; // id is fix and represent the fixed id for the game
    uint256 public roundId; // roundId gets incremented every time the game restarts

    uint256 private randNonce;

    address public creator;
    address public factory;

    IKeeper public keeper;

    uint256 public registrationAmount;

    bytes32 public name;
    bytes32 public image;

    uint256 public version;

    uint256 public playTimeRange; // time length of a round in hours

    uint256 public maxPlayers;

    bool public isInProgress; // helps the keeper determine if a game has started or if we need to start it

    address[] public playerAddresses;
    mapping(address => Player) public players;

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
     * @notice Initialization structure that contain all the data that are needed to create a new game
     */
    struct Initialization {
        address owner;
        address creator;
        IKeeper keeper;
        bytes32 name;
        bytes32 image;
        uint256 version;
        uint256 id;
        uint256 playTimeRange;
        uint256 maxPlayers;
        uint256 registrationAmount;
    }

    struct GameData {
        address creator;
        uint256 roundId;
        bytes32 name;
        bytes32 image;
        uint256 playersCount;
        uint256 maxPlayers;
        uint256 registrationAmount;
        uint256 playTimeRange;
        bool isIsPaused;
        bool isInProgress;
    }

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
    event ResetGame(uint256 timelock, uint256 resetId);
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
     * @notice Called when a methode transferCreatorOwnership is called
     */
    event CreatorOwnershipTransferred(address oldCreator, address newCreator);
    /**
     * @notice Called when a methode transferFactoryOwnership is called
     */
    event FactoryOwnershipTransferred(address oldFactory, address newFactory);

    /**
     * @notice Called when the contract have receive funds via receive() or fallback() function
     */
    event Received(address sender, uint256 amount);

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
     *  @param _initialization.name the game name
     *  @param _initialization.image the game image path
     *  @param _initialization.version the version of the game implementation
     *  @param _initialization.id the unique game id (fix)
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
    {
        creator = _initialization.creator;
        factory = msg.sender;

        name = _initialization.name;
        image = _initialization.image;

        randNonce = 0;

        registrationAmount = _initialization.registrationAmount;

        id = _initialization.id;
        version = _initialization.version;

        roundId = 0;
        playTimeRange = _initialization.playTimeRange;
        maxPlayers = _initialization.maxPlayers;

        keeper = _initialization.keeper;
    }

    /**
     * @notice Function that is called by the keeper when game is ready to start
     * @dev TODO NEXT VERSION remove this function in next smart contract version
     */
    function startGame() external onlyFactoryOrCreator whenNotPaused onlyIfFull {
        _startGame();
    }

    /**
     * @notice Function that allow players to register for a game
     * @dev Creator cannot register for his own game
     */
    function registerForGame()
        external
        payable
        onlyHumans
        whenNotPaused
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
        whenNotPaused
        onlyIfFull
        onlyIfAlreadyEntered
        onlyIfHasNotLost
        onlyIfHasNotPlayedThisRound
        onlyNotCreator
        onlyIfGameIsInProgress
    {
        Player storage player = players[msg.sender];

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
    function triggerDailyCheckpoint() external onlyFactoryOrKeeper whenNotPaused {
        if (isInProgress) {
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
     * @notice Start the game(called when all conditions are ok)
     */
    function _startGame() internal {
        for (uint256 i = 0; i < playerAddresses.length; i++) _resetRoundRange(players[playerAddresses[i]]);
        isInProgress = true;
        emit StartedGame(block.timestamp, playerAddresses.length);
    }

    /**
     * @notice Reset the game (called at the end of the current game)
     */
    function _resetGame() internal {
        isInProgress = false;
        for (uint256 i = 0; i < playerAddresses.length; i++) delete players[playerAddresses[i]];

        delete playerAddresses;

        emit ResetGame(block.timestamp, roundId);
        roundId += 1;

        if (!_isGamePayable()) return _pauseGame();
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

        if (remainingPlayersCount == 1) {}

        if (isPlitPot) {}

        if (remainingPlayersCount == 0) {}

        _resetGame();
    }

    /**
     * @notice Refresh players status for remaining players
     */
    function _refreshPlayerStatus() internal {
        if (_isAllPlayersSplitOk()) return;

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            Player storage player = players[playerAddresses[i]];
            if (!player.hasPlayedRound && !player.hasLost) _setPlayerAsHavingLost(player);
            else {
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }
    }

    /**
     * @notice Internal function to check if game is payable
     * @return isPayable set to true if game is payable
     */
    function _isGamePayable() internal view returns (bool isPayable) {
        return registrationAmount > 0;
    }

    /**
     * @notice Returns a number between 0 and 24 minus the current length of a round
     * @param _playerAddress the player address
     * @return randomNumber the generated number
     * TODO GUIGUI MOVE IN LIBRARY ??
     */
    function _randMod(address _playerAddress) internal returns (uint256 randomNumber) {
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

    function _pauseGame() internal whenNotPaused {
        _pause();
        keeper.pauseKeeper();
    }

    /**
     * @notice Unpause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function _unpauseGame() internal whenPaused {
        _unpause();

        for (uint256 i = 0; i < playerAddresses.length; i++) {
            Player storage player = players[playerAddresses[i]];
            if (!player.hasLost) {
                _resetRoundRange(player);
                player.hasPlayedRound = false;
            }
        }
        keeper.unpauseKeeper();
    }

    /**
     * @notice Return game informations
     * @return gameData the game status data with params as follow :
     *  gameData.creator the creator address of the game
     *  gameData.roundId the roundId of the game
     *  gameData.name the name of the game
     *  gameData.image the image of the game
     *  gameData.playersCount the number of registered players
     *  gameData.maxPlayers the maximum players of the game
     *  gameData.registrationAmount the registration amount of the game
     *  gameData.playTimeRange the player time range of the game
     *  gameData.treasuryFee the treasury fee of the game
     *  gameData.creatorFee the creator fee of the game
     *  gameData.isIsPaused a boolean set to true if game is paused
     *  gameData.isInProgress a boolean set to true if game is in progress
     */
    function getGameData() external view returns (GameData memory gameData) {
        return
            GameData({
                creator: creator,
                roundId: roundId,
                name: name,
                image: image,
                playersCount: playerAddresses.length,
                maxPlayers: maxPlayers,
                registrationAmount: registrationAmount,
                playTimeRange: playTimeRange,
                isIsPaused: paused(),
                isInProgress: isInProgress
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
     * @notice Get the number of remaining players for the current game
     * @return remainingPlayersCount the number of remaining players for the current game
     */
    function getRemainingPlayersCount() external view returns (uint256 remainingPlayersCount) {
        return _getRemainingPlayersCount();
    }

    /**
     * @notice Set the name of the game
     * @param _name the new game name
     * @dev Callable by creator
     */
    function setName(bytes32 _name) external onlyCreator {
        name = _name;
    }

    /**
     * @notice Set the image of the game
     * @param _image the new game image
     * @dev Callable by creator
     */
    function setImage(bytes32 _image) external onlyCreator {
        image = _image;
    }

    /**
     * @notice Set the maximum allowed players for the game
     * @param _maxPlayers the new max players limit
     * @dev Callable by admin or creator
     */
    function setMaxPlayers(uint256 _maxPlayers)
        external
        onlyFactoryOrCreator
        onlyAllowedNumberOfPlayers(_maxPlayers)
        onlyIfGameIsNotInProgress
    {
        maxPlayers = _maxPlayers;
    }

    /**
     * @notice Set the keeper address
     * @param _cronUpkeep the new keeper address
     * @dev Callable by admin or factory
     */
    function setCronUpkeep(address _cronUpkeep) external onlyFactory onlyAddressInit(_cronUpkeep) {
        keeper.setCronUpkeep(_cronUpkeep);
    }

    /**
     * @notice Set the encoded cron
     * @param _encodedCron the new encoded cron as * * * * *
     * @dev Callable by admin or creator
     */
    function setEncodedCron(string memory _encodedCron) external onlyFactoryOrCreator {
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");
        keeper.setEncodedCron(_encodedCron);
    }

    /**
     * @notice Pause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function pause() external onlyFactoryOrCreator whenNotPaused {
        _pauseGame();
    }

    /**
     * @notice Unpause the current game and associated keeper job
     * @dev Callable by admin or creator
     */
    function unpause() external onlyFactoryOrCreator whenPaused {
        _unpauseGame();
    }

    /**
     * @notice Transfert Creator Ownership
     * @param _creator the new creator address
     * @dev Callable by creator
     */
    function transferCreatorOwnership(address _creator) external onlyCreator onlyAddressInit(_creator) {
        emit CreatorOwnershipTransferred(creator, _creator);
        creator = _creator;
    }

    /**
     * @notice Transfert Factory Ownership
     * @param _factory the new factory address
     * @dev Callable by factory
     */
    function transferFactoryOwnership(address _factory) external onlyFactory onlyAddressInit(_factory) {
        emit FactoryOwnershipTransferred(factory, _factory);
        factory = _factory;
    }

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
    modifier onlyFactoryOrCreator() {
        require(msg.sender == factory || msg.sender == creator, "Caller is not the factory or creator");
        _;
    }

    /**
     * @notice Modifier that ensure only admin or keeper can access this function
     */
    modifier onlyFactoryOrKeeper() {
        require(msg.sender == factory || msg.sender == address(keeper), "Caller is not the factory or keeper");
        _;
    }

    /**
     * @notice Modifier that ensure only keeper can access this function
     */
    modifier onlyKeeper() {
        require(msg.sender == address(keeper), "Caller is not the keeper");
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
        require(isInProgress, "Game is not in progress");
        _;
    }

    /**
     * @notice Modifier that ensure that the game is not in progress
     */
    modifier onlyIfGameIsNotInProgress() {
        require(!isInProgress, "Game is already in progress");
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
        require(true == true, "Game is not splittable");
        _;
    }
}
