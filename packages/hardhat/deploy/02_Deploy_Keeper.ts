import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

import { delay } from '../helpers/delay'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  const isLocalDeployment = chainId === '31337' || chainId === '1337'

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
  const cronUpkeepArgs = [
    deployer,
    cronUpkeepDelegate.address,
    CRON_MAX_JOBS,
    ethers.utils.toUtf8Bytes(''),
  ]
  const {
    address: cronUpkeepAddress,
    newlyDeployed: cronUpkeepNewlyDeployed,
    receipt: { gasUsed: cronUpkeepGasUsed },
  } = await deploy('CronUpkeep', {
    ...options,
    ...libraries,
    args: cronUpkeepArgs,
  })

  if (cronUpkeepNewlyDeployed) {
    log(
      `✅ Contract CronUpkeep deployed at ${cronUpkeepAddress} using ${cronUpkeepGasUsed} gas`
    )
  }

  if (isLocalDeployment) return

  try {
    log(`✅ Verifying contract CronExternal`)
    await hre.run('verify:verify', {
      address: cronExternalAddress,
      constructorArguments: [],
    })
    await delay(10 * 1000)

    log(`✅ Verifying contract CronUpkeep`)
    await hre.run('verify:verify', {
      address: cronUpkeepAddress,
      constructorArguments: cronUpkeepArgs,
    })
    await delay(10 * 1000)
  } catch (error) {
    console.error('Error during contract verification', error.message)
  }
}

func.tags = ['all', 'lfg', 'main', 'keeper', 'test']

export default func
