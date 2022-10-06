import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  console.log(
    '🚀 ~ file: 00_Deploy_Multicall.ts ~ line 11 ~ deployer',
    deployer
  )
  const chainId = await getChainId()
  console.log('🚀 ~ file: 00_Deploy_Multicall.ts ~ line 13 ~ chainId', chainId)

  if (chainId === '31337') {
    await deploy('Multicall', { from: deployer })
  }
}

func.tags = ['all', 'main']

export default func
