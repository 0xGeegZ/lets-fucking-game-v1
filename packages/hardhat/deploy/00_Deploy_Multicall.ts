import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

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
  log('Local Network Detected, Deploying external contracts')

  log('Deploying Multicall contracts')
  const {
    address: multicallAddress,
    newlyDeployed: multicallNewlyDeployed,
    receipt: { gasUsed: multicallGasUsed },
  } = await deploy('Multicall', { from: deployer })

  if (multicallNewlyDeployed) {
    log(
      `✅ Contract Multicall deployed at ${multicallAddress} using ${multicallGasUsed} gas`
    )
  }

  const {
    address: multicall3Address,
    newlyDeployed: multicall3NewlyDeployed,
    receipt: { gasUsed: multicall3GasUsed },
  } = await deploy('Multicall3', { from: deployer })

  if (multicall3NewlyDeployed) {
    log(
      `✅ Contract Multicall3 deployed at ${multicall3Address} using ${multicall3GasUsed} gas`
    )
  }

  if (isLocalDeployment) return

  try {
    log(`✅ Verifying contract Multicall`)
    await hre.run('verify:verify', {
      address: multicallAddress,
      constructorArguments: [],
    })
    await delay(10 * 1000)

    log(`✅ Verifying contract Multicall3`)
    await hre.run('verify:verify', {
      address: multicall3Address,
      constructorArguments: [],
      // constructorArguments: [[Treasury], [20], 20, WETH],
    })
    await delay(10 * 1000)
  } catch (error) {
    console.error('Error during contract verification', error.message)
  }
}

func.tags = ['all', 'test', 'dev', 'staging', 'prod', 'multicall']

export default func
