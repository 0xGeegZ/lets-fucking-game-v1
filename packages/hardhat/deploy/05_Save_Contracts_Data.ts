import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
// import saveContractData from '../helpers/saveContractData'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
}: HardhatRuntimeEnvironment) {
  // const chainId = await getChainId()
  // const gameImplementation = await deployments.get('GameImplementation')
  // const gameFactory = await deployments.get('GameImplementation')
  // saveContractData({
  //   [chainId]: {
  //     GameFactory: {
  //       transactionHash: gameFactory.deployTransaction.hash,
  //       address: gameFactory.address,
  //     },
  //     GameImplementation: {
  //       transactionHash: gameImplementation.deployTransaction.hash,
  //       address: gameImplementation.address,
  //     },
  //   },
  // })
}

func.tags = ['all']

export default func
