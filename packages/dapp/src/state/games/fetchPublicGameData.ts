import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { multicallv2 } from 'utils/multicall'
import internal from 'config/internal/internal.json'
import { GameFactory } from 'config/types/typechain'

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
  // TODO use useSWRMulticall ??
  const gameMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameImplementationV1.abi,
    calls: gameCalls,
    chainId,
  })
  return chunk(gameMultiCallResult, chunkSize)
}
