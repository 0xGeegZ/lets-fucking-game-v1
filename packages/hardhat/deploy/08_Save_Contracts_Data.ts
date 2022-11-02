import fs from 'fs'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import saveContractData from '../helpers/saveContractData'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments

  const chainId = await getChainId()
  const gameImplementation = await deployments.get('GameImplementationV1')
  const gameFactory = await deployments.get('GameImplementationV1')

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
        abi: gameFactory.abi,
      },
      GameImplementationV1: {
        address: gameImplementation.address,
        libraries: gameImplementation.libraries || {},
        transactionHash: gameImplementation.transactionHash,
        abi: gameImplementation.abi,
      },
      MultiCall: {
        address: multiCall.address,
        libraries: multiCall.libraries || {},
        transactionHash: multiCall.transactionHash,
        abi: multiCall.abi,
      },
      CronExternal: {
        address: cronExternal.address,
        libraries: cronExternal.libraries || {},
        transactionHash: cronExternal.transactionHash,
        abi: cronExternal.abi,
      },
      CronUpkeep: {
        address: cronUpkeep.address,
        libraries: cronUpkeep.libraries || {},
        transactionHash: cronUpkeep.transactionHash,
        abi: cronUpkeep.abi,
      },
      CronUpkeepDelegate: {
        address: cronUpkeepDelegate.address,
        libraries: cronUpkeepDelegate.libraries || {},
        transactionHash: cronUpkeepDelegate.transactionHash,
        abi: cronUpkeepDelegate.abi,
      },
    },
  })

  // Copy contract data to the dapp
  await fs.copyFileSync(
    'build/internal.json',
    '../dapp/contracts/internal.json'
  )
  log('✅ Contracts data was copied to the dapp')
}

func.tags = ['all', 'dev', 'lfg']
module.exports.dependencies = [
  'game-factory',
  'game-implementation',
  'keeper',
  'multicall',
]

export default func
