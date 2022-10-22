import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  let gameImplementationAddress: string

  // if (chainId === '31337') {
  //   const gameImplementation = await deployments.get('GameImplementation')
  //   gameImplementationAddress = gameImplementation.address
  // } else {
  const gameImplementation = await deploy('GameImplementation', {
    from: deployer,
    log: true,
  })

  // await gameImplementation.deployed()

  gameImplementationAddress = gameImplementation.address
  // }
  console.log('GameImplementation address:', gameImplementationAddress)
}

func.tags = ['all', 'lfg', 'main', 'game-implementation']

export default func
