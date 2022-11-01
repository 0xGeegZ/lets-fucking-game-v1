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
        abi: gameFactory.abi,
      },
      GameImplementation: {
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
    '../dapp/contracts/internal_test.json'
  )
  log('✅ Contracts data was copied to the dapp')
}

func.tags = ['all', 'lfg']
module.exports.dependencies = [
  'game-factory',
  'game-implementation',
  'keeper',
  'multicall',
]

export default func
