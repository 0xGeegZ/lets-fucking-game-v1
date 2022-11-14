import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { multicallv2 } from 'utils/multicall'
import internal from 'config/internal/internal.json'
import { GameFactory } from 'config/types/typechain'

export const fetchGamesPrizes = async (games: any[], chainId = ChainId.BSC): Promise<any[]> => {
  const gameCalls = games.map((game) => {
    return {
      address: game.address,
      name: 'getPrizes',
      params: [game.roundId],
    }
  })
  const chunkSize = gameCalls.length / games.length

  const gameMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameV1.abi,
    calls: gameCalls,
    chainId,
  })

  return chunk(gameMultiCallResult, chunkSize)
}
