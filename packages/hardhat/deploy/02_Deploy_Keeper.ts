import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const CRON_MAX_JOBS = 100
  const options = {
    from: deployer,
    log: true,
  }

  log('Deploying CronUpkeepDelegate contract')
  const cronUpkeepDelegate = await deploy('CronUpkeepDelegate', {
    ...options,
    contract: '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron',
  })

  log('Deploying CronExternal contract')
  const {
    address: cronExternalAddress,
    newlyDeployed: cronExternalNewlyDeployed,
    receipt: { gasUsed: cronExternalGasUsed },
  } = await deploy('CronExternal', {
    ...options,
    contract: '@chainlink/contracts/src/v0.8/libraries/external/Cron.sol:Cron',
  })

  if (cronExternalNewlyDeployed) {
    log(
      `✅ Contract CronExternal deployed at ${cronExternalAddress} using ${cronExternalGasUsed} gas`
    )
  }

  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  log('Deploying CronUpkeep contract')
  const {
    address: cronUpkeepAddress,
    newlyDeployed: cronUpkeepNewlyDeployed,
    receipt: { gasUsed: cronUpkeepGasUsed },
  } = await deploy('CronUpkeep', {
    ...options,
    ...libraries,
    args: [
      deployer,
      cronUpkeepDelegate.address,
      CRON_MAX_JOBS,
      ethers.utils.toUtf8Bytes(''),
    ],
  })

  if (cronUpkeepNewlyDeployed) {
    log(
      `✅ Contract CronUpkeep deployed at ${cronUpkeepAddress} using ${cronUpkeepGasUsed} gas`
    )
  }
}

func.tags = ['all', 'lfg', 'main', 'keeper', 'test']

export default func
