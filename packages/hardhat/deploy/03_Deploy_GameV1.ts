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

  log('Deploying GameV1 contract')
  const { address: cronExternalAddress } = await deployments.get('CronExternal')
  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  const {
    address: gameAddress,
    newlyDeployed: gameNewlyDeployed,
    receipt: { gasUsed: gameGasUsed },
  } = await deploy('GameV1', { ...options, ...libraries })

  if (gameNewlyDeployed) {
    log(
      `✅ Contract GameV1 deployed at ${gameAddress} using ${gameGasUsed} gas`
    )
  }

  log('Adding GameV1 to Keeper delegators')

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
  cronUpkeep.addDelegator(gameAddress)
}

func.tags = ['all', 'lfg', 'main', 'game-implementation', 'test']
func.dependencies = ['keeper']

export default func
