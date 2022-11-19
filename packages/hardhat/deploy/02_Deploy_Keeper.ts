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
  const {
    address: cronUpkeepDelegateAddress,
    newlyDeployed: cronUpkeepDelegateNewlyDeployed,
    receipt: { gasUsed: cronUpkeepDelegateGasUsed },
  } = await deploy('CronUpkeepDelegate', {
    ...options,
  })

  if (cronUpkeepDelegateNewlyDeployed) {
    log(
      `✅ Contract CronUpkeepDelegate deployed at ${cronUpkeepDelegateAddress} using ${cronUpkeepDelegateGasUsed} gas`
    )
  }

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
    cronUpkeepDelegateAddress,
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

  if (cronUpkeepNewlyDeployed)
    log(
      `✅ Contract CronUpkeep deployed at ${cronUpkeepAddress} using ${cronUpkeepGasUsed} gas`
    )

  if (isLocalDeployment) {
    log('Deploying a Second CronUpkeep contract for test case')

    const {
      address: cronUpkeepSecondaryAddress,
      newlyDeployed: cronUpkeepSecondaryNewlyDeployed,
      receipt: { gasUsed: cronUpkeepSecondaryGasUsed },
    } = await deploy('CronUpkeepSecondary', {
      ...options,
      ...libraries,
      contract: 'CronUpkeep',
      args: cronUpkeepArgs,
    })

    if (cronUpkeepSecondaryNewlyDeployed)
      log(
        `✅ Contract CronUpkeep secondary deployed at ${cronUpkeepSecondaryAddress} using ${cronUpkeepSecondaryGasUsed} gas`
      )
  }

  if (isLocalDeployment || !cronUpkeepNewlyDeployed) return

  await delay(30 * 1000)
  try {
    log(`✅ Verifying contract CronExternal`)
    await hre.run('verify:verify', {
      address: cronExternalAddress,
      constructorArguments: [],
    })
    await delay(10 * 1000)
  } catch (error) {
    console.error('Error during contract verification', error.message)
  }

  try {
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

func.tags = ['all', 'test', 'dev', 'staging', 'prod', 'keeper']

export default func
