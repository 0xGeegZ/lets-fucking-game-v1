import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

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

  log('Deploying GameImplementation contract')
  const { address: cronExternalAddress } = await deployments.get('CronExternal')
  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  const {
    address: gameImplementationAddress,
    newlyDeployed: gameImplementationNewlyDeployed,
    receipt: { gasUsed: gameImplementationGasUsed },
  } = await deploy('GameImplementation', { ...options, ...libraries })

  if (gameImplementationNewlyDeployed) {
    log(
      `✅ Contract GameImplementation deployed at ${gameImplementationAddress} using ${gameImplementationGasUsed} gas`
    )
  }

  log('Adding GameImplementation to Keeper delegators')

  const { address: cronUpkeepAddress } = await deployments.get('CronUpkeep')

  const { interface: cronUpkeepInterface } = await ethers.getContractFactory(
    'CronUpkeep',
    libraries
  )

  const cronUpkeep = new ethers.Contract(
    cronUpkeepAddress,
    cronUpkeepInterface,
    deployer
  )
  cronUpkeep.addDelegator(gameImplementationAddress)
}

func.tags = ['all', 'lfg', 'main', 'game-implementation']
module.exports.dependencies = ['keeper']

export default func
