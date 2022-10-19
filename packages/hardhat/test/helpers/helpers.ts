import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers } from 'hardhat'

const ONE_HOUR_IN_SECOND = 3600
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECOND * 24

const beforeEachGameFactory = async function () {
  let owner = null,
    secondAccount = null,
    thirdAccount = null

  ;[owner, secondAccount, thirdAccount] = await ethers.getSigners()

  this.owner = owner
  this.secondAccount = secondAccount
  this.thirdAccount = thirdAccount
  this.roundLength = 2
  this.maxPlayers = 10
  this.registrationAmount = ethers.utils.parseEther('0.0001')
  this.houseEdge = ethers.utils.parseEther('0.000005')
  this.creatorEdge = ethers.utils.parseEther('0.000005')

  const GameFactoryContract = await ethers.getContractFactory('GameFactory')
  const GameImplementationContract = await ethers.getContractFactory(
    'GameImplementation'
  )
  const gameImplementationContract = await GameImplementationContract.deploy()
  await gameImplementationContract.deployed()
  const gameFactoryContract = await GameFactoryContract.connect(owner).deploy(
    gameImplementationContract.address,
    this.houseEdge,
    this.creatorEdge
  )
  await gameFactoryContract.deployed()

  const secondGameImplementationContract =
    await GameImplementationContract.deploy()
  await secondGameImplementationContract.deployed()

  this.GameImplementationContract = GameImplementationContract
  this.GameFactoryContract = GameFactoryContract

  this.gameFactoryContract = gameFactoryContract
  this.gameImplementationContract = gameImplementationContract
  this.secondGameImplementationContract = secondGameImplementationContract
}

const beforeEachGameImplementation = async function () {
  let creator = null,
    players = null

  ;[creator, ...players] = await ethers.getSigners()
  this.creator = creator
  this.players = players
  this.correctRegistrationAmount = ethers.utils.parseEther('0.0001')
  this.houseEdge = ethers.utils.parseEther('0.00005')
  this.creatorEdge = ethers.utils.parseEther('0.00005')
  this.prizeAmount = ethers.utils.parseEther('0.0009') // prizeAmount equals total prize amount minus house edge
  this.incorrectRegistrationAmount = ethers.utils.parseEther('0.03')
  this.zeroRegistrationAmount = ethers.utils.parseEther('0')
  this.launchDuration = 60 * 60 * 25
  this.nextAllowedPlay = ONE_DAY_IN_SECONDS
  this.RoundMaximumDuration = ONE_DAY_IN_SECONDS * 2
  this.upperMaxDuration = 60 * 60 * 24
  this.underMaxDuration = 60 * 60 * 20
  this.mockKeeper = players[18]
  this.generalAdmin = players[17]

  const GameFactoryContract = await ethers.getContractFactory('GameFactory')
  const GameImplementationContract = await ethers.getContractFactory(
    'GameImplementation'
  )
  const gameImplementationContract = await GameImplementationContract.deploy()
  await gameImplementationContract.deployed()
  const gameFactoryContract = await GameFactoryContract.connect(
    this.generalAdmin
  ).deploy(gameImplementationContract.address, this.houseEdge, this.creatorEdge)
  await gameFactoryContract.deployed()
  await gameFactoryContract
    .connect(creator)
    .createNewGame(10, 2, this.correctRegistrationAmount)
  const clonedContract = await gameFactoryContract.deployedGames('0')
  this.contract = await GameImplementationContract.attach(
    clonedContract.deployedAddress
  )

  await this.contract.connect(this.generalAdmin).setKeeper(players[18].address)
}

const registerPlayer = async function ({ player, contract, value }) {
  await expect(contract.connect(player).registerForGame({ value }))
    .to.emit(contract, 'RegisteredForGame')
    .withArgs(player.address, anyValue)
}

const setUpGameReadyToPlay = async function ({
  players,
  contract,
  amount,
  mockKeeper,
}) {
  // 10 players register for the game.
  for (let i = 0; i < 10; i++) {
    await registerPlayer({ player: players[i], contract, value: amount })
  }

  // Some time passes before the daily checkpoint gets triggered
  await ethers.provider.send('evm_increaseTime', [7200])

  // Daily checkpoint gets triggered, the game starts
  return contract.connect(mockKeeper).triggerDailyCheckpoint()
}

