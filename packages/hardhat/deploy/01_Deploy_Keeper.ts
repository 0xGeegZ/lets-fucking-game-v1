import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getExtendedArtifactFromFolders,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  // if (chainId === '31337') {
  const cronUpkeepDelegate = await deploy('CronUpkeepDelegate', {
    from: deployer,
    log: true,
  })

  const cron = await deploy('CronExternal', {
    from: deployer,
    contract: '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron',
    log: true,
  })

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
      Cron: cron.address,
    },
  })
  // }
}

func.tags = ['all', 'lfg', 'main', 'keeper']

export default func
