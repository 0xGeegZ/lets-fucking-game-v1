import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log('Local Network Detected, Deploying external contracts')

  log('Deploying Multicall contracts')
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

  const {
    address: multicall3Address,
    newlyDeployed: multicall3NewlyDeployed,
    receipt: { gasUsed: multicall3GasUsed },
  } = await deploy('Multicall3', { from: deployer })

  if (multicall3Address) {
    log(
      `✅ Contract Multicall3 deployed at ${multicall3NewlyDeployed} using ${multicall3GasUsed} gas`
    )
  }
}

func.tags = ['all', 'main', 'multicall', 'test']

export default func
