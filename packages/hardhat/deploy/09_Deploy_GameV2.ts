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

  log('Deploying GameV2 contract')
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
  } = await deploy('GameV2', { ...options, ...libraries })

  if (gameNewlyDeployed) {
    log(
      `✅ Contract GameV2 deployed at ${gameAddress} using ${gameGasUsed} gas`
    )
  }

  log('Adding GameV2 to Keeper delegators')

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

func.tags = ['all', 'lfg', 'main', 'game-v2', 'test']
func.dependencies = ['keeper']

export default func
