import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()

  const deployer = await ethers.getSigner(deployerAddress)

  const randomNumber = () => {
    return Math.floor(Math.random() * (10000 - 1) + 1)
  }

  const name = ethers.utils.formatBytes32String(`LFG MVP #${randomNumber()}`)

  const gameCreationAmount = ethers.utils.parseEther('0.01')
  // const gameCreationAmount = ethers.utils.parseEther('0.1')

  const maxPlayers = 10
  const playTimeRange = 2

  const registrationAmount = ethers.utils.parseEther('0.0001')
  const zeroRegistrationAmount = ethers.utils.parseEther('0')

  const freeGamePrizepool = 0.01
  const freeGamePrizepoolAmount = ethers.utils.parseEther('0.01')
  // const freeGamePrizepool = 1
  // const freeGamePrizepoolAmount = ethers.utils.parseEther('1')

  const treasuryFee = 500 // 5%
  const creatorFee = 500 // 5%

  const encodedCron = '0 17 * * *'

  const prizes = [
    {
      position: '1',
      amount: registrationAmount.mul(maxPlayers),
      standard: '0',
      contractAddress: '0x0000000000000000000000000000000000000000',
      tokenId: '1',
    },
  ]

  const updatedPrizes = []
  updatedPrizes.push({ ...prizes[0] })
  updatedPrizes.push({ ...prizes[0] })

  updatedPrizes[0].amount = ethers.utils.parseEther(
    `${freeGamePrizepool * 0.5}`
  )
  updatedPrizes[1].amount = ethers.utils.parseEther(
    `${freeGamePrizepool * 0.5}`
  )
  updatedPrizes[1].position = 2

  const freeGamePrizes = updatedPrizes

  const { address: gameFactoryAddress } = await deployments.get('GameFactory')

  const { interface: gameFactoryInterface } = await ethers.getContractFactory(
    'GameFactory'
  )

  const gameFactory = new ethers.Contract(
    gameFactoryAddress,
    gameFactoryInterface,
    deployer
  )

  log('Creating new payable game')
  await gameFactory.createNewGame(
    name,
    maxPlayers,
    playTimeRange,
    registrationAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    prizes,
    { value: gameCreationAmount }
  )
  log(`✅ New payable game created`)

  log('Creating new free game')
  await gameFactory.createNewGame(
    name,
    maxPlayers,
    playTimeRange,
    zeroRegistrationAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    freeGamePrizes,
    { value: gameCreationAmount.add(freeGamePrizepoolAmount) }
  )
  log(`✅ New free game created`)

  // log('Creating new free game for 2 players')
  // await gameFactory.createNewGame(
  //   name,
  //   2,
  //   playTimeRange,
  //   zeroRegistrationAmount,
  //   treasuryFee,
  //   creatorFee,
  //   encodedCron,
  //   freeGamePrizes,
  //   { value: gameCreationAmount.add(freeGamePrizepoolAmount) }
  // )
  // log(`✅ New free game for 2 players created`)
}

func.tags = ['all', 'test', 'dev', 'staging', 'create-games']
func.dependencies = ['game-factory']

export default func
