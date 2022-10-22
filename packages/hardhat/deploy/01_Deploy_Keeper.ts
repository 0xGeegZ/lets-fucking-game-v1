import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log('Deploying CronUpkeepDelegate contract')
  const cronUpkeepDelegate = await deploy('CronUpkeepDelegate', {
    from: deployer,
    log: true,
  })

  log('Deploying CronExternal contract')
  const cronExternal = await deploy('CronExternal', {
    from: deployer,
    contract: '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron',
    log: true,
  })

  log('Deploying CronUpkeep contract')
  await deploy('CronUpkeep', {
    from: deployer,
    log: true,
    args: [
      deployer,
      cronUpkeepDelegate.address,
      10,
      ethers.utils.toUtf8Bytes(''),
    ],
    libraries: {
      Cron: cronExternal.address,
    },
  })
}

func.tags = ['all', 'lfg', 'main', 'keeper']

export default func
