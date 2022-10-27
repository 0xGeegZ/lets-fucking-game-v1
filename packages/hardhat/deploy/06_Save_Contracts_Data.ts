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

  // const multiCall = await deployments.get('Multicall')

  const cronExternal = await deployments.get('CronExternal')
  const cronUpkeep = await deployments.get('CronUpkeep')
  const cronUpkeepDelegate = await deployments.get('CronUpkeepDelegate')

  saveContractData({
    [chainId]: {
      GameFactory: {
        // transactionHash: gameFactory.deployTransaction.hash,
        address: gameFactory.address,
      },
      GameImplementation: {
        // transactionHash: gameImplementation.deployTransaction.hash,
        address: gameImplementation.address,
        libraries: {
          Cron: cronExternal.address,
        },
      },
      // MultiCall: {
      //   address: multiCall.address,
      // },
      CronExternal: {
        address: cronExternal.address,
      },
      CronUpkeep: {
        address: cronUpkeep.address,
        libraries: {
          Cron: cronExternal.address,
        },
      },
      CronUpkeepDelegate: {
        address: cronUpkeepDelegate.address,
      },
    },
  })
}

func.tags = ['all']

export default func
