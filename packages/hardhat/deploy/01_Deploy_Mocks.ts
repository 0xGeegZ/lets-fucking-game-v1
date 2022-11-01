import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  if (chainId === '31337' || chainId === '1337') {
    await deploy('LinkToken', { from: deployer, log: true })
  }
}

func.tags = ['all', 'mocks', 'main', 'test']

export default func
