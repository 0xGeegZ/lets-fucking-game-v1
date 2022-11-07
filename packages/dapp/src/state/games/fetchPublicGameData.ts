import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { multicallv3, multicallv2 } from 'utils/multicall'
import internal from 'config/internal/internal.json'
import { GameFactory } from '@types/typechain'
import { useSWRMulticall } from 'hooks/useSWRContract'

export const fetchPublicGamesData = async (
  games: GameFactory.GameStructOutput[],
  chainId = ChainId.BSC,
): Promise<any[]> => {
  const gameCalls = games.map((game) => {
    return {
      address: game.deployedAddress,
      name: 'getGameData',
    }
  })
  const chunkSize = gameCalls.length / games.length

  const gameMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameV1.abi,
    calls: gameCalls,
    chainId,
  })

  // TODO use useSWRMulticall ??
  // const { data: gameMultiCallResult } = useSWRMulticall(internal[chainId || ChainId.BSC].GameV1.abi, gameCalls)

  return chunk(gameMultiCallResult, chunkSize)
}
