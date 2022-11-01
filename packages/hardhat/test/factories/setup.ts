import { deployments, ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { ONE_DAY_IN_SECONDS } from '../helpers'

const AUTHORIZED_AMOUNTS = [
  0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
  // 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
]

const setupTest = deployments.createFixture(
  async (
    { deployments, getNamedAccounts, ethers }: HardhatRuntimeEnvironment,
    {
      gameName,
      gameImage,
      maxPlayers,
      playTimeRange,
      correctRegistrationAmount,
      gameCreationAmount,
      treasuryFee,
      creatorFee,
      encodedCron,
      prizes,
      freeGameCreationAmount,
      freeGameRegistrationAmount,
      freeGamePrizepoolAmount,
      freeGamePrizes,
    }
  ) => {
    await deployments.fixture()

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

    const gameImplementationContract = await deployments.get(
      'GameImplementation',
      libraries
    )
    const cronUpkeepDelegateContract = await deployments.get(
      'CronUpkeepDelegate'
    )
    const cronUpkeepContract = await deployments.get('CronUpkeep', libraries)

    const secondGameImplementationContract = await deploy(
      'GameImplementation',
      { ...options, ...libraries }
    )

    const gameImplementationInterface = await ethers.getContractFactory(
      'GameImplementation',
      libraries
    )

    const secondGameImplementation = new ethers.Contract(
      secondGameImplementationContract.address,
      gameImplementationInterface.interface,
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

    const gameImplementation = new ethers.Contract(
      gameImplementationContract.address,
      gameImplementationInterface.interface,
      deployer
    )

    // Create a payable game
    await gameFactory.createNewGame(
      gameName,
      gameImage,
      maxPlayers,
      playTimeRange,
      correctRegistrationAmount,
      treasuryFee,
      creatorFee,
      encodedCron,
      prizes,
      { value: gameCreationAmount }
    )
    const payableGame = await gameFactory.deployedGames('0')

    const deployedPayableGame = new ethers.Contract(
      payableGame.deployedAddress,
      gameImplementationInterface.interface,
      deployer
    )

    // Create a free game
    await gameFactory.createNewGame(
      gameName,
      gameImage,
      maxPlayers,
      playTimeRange,
      freeGameRegistrationAmount,
      treasuryFee,
      creatorFee,
      encodedCron,
      freeGamePrizes,
      {
        value: freeGameCreationAmount.add(freeGamePrizepoolAmount),
      }
    )

    const freeGame = await gameFactory.deployedGames('1')

    const deployedFreeGame = new ethers.Contract(
      freeGame.deployedAddress,
      gameImplementationInterface.interface,
      deployer
    )

    const GameFactoryContract = await ethers.getContractFactory('GameFactory')

    const GameImplementationContract = await ethers.getContractFactory(
      'GameImplementation',
      libraries
    )

    return {
      deployer,
      GameFactoryContract,
      GameImplementationContract,
      // cronExternal,
      gameFactory,
      gameImplementation,
      cronUpkeep,
      secondGameImplementation,
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

  this.gameName = "Let's Fucking Game VMP"
  this.gameImage = ''

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

  // this.treasuryFee = ethers.utils.parseEther('0.00005')
  // this.creatorFee = ethers.utils.parseEther('0.00005')

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
    GameImplementationContract,
    // cronExternal,
    gameFactory,
    gameImplementation,
    cronUpkeep,
    secondGameImplementation,
    deployedPayableGame,
    deployedFreeGame,
  } = await setupTest({
    gameName: this.gameName,
    gameImage: this.gameImage,
    maxPlayers: this.maxPlayers,
    playTimeRange: this.playTimeRange,
    correctRegistrationAmount: this.correctRegistrationAmount,
    gameCreationAmount: this.gameCreationAmount,
    treasuryFee: this.treasuryFee,
    creatorFee: this.creatorFee,
    encodedCron: this.encodedCron,
    prizes: this.prizes,
    freeGameCreationAmount: this.gameCreationAmount,
    freeGameRegistrationAmount: this.zeroRegistrationAmount,
    freeGamePrizepoolAmount: this.freeGamePrizepoolAmount,
    freeGamePrizes: this.freeGamePrizes,
  })

  this.owner = deployer

  this.GameImplementationContract = GameImplementationContract
  this.GameFactoryContract = GameFactoryContract
  // this.cronExternal = cronExternal

  this.cronUpkeep = cronUpkeep
  this.gameFactory = gameFactory
  this.gameImplementation = gameImplementation
  this.secondGameImplementation = secondGameImplementation
  this.deployedPayableGame = deployedPayableGame
  this.deployedFreeGame = deployedFreeGame
}

module.exports = {
  initialiseTestData,
}
