import { deployments, ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { ONE_DAY_IN_SECONDS } from '../helpers'

const AUTHORIZED_AMOUNTS = [
  0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
]

const setupTest = deployments.createFixture(
  async ({
    deployments,
    getNamedAccounts,
    ethers,
  }: HardhatRuntimeEnvironment) => {
    await deployments.fixture('test')

    const { deploy, log } = deployments
    const { deployer: deployerAddress } = await getNamedAccounts()

    const deployer = await ethers.getSigner(deployerAddress)

    const options = {
      from: deployerAddress,
      log: true,
    }

    const { address: cronExternalAddress } = await deployments.get(
      'CronExternal'
    )

    // const cronExternalInterface = await ethers.getContractFactory(
    //   'CronExternal',
    //   {
    //     contract:
    //       '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron',
    //   }
    // )

    // const cronExternal = new ethers.Contract(
    //   cronExternalAddress,
    //   cronExternalInterface.interface,
    //   deployer
    // )

    const libraries = {
      libraries: {
        Cron: cronExternalAddress,
      },
    }

    const gameFactoryContract = await deployments.get('GameFactory')

    const gameContract = await deployments.get('GameV1', libraries)

    const cronUpkeepContract = await deployments.get('CronUpkeep', libraries)

    const secondGameV1Contract = await deploy('GameV1', {
      ...options,
      ...libraries,
    })

    const gameInterface = await ethers.getContractFactory('GameV1', libraries)

    const secondGameV1 = new ethers.Contract(
      secondGameV1Contract.address,
      gameInterface.interface,
      deployer
    )

    const cronUpkeepInterface = await ethers.getContractFactory(
      'CronUpkeep',
      libraries
    )

    const cronUpkeep = new ethers.Contract(
      cronUpkeepContract.address,
      cronUpkeepInterface.interface,
      deployer
    )

    const gameFactoryInterface = await ethers.getContractFactory('GameFactory')

    const gameFactory = new ethers.Contract(
      gameFactoryContract.address,
      gameFactoryInterface.interface,
      deployer
    )

    const game = new ethers.Contract(
      gameContract.address,
      gameInterface.interface,
      deployer
    )

    const payableGame = await gameFactory.deployedGames('0')

    const deployedPayableGame = new ethers.Contract(
      payableGame.deployedAddress,
      gameInterface.interface,
      deployer
    )

    const freeGame = await gameFactory.deployedGames('1')

    const deployedFreeGame = new ethers.Contract(
      freeGame.deployedAddress,
      gameInterface.interface,
      deployer
    )

    const GameFactoryContract = await ethers.getContractFactory('GameFactory')

    const GameV1Contract = await ethers.getContractFactory('GameV1', libraries)

    return {
      deployer,
      GameFactoryContract,
      GameV1Contract,
      // cronExternal,
      gameFactory,
      game,
      cronUpkeep,
      secondGameV1,
      deployedPayableGame,
      deployedFreeGame,
    }
  }
)

const initialiseTestData = async function () {
  let alice = null,
    bob = null,
    mockKeeper = null,
    players = null

  // first signer is deployer, associating to mockKeeeper
  ;[mockKeeper, bob, alice, ...players] = await ethers.getSigners()

  if (players.length < 10)
    throw new Error('Not enough players to launch test suit')

  this.players = players
  this.bob = bob
  this.alice = alice

  this.name = "Let's Fucking Game VMP"
  this.image = ''

  this.maxPlayers = 10
  this.playTimeRange = 2

  this.correctRegistrationAmount = ethers.utils.parseEther('0.0001')
  this.incorrectRegistrationAmount = ethers.utils.parseEther('0.03')
  this.zeroRegistrationAmount = ethers.utils.parseEther('0')

  this.freeGamePrizepool = 1
  this.freeGamePrizepoolAmount = ethers.utils.parseEther('1')

  this.gameCreationAmount = ethers.utils.parseEther('0.1')
  this.treasuryFee = 500 // 5%
  this.creatorFee = 500 // 5%

  // prizeAmount equals total prize amount minus treasury fee
  this.prizeAmount = ethers.utils.parseEther('0.0009')

  this.launchDuration = 60 * 60 * 25
  this.upperMaxDuration = 60 * 60 * 24
  this.underMaxDuration = 60 * 60 * 20

  this.nextAllowedPlay = ONE_DAY_IN_SECONDS
  this.RoundMaximumDuration = ONE_DAY_IN_SECONDS * 2

  // TODO Implement business logic to cover keeper in test
  this.mockKeeper = mockKeeper

  this.encodedCron = '0 18 * * *'

  this.authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) =>
    ethers.utils.parseEther(`${amount}`)
  )

  this.prizes = [
    {
      position: '1',
      amount: this.correctRegistrationAmount.mul(this.maxPlayers),
      standard: '0',
      contractAddress: '0x0000000000000000000000000000000000000000',
      tokenId: '1',
    },
  ]

  const updatedPrizes = []
  updatedPrizes.push({ ...this.prizes[0] })
  updatedPrizes.push({ ...this.prizes[0] })

  updatedPrizes[0].amount = ethers.utils.parseEther(
    `${this.freeGamePrizepool * 0.8}`
  )
  updatedPrizes[1].amount = ethers.utils.parseEther(
    `${this.freeGamePrizepool * 0.2}`
  )
  updatedPrizes[1].position = 2

  this.freeGamePrizes = updatedPrizes

  const {
    deployer,
    GameFactoryContract,
    GameV1Contract,
    // cronExternal,
    gameFactory,
    game,
    cronUpkeep,
    secondGameV1,
    deployedPayableGame,
    deployedFreeGame,
  } = await setupTest()

  this.owner = deployer

  this.GameV1Contract = GameV1Contract
  this.GameFactoryContract = GameFactoryContract
  // this.cronExternal = cronExternal

  this.cronUpkeep = cronUpkeep
  this.gameFactory = gameFactory
  this.game = game
  this.secondGameV1 = secondGameV1
  this.deployedPayableGame = deployedPayableGame
  this.deployedFreeGame = deployedFreeGame
}

module.exports = {
  initialiseTestData,
}
