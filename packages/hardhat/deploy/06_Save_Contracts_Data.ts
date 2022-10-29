import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import saveContractData from '../helpers/saveContractData'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const chainId = await getChainId()
  const gameImplementation = await deployments.get('GameImplementation')
  const gameFactory = await deployments.get('GameImplementation')

  const multiCall = await deployments.get('Multicall')

  const cronExternal = await deployments.get('CronExternal')
  const cronUpkeep = await deployments.get('CronUpkeep')
  const cronUpkeepDelegate = await deployments.get('CronUpkeepDelegate')

  saveContractData({
    [chainId]: {
      GameFactory: {
        address: gameFactory.address,
        libraries: gameFactory.libraries || {},
        transactionHash: gameFactory.transactionHash,
      },
      GameImplementation: {
        address: gameImplementation.address,
        libraries: gameImplementation.libraries || {},
        transactionHash: gameImplementation.transactionHash,
      },
      MultiCall: {
        address: multiCall.address,
        libraries: multiCall.libraries || {},
        transactionHash: multiCall.transactionHash,
      },
      CronExternal: {
        address: cronExternal.address,
        libraries: cronExternal.libraries || {},
        transactionHash: cronExternal.transactionHash,
      },
      CronUpkeep: {
        address: cronUpkeep.address,
        libraries: cronUpkeep.libraries || {},
        transactionHash: cronUpkeep.transactionHash,
      },
      CronUpkeepDelegate: {
        address: cronUpkeepDelegate.address,
        libraries: cronUpkeepDelegate.libraries || {},
        transactionHash: cronUpkeepDelegate.transactionHash,
      },
    },
  })
}

func.tags = ['all']
module.exports.dependencies = [
  'game-factory',
  'game-implementation',
  'keeper',
  'multicall',
]

export default func
