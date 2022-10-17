// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Address.sol";

contract GameImplementation {
  using Address for address;

  bool private _isBase;
  uint256 private randNonce;

  address public generalAdmin;
  address public creator;
  address public factory;
  address public keeper;
  string public keeperCron;

  uint256 public registrationAmount;
  uint256 public houseEdge;
  uint256 public creatorEdge;

  uint256 public gameLineId;
  uint256 public gameId; // This gets incremented every time the game restarts
  string public gameName;
  string public gameImage;

  uint256 public gameImplementationVersion;

  uint256 public roundLength; // Time length of a round in hours
  uint256 public maxPlayers;
  uint256 public numPlayers;

  bool public gameInProgress; // Helps the keeper determine if a game has started or if we need to start it
  bool public contractPaused;

  address[] public playerAddresses;
  mapping(address => Player) public players;
  mapping(uint256 => Winner) public gameWinners;

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

  struct Winner {
    uint256 gameId;
    address playerAddress;
    uint256 amountWon;
    bool prizeClaimed;
  }

  struct Initialization {
    address _initializer;
    address _factoryOwner;
    uint256 _gameImplementationVersion;
    uint256 _gameLineId;
    uint256 _roundLength;
    uint256 _maxPlayers;
    uint256 _registrationAmount;
    uint256 _houseEdge;
    uint256 _creatorEdge;
  }

  ///EVENTS
  event RegisteredForGame(address playerAddress, uint256 playersCount);
  event StartedGame(uint256 timelock, uint256 playersCount);
  event ResetGame(uint256 timelock, uint256 resetGameId);
  event GameLost(uint256 gameId, address playerAddress);
  event PlayedRound(address playerAddress);
  event GameWon(uint256 gameId, address playerAddress, uint256 amountWon);
  event FailedTransfer(address receiver, uint256 amount);
  event Received(address sender, uint256 amount);
  event GamePrizeClaimed(address claimer, uint256 gameId, uint256 amountClaimed);

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

    registrationAmount = initialization._registrationAmount;
    houseEdge = initialization._houseEdge;
    creatorEdge = initialization._creatorEdge;

    gameLineId = initialization._gameLineId;
    gameImplementationVersion = initialization._gameImplementationVersion;

    gameId = 0;
    roundLength = initialization._roundLength;
    maxPlayers = initialization._maxPlayers;

    // TODO (Will need a big refacto for tests cases) reactivate to ensure that keeper is initialised
    // pause contract by default as we need to set keeper data to unpause contract
    // contractPaused = true;
  }

  // TODO remove in next smart contract version
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

  modifier onlyKeeper() {
    require(msg.sender == keeper, "Caller is not the keeper");
    _;
  }

  modifier onlyIfKeeperDataInit() {
    require(keeper != address(0), "Keeper need to be initialised");
    require(bytes(keeperCron).length != 0, "Keeper cron need to be initialised");
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
    require(contractPaused != true, "Contract is paused");
    _;
  }

  modifier onlyPaused() {
    require(contractPaused != false, "Contract is not paused");
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

  // This function gets called every 24 hours
  function triggerDailyCheckpoint() external onlyKeeper onlyNotPaused {
    if (gameInProgress == true) {
      _refreshPlayerStatus();
      _checkIfGameEnded();
    } else {
      if (numPlayers == maxPlayers) {
        _startGame();
      }
    }
  }

  function claimPrize(uint256 _gameId) external {
    require(_gameId <= gameId, "This game does not exist");
    require(msg.sender == gameWinners[_gameId].playerAddress, "Player did not win this game");
    require(gameWinners[_gameId].prizeClaimed == false, "Prize for this game already claimed");
    require(address(this).balance >= gameWinners[_gameId].amountWon, "Not enough funds in contract");

    gameWinners[_gameId].prizeClaimed = true;
    _safeTransfert(msg.sender, gameWinners[_gameId].amountWon);
    emit GamePrizeClaimed(msg.sender, gameWinners[_gameId].gameId, gameWinners[_gameId].amountWon);
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

    emit ResetGame(block.timestamp, gameId);
    gameId += 1;
  }

  function _safeTransfert(address receiver, uint256 amount) internal {
    uint256 balance = address(this).balance;
    if (balance < amount) require(false, "Not enough in contract balance");

    (bool success, ) = receiver.call{value: amount}("");

    if (!success) {
      emit FailedTransfer(receiver, amount);
      require(false, "Transfer failed.");
    }
  }

  function _checkIfGameEnded() internal {
    uint256 remainingPlayersCounter;
    address lastNonLoosingPlayerAddress;
    for (uint256 i = 0; i < numPlayers; i++) {
      Player memory currentPlayer = players[playerAddresses[i]];
      if (!currentPlayer.hasLost) {
        remainingPlayersCounter += 1;
        lastNonLoosingPlayerAddress = currentPlayer.playerAddress;
      }
    }

    //Game is over, set the last non loosing player as winner and reset game.
    if (remainingPlayersCounter == 1) {
      // TODO houseEdge + creatorEdge are cumultate.
      uint256 prize = registrationAmount * numPlayers - houseEdge - creatorEdge;
      gameWinners[gameId] = Winner({
        playerAddress: lastNonLoosingPlayerAddress,
        amountWon: prize,
        prizeClaimed: false,
        gameId: gameId
      });

      emit GameWon(gameId, lastNonLoosingPlayerAddress, prize);

      _resetGame();
    }

    // If no winner, the house keeps the prize and reset the game
    if (remainingPlayersCounter == 0) {
      _resetGame();
    }
  }

  function _refreshPlayerStatus() internal {
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
    uint256 maxUpperRange = 25 - roundLength; // We use 25 because modulo excludes the higher limit
    uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, playerAddress, randNonce))) %
      maxUpperRange;
    return randomNumber;
  }

  function _resetRoundRange(Player storage player) internal {
    uint256 newRoundLowerLimit = _randMod(player.playerAddress);
    player.roundRangeLowerLimit = block.timestamp + newRoundLowerLimit * 60 * 60;
    player.roundRangeUpperLimit = player.roundRangeLowerLimit + roundLength * 60 * 60;
  }

  function _setPlayerAsHavingLost(Player storage player) internal {
    player.hasLost = true;
    player.isSplitOk = false;

    emit GameLost(gameId, player.playerAddress);
  }

  /// CREATOR FUNCTIONS

  function setGameName(string calldata _gameName) external onlyCreator {
    gameName = _gameName;
  }

  function setGameImage(string calldata _gameImage) external onlyCreator {
    gameImage = _gameImage;
  }

  function withdrawCreatorEdge() external onlyCreator {
    require(address(this).balance >= creatorEdge);
    _safeTransfert(creator, creatorEdge);
  }

  /// ADMIN FUNCTIONS
  function withdrawAdminEdge() external onlyAdmin {
    require(address(this).balance >= houseEdge);
    _safeTransfert(generalAdmin, houseEdge);
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
  function setKeeper(address _keeper) external onlyCreatorOrAdmin {
    keeper = _keeper;
  }

  function setKeeperCron(string memory _keeperCron) external onlyCreatorOrAdmin {
    keeperCron = _keeperCron;
  }

  function pause() external onlyCreatorOrAdmin onlyNotPaused {
    contractPaused = true;
  }

  // TODO (Will need a big refactor for tests cases) reactivate to ensure that keeper is initialised
  // function unpause() external onlyCreatorOrAdmin onlyPaused onlyIfKeeperDataInit {
  function unpause() external onlyCreatorOrAdmin onlyPaused onlyIfKeeperDataInit {
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
      gameId,
      gameName,
      gameImage,
      numPlayers,
      maxPlayers,
      registrationAmount,
      roundLength,
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

  ///
  /// HELPERS FUNCTIONS
  ///

  function getRemainingPlayersCount() external view returns (uint256) {
    uint256 remainingPlayers = 0;
    for (uint256 i = 0; i < numPlayers; i++) {
      if (!players[playerAddresses[i]].hasLost) {
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
