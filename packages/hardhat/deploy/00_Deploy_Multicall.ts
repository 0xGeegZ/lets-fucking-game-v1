import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: // getChainId,
HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log('Deploying Multicall contract')
  await deploy('Multicall', { from: deployer })

  // const chainId = await getChainId()

  // if (chainId === '31337') {
  //   log('Local Network Detected, Deploying external contracts')
  //   await deploy('Multicall', { from: deployer })
  // }
}

func.tags = ['all', 'multicall']

export default func
