import masterchefABI from 'config/abi/masterchef.json'
import chunk from 'lodash/chunk'
import { ChainId } from '@pancakeswap/sdk'
import BigNumber from 'bignumber.js'
import { multicallv2 } from 'utils/multicall'
import { BIG_ZERO } from 'utils/bigNumber'
import { SerializedFarmConfig } from '../../config/constants/types'
import { SerializedGame } from '../types'
import { getMasterChefAddress } from '../../utils/addressHelpers'
import { farmFetcher } from '../../../apis/farms/src/helper'

export const fetchMasterChefGamePoolLength = async (chainId: number) => {
  try {
    const [poolLength] = await multicallv2({
      abi: masterchefABI,
      calls: [
        {
          name: 'poolLength',
          address: getMasterChefAddress(chainId),
        },
      ],
      chainId,
    })

    return new BigNumber(poolLength).toNumber()
  } catch (error) {
    console.error('Fetch MasterChef Game Pool Length Error: ', error)
    return BIG_ZERO.toNumber()
  }
}

const masterChefGameCalls = async (game: SerializedGame) => {
  const { pid, quoteToken } = game
  const multiCallChainId = farmFetcher.isTestnet(quoteToken.chainId) ? ChainId.BSC_TESTNET : ChainId.BSC
  const masterChefAddress = getMasterChefAddress(multiCallChainId)
  const masterChefPid = pid

  return masterChefPid || masterChefPid === 0
    ? [
        {
          address: masterChefAddress,
          name: 'poolInfo',
          params: [masterChefPid],
        },
        {
          address: masterChefAddress,
          name: 'totalRegularAllocPoint',
        },
      ]
    : [null, null]
}

export const fetchMasterChefData = async (games: SerializedFarmConfig[], chainId: number): Promise<any[]> => {
  const masterChefCalls = await Promise.all(games.map((game) => masterChefGameCalls(game)))
  const chunkSize = masterChefCalls.flat().length / games.length
  const masterChefAggregatedCalls = masterChefCalls
    .filter((masterChefCall) => masterChefCall[0] !== null && masterChefCall[1] !== null)
    .flat()

  const multiCallChainId = farmFetcher.isTestnet(chainId) ? ChainId.BSC_TESTNET : ChainId.BSC
  const masterChefMultiCallResult = await multicallv2({
    abi: masterchefABI,
    calls: masterChefAggregatedCalls,
    chainId: multiCallChainId,
  })
  const masterChefChunkedResultRaw = chunk(masterChefMultiCallResult, chunkSize)

  let masterChefChunkedResultCounter = 0
  return masterChefCalls.map((masterChefCall) => {
    if (masterChefCall[0] === null && masterChefCall[1] === null) {
      return [null, null]
    }
    const data = masterChefChunkedResultRaw[masterChefChunkedResultCounter]
    masterChefChunkedResultCounter++
    return data
  })
}
