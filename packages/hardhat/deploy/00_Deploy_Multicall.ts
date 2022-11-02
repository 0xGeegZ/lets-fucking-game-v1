import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const chainId = await getChainId()

  if (chainId === '31337' || chainId === '1337') {
    log('Local Network Detected, Deploying external contracts')

    log('Deploying Multicall contract')
    const {
      address: multicallAddress,
      newlyDeployed: multicallNewlyDeployed,
      receipt: { gasUsed: multicallGasUsed },
    } = await deploy('Multicall', { from: deployer })

    if (multicallAddress) {
      log(
        `✅ Contract Multicall deployed at ${multicallNewlyDeployed} using ${multicallGasUsed} gas`
      )
    }
  }
}

func.tags = ['all', 'main', 'multicall', 'test']

export default func
