import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()

  const deployer = await ethers.getSigner(deployerAddress)

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

  const { address: gameImplementationAddress } = await deployments.get(
    'GameImplementation'
  )

  const { address: cronUpkeepAddress } = await deployments.get('CronUpkeep')

  const gameCreationAmount = ethers.utils.parseEther('0.1')

  const AUTHORIZED_AMOUNTS = [
    0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
  ]
  const authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) =>
    ethers.utils.parseEther(`${amount}`)
  )

  log('Deploying GameFactory contract')
  const {
    address: gameFactoryAddress,
    newlyDeployed: gameFactoryNewlyDeployed,
    receipt: { gasUsed: gameFactoryGasUsed },
  } = await deploy('GameFactory', {
    ...options,
    args: [
      gameImplementationAddress,
      cronUpkeepAddress,
      gameCreationAmount,
      authorizedAmounts,
    ],
  })

  if (gameFactoryNewlyDeployed) {
    log(
      `Contract GameFactory deployed at ${gameFactoryAddress} using ${gameFactoryGasUsed} gas`
    )
  }

  log('Adding GameFactory to Keeper delegators')
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
}

func.tags = ['all', 'lfg', 'main', 'game-factory']
module.exports.dependencies = ['game-implementation', 'keeper']

export default func
