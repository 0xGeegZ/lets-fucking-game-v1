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
  console.log('🚀 ~ file: 01_Deploy_Mocks.ts ~ line 12 ~ chainId', chainId)

  if (chainId === '31337') {
    await deploy('LinkToken', { from: deployer, log: true })
  }
}

func.tags = ['all', 'mocks', 'main']

export default func
