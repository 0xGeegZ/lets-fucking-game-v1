import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

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
  const GameImplementation = await deployments.get('GameImplementation')
  gameImplementationAddress = GameImplementation.address
  // } else {
  //   gameImplementationAddress = networkConfig[chainId]
  //     .gameImplementation as string
  // }

  // TODO Display Log
  if (!gameImplementationAddress) return

  // TODO add interface for constructorArgs
  // const constructorArgs: Array<string | number | Array<string | number>> = [
  //   '100000000000000',
  // ];

  // const registrationAmount = ethers.utils.parseUnits('0.1', 'gwei');
  const houseEdge = ethers.utils.parseUnits('0.01', 'gwei')
  const creatorEdge = ethers.utils.parseUnits('0.005', 'gwei')

  await deploy('GameFactory', {
    from: deployer,
    args: [
      gameImplementationAddress,
      /*registrationAmount, */ houseEdge,
      creatorEdge,
    ],
    log: true,
  })
}

func.tags = ['all', 'lfg', 'main']

export default func
