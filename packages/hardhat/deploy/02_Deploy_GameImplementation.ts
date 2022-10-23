import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const cronExternal = await deployments.get('CronExternal')

  log('Deploying GameImplementation contract')
  const gameImplementation = await deploy('GameImplementation', {
    from: deployer,
    log: true,
    libraries: {
      Cron: cronExternal.address,
    },
  })

  const cronUpkeep = await deployments.get('CronUpkeep')

  log('Adding GameImplementation to Keeper delegators')
  cronUpkeep.connect(deployer).addDelegator(gameImplementation.address)
}

func.tags = ['all', 'lfg', 'main', 'game-implementation']

export default func
