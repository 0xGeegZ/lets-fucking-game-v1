import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

import { delay } from '../helpers/delay'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer: deployerAddress } = await getNamedAccounts()
  const chainId = await getChainId()

  const options = {
    from: deployerAddress,
    log: true,
  }

  const isLocalDeployment = chainId === '31337' || chainId === '1337'
  log('Local Network Detected, Deploying external contracts')

  log('Deploying Multicall3 contracts')

  const {
    address: multicall3Address,
    newlyDeployed: multicall3NewlyDeployed,
    receipt: { gasUsed: multicall3GasUsed },
  } = await deploy('Multicall3', options)

  if (multicall3NewlyDeployed) {
    log(
      `✅ Contract Multicall3 deployed at ${multicall3Address} using ${multicall3GasUsed} gas`
    )
  }

  if (isLocalDeployment || !multicall3NewlyDeployed) return

  await delay(30 * 1000)
  try {
    log(`✅ Verifying contract Multicall3`)
    await hre.run('verify:verify', {
      address: multicall3Address,
      constructorArguments: [],
    })
    await delay(10 * 1000)
  } catch (error) {
    console.error('Error during contract verification', error.message)
  }
}

func.tags = ['all', 'test', 'dev', 'staging', 'prod', 'multicall']

export default func
