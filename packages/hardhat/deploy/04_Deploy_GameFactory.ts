import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { gameConfig } from '../config/gameConfig'
import { delay } from '../helpers/delay'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()
  const chainId = await getChainId()

  const isLocalDeployment = chainId === '31337' || chainId === '1337'
  const deployer = await ethers.getSigner(deployerAddress)

  const { GAME_CREATION_AMOUNT, AUTHORIZED_REGISTRATION_AMOUNTS } =
    gameConfig[chainId]

  if (!GAME_CREATION_AMOUNT)
    throw new Error('No game config found for chain id', chainId)

  const options = {
    from: deployerAddress,
    log: true,
  }

  const { address: cronExternalAddress } = await deployments.get('CronExternal')
  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  const { address: gameAddress } = await deployments.get('GameV1')

  const { address: cronUpkeepAddress } = await deployments.get('CronUpkeep')

  const gameCreationAmount = GAME_CREATION_AMOUNT

  const authorizedAmounts = AUTHORIZED_REGISTRATION_AMOUNTS.map((amount) =>
    ethers.utils.parseEther(`${amount}`)
  )

  log('Deploying GameFactory contract')
  const gameFactoryArgs = [
    gameAddress,
    cronUpkeepAddress,
    gameCreationAmount,
    authorizedAmounts,
  ]
  const {
    address: gameFactoryAddress,
    newlyDeployed: gameFactoryNewlyDeployed,
    receipt: { gasUsed: gameFactoryGasUsed },
  } = await deploy('GameFactory', {
    ...options,
    args: gameFactoryArgs,
  })

  if (gameFactoryNewlyDeployed)
    log(
      `✅ Contract GameFactory deployed at ${gameFactoryAddress} using ${gameFactoryGasUsed} gas`
    )

  log('Adding GameFactory to Keeper delegators')
  try {
    const { interface: cronUpkeepInterface } = await ethers.getContractFactory(
      'CronUpkeep',
      libraries
    )

    const cronUpkeep = new ethers.Contract(
      cronUpkeepAddress,
      cronUpkeepInterface,
      deployer
    )
    cronUpkeep.addDelegator(gameFactoryAddress)
  } catch (error) {
    const { interface: cronUpkeepInterface } = await ethers.getContractFactory(
      'CronUpkeep'
    )

    const cronUpkeep = new ethers.Contract(
      cronUpkeepAddress,
      cronUpkeepInterface,
      deployer
    )
    cronUpkeep.addDelegator(gameFactoryAddress)
  }

  if (isLocalDeployment || !gameFactoryNewlyDeployed) return

  await delay(30 * 1000)
  try {
    log(`✅ Verifying contract GameFactory`)
    await hre.run('verify:verify', {
      address: gameFactoryAddress,
      constructorArguments: gameFactoryArgs,
    })
    await delay(10 * 1000)
  } catch (error) {
    console.error('Error during contract verification', error.message)
  }
}

func.tags = ['all', 'test', 'dev', 'staging', 'prod', 'game-factory']
func.dependencies = ['game', 'keeper']

export default func
