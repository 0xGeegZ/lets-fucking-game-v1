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
    .createNewGameLine(10, 2, this.correctRegistrationAmount)
  const clonedContract = await gameFactoryContract.deployedGameLines('0')
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

const makePlayerLooseForNotPlaying = async function ({
  players,
  contract,
  otherPlayer1Index,
  otherPlayer2Index,
  startedGameTimestamp,
  mockKeeper,
}) {
  const otherPlayer1InitialData = await contract.players(
    players[otherPlayer1Index].address
  )
  const otherPlayer2InitialData = await contract.players(
    players[otherPlayer2Index].address
  )

  const otherPlayer1RangeLowerLimit =
    otherPlayer1InitialData.roundRangeLowerLimit
  const otherPlayer2RangeLowerLimit =
    otherPlayer2InitialData.roundRangeLowerLimit

  // Time passes until first other player's range, he plays, then until second other player's range, who plays too
  // Whoever has the soonest range plays first
  if (otherPlayer1RangeLowerLimit.eq(otherPlayer2RangeLowerLimit)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      otherPlayer1RangeLowerLimit.toNumber(),
    ])

    await contract.connect(players[otherPlayer1Index]).playRound()
    await contract.connect(players[otherPlayer2Index]).playRound()
  } else if (otherPlayer1RangeLowerLimit.lt(otherPlayer2RangeLowerLimit)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      otherPlayer1RangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[otherPlayer1Index]).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      otherPlayer2RangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[otherPlayer2Index]).playRound()
  } else {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      otherPlayer2RangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[otherPlayer2Index]).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      otherPlayer1RangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[otherPlayer1Index]).playRound()
  }

  // Time passes until next checkpoint
  await ethers.provider.send('evm_increaseTime', [
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
  await makePlayerLooseForNotPlaying({
    players,
    contract,
    otherPlayer1Index: winnerIndex,
    otherPlayer2Index: secondPlayerIndex,
    startedGameTimestamp,
    mockKeeper,
  })

  const secondRoundStartedBlock = await ethers.provider.getBlock()

  const secondRoundStartedTimestamp = secondRoundStartedBlock.timestamp

  const firstPlayerInitialData = await contract.players(
    players[winnerIndex].address
  )
  const secondPlayerInitialData = await contract.players(
    players[secondPlayerIndex].address
  )
  const firstPlayerRangeLowerLimit = firstPlayerInitialData.roundRangeLowerLimit
  const secondPlayerRangeUpperLimit =
    secondPlayerInitialData.roundRangeUpperLimit

  // Time passes beyond second player's round range and until winner's round range
  // Both play and second player looses
  if (firstPlayerRangeLowerLimit.eq(secondPlayerRangeUpperLimit)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      firstPlayerRangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[winnerIndex]).playRound()
    await contract.connect(players[secondPlayerIndex]).playRound()
  } else if (firstPlayerRangeLowerLimit.lt(secondPlayerRangeUpperLimit)) {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      firstPlayerRangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[winnerIndex]).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      secondPlayerRangeUpperLimit.toNumber(),
    ])
    await contract.connect(players[secondPlayerIndex]).playRound()
  } else {
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      secondPlayerRangeUpperLimit.toNumber(),
    ])
    await contract.connect(players[secondPlayerIndex]).playRound()
    await ethers.provider.send('evm_setNextBlockTimestamp', [
      firstPlayerRangeLowerLimit.toNumber(),
    ])
    await contract.connect(players[winnerIndex]).playRound()
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
  makePlayerLooseForNotPlaying,
  setUpGameWithAWinner,
}
