import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { networkConfig } from '../config/networkConfig'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()

  const deployer = await ethers.getSigner(deployerAddress)
  const chainId = await getChainId()

  const gameConfig = networkConfig[chainId].gameConfig
  if (!gameConfig) throw new Error('No game config found for chain id', chainId)

  const name = gameConfig.NAME_DEFAULT
  const gameCreationAmount = gameConfig.GAME_CREATION_AMOUNT
  const maxPlayers = gameConfig.PLAYERS_DEFAULT
  const playTimeRange = gameConfig.PLAY_TIME_RANGE_DEFAULT
  const registrationAmount = gameConfig.REGISTRATION_AMOUNT_DEFAULT
  const zeroRegistrationAmount = gameConfig.REGISTRATION_AMOUNT_FREE

  const freeGamePrizepool = gameConfig.PRIZEPOOL_NUMBER
  const freeGamePrizepoolAmount = gameConfig.PRIZEPOOL_AMOUNT

  const treasuryFee = gameConfig.TREASURY_FEE_DEFAULT
  const creatorFee = gameConfig.CREATOR_FEE_DEFAULT
  const encodedCron = gameConfig.ENCODED_CRON_DEFAULT

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

  updatedPrizes[0].amount = ethers.utils.parseEther(`${freeGamePrizepool / 2}`)
  updatedPrizes[1].amount = ethers.utils.parseEther(`${freeGamePrizepool / 2}`)
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
    gameConfig.NAME_DEFAULT,
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

  log('Creating new free game for 2 players')
  await gameFactory.createNewGame(
    name,
    2,
    playTimeRange,
    zeroRegistrationAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    freeGamePrizes,
    { value: gameCreationAmount.add(freeGamePrizepoolAmount) }
  )
  log(`✅ New free game for 2 players created`)
}

func.tags = ['all', 'test', 'dev', 'staging', 'create-games']
func.dependencies = ['game-factory']

export default func
