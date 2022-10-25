import { ethers } from 'hardhat'

import { ONE_DAY_IN_SECONDS } from '../helpers/helpers'

const AUTHORIZED_AMOUNTS = [
  0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
]
const MAX_CRON_JOB = 100

const initialiseTestData = async function () {
  let alice = null,
    bob = null,
    owner = null,
    players = null

  ;[owner, bob, alice, ...players] = await ethers.getSigners()

  this.owner = owner
  this.players = players
  this.bob = bob
  this.alice = alice

  this.maxPlayers = 10
  this.playTimeRange = 2

  this.correctRegistrationAmount = ethers.utils.parseEther('0.0001')
  this.incorrectRegistrationAmount = ethers.utils.parseEther('0.03')
  this.zeroRegistrationAmount = ethers.utils.parseEther('0')

  this.houseEdge = ethers.utils.parseEther('0.00005')
  this.creatorEdge = ethers.utils.parseEther('0.00005')
  // prizeAmount equals total prize amount minus house edge
  this.prizeAmount = ethers.utils.parseEther('0.0009')

  this.launchDuration = 60 * 60 * 25
  this.upperMaxDuration = 60 * 60 * 24
  this.underMaxDuration = 60 * 60 * 20

  this.nextAllowedPlay = ONE_DAY_IN_SECONDS
  this.RoundMaximumDuration = ONE_DAY_IN_SECONDS * 2

  // TODO Implement business logic to cover keeper in test
  this.mockKeeper = this.owner
  this.encodedCron = '0 18 * * *'

  this.authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) =>
    ethers.utils.parseEther(`${amount}`)
  )

  const CronContract = await ethers.getContractFactory(
    '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron'
  )
  const cronContract = await CronContract.deploy()
  await cronContract.deployed()

  const GameFactoryContract = await ethers.getContractFactory('GameFactory')

  const GameImplementationContract = await ethers.getContractFactory(
    'GameImplementation',
    {
      libraries: {
        Cron: cronContract.address,
      },
    }
  )

  const CronUpkeepDelegateContract = await ethers.getContractFactory(
    'CronUpkeepDelegate'
  )
  const CronUpkeepContract = await ethers.getContractFactory('CronUpkeep', {
    libraries: {
      Cron: cronContract.address,
    },
  })

  const cronUpkeepDelegateContract = await CronUpkeepDelegateContract.deploy()
  await cronUpkeepDelegateContract.deployed()

  const cronUpkeepContract = await CronUpkeepContract.deploy(
    this.owner.address,
    cronUpkeepDelegateContract.address,
    MAX_CRON_JOB,
    ethers.utils.toUtf8Bytes('')
  )
  await cronUpkeepContract.deployed()

  const gameImplementationContract = await GameImplementationContract.deploy()
  await gameImplementationContract.deployed()

  await cronUpkeepContract
    .connect(this.owner)
    .addDelegator(gameImplementationContract.address)

  const gameFactoryContract = await GameFactoryContract.connect(owner).deploy(
    gameImplementationContract.address,
    cronUpkeepContract.address,
    this.houseEdge,
    this.creatorEdge,
    this.authorizedAmounts
  )
  await gameFactoryContract.deployed()

  await cronUpkeepContract
    .connect(this.owner)
    .addDelegator(gameFactoryContract.address)

  const secondGameImplementationContract =
    await GameImplementationContract.deploy()
  await secondGameImplementationContract.deployed()
  await cronUpkeepContract
    .connect(this.owner)
    .addDelegator(secondGameImplementationContract.address)

  this.GameImplementationContract = GameImplementationContract
  this.GameFactoryContract = GameFactoryContract

  this.cronUpkeepContract = cronUpkeepContract
  this.gameFactoryContract = gameFactoryContract
  this.gameImplementationContract = gameImplementationContract
  this.secondGameImplementationContract = secondGameImplementationContract

  await this.gameFactoryContract
    .connect(this.owner)
    .createNewGame(
      this.maxPlayers,
      this.playTimeRange,
      this.correctRegistrationAmount,
      this.encodedCron
    )
  const gameContract = await this.gameFactoryContract.deployedGames('0')

  this.game = await GameImplementationContract.attach(
    gameContract.deployedAddress
  )
}

module.exports = {
  initialiseTestData,
}