const getTwoPlayersInFinal = async function ({
  players,
  contract,
  player1Index,
  player2Index,
  startedGameTimestamp,
  mockKeeper,
}) {
  const player1 = players[player1Index]
  const player2 = players[player2Index]

  const player1InitialData = await contract.players(player1.address)
  const player2InitialData = await contract.players(player2.address)
  const player1RangeStart = player1InitialData.roundRangeLowerLimit
  const player2RangeStart = player2InitialData.roundRangeLowerLimit

  // Time passes until first other player's range, he plays, then until second other player's range, who plays too
  // Whoever has the soonest range plays first
  if (player1RangeStart.eq(player2RangeStart)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      player1RangeStart.toNumber() + 1,
    ])

    await contract.connect(player1).playRound()
    await contract.connect(player2).playRound()
  } else if (player1RangeStart.lt(player2RangeStart)) {
    // Here time passes until player1 range starts. player1 plays.
    // Then time passes until player2 range starts. player2 plays.
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      player1RangeStart.toNumber() + 1,
    ])
    await contract.connect(player1).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      player2RangeStart.toNumber(),
    ])
    await contract.connect(players[player2Index]).playRound()
  } else if (player2RangeStart.lt(player1RangeStart)) {
    // Here time passes until player2 range starts. player2 plays.
    // Then time passes until player1 range starts. player1 plays.
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      player2RangeStart.toNumber() + 1,
    ])
    await contract.connect(player2).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      player1RangeStart.toNumber() + 1,
    ])
    await contract.connect(player1).playRound()
  } else {
    console.log('Error, we should never reach this stage')
  }

  // Time passes until next checkpoint.
  // All the other players didn't play so they have lost.
  // Only player1 and player2 are still in competition and haved hence reached the final

  await ethers.provider.send('evm_setNextBlockTimestamp', [
    startedGameTimestamp + ONE_DAY_IN_SECONDS,
  ])

  return contract.connect(mockKeeper).triggerDailyCheckpoint()
}

const setUpGameWithAWinner = async function ({
  players,
  winnerIndex,
  contract,
  amount,
  mockKeeper,
}) {
  const secondPlayerIndex = 2
  await setUpGameReadyToPlay({
    players,
    contract,
    amount,
    mockKeeper,
  })

  const startedGameBlock = await ethers.provider.getBlock()
  const startedGameTimestamp = startedGameBlock.timestamp

  // 8 players lost for not playing, 2 players remain in second round
  // 2 players remain in competition, winnerIndex & secondPlayerIndex
  await getTwoPlayersInFinal({
    players,
    contract,
    player1Index: winnerIndex,
    player2Index: secondPlayerIndex,
    startedGameTimestamp,
    mockKeeper,
  })

  const secondRoundStartedBlock = await ethers.provider.getBlock()

  const secondRoundStartedTimestamp = secondRoundStartedBlock.timestamp

  const winner = players[winnerIndex]
  const looser = players[secondPlayerIndex]

  const winnerData = await contract.players(winner.address)
  const looserData = await contract.players(looser.address)

  const winnerRangeStart = winnerData.roundRangeLowerLimit
  const looserRangeEnd = looserData.roundRangeUpperLimit

  // Time passes beyond looser's round range and until winner's round range
  // Both play and looser looses
  if (winnerRangeStart.eq(looserRangeEnd)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      winnerRangeStart.toNumber() + 1,
    ])
    await contract.connect(winner).playRound()
    await contract.connect(looser).playRound()
  } else if (winnerRangeStart.lt(looserRangeEnd)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      winnerRangeStart.toNumber() + 1,
    ])
    await contract.connect(winner).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      looserRangeEnd.toNumber() + 1,
    ])
    await contract.connect(looser).playRound()
  } else if (looserRangeEnd.lt(winnerRangeStart)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      winnerRangeStart.toNumber() + 1,
    ])
    await contract.connect(looser).playRound()
    await contract.connect(winner).playRound()
  } else {
    console.log('Error, we should never reach this stage')
  }

  // Time passes until next checkpoint
  await ethers.provider.send('evm_setNextBlockTimestamp', [
    secondRoundStartedTimestamp + ONE_DAY_IN_SECONDS + ONE_HOUR_IN_SECOND,
  ])

  return contract.connect(mockKeeper).triggerDailyCheckpoint()
}

module.exports = {
  ONE_HOUR_IN_SECOND,
  ONE_DAY_IN_SECONDS,
  beforeEachGameImplementation,
  beforeEachGameFactory,
  registerPlayer,
  setUpGameReadyToPlay,
  getTwoPlayersInFinal,
  setUpGameWithAWinner,
}
