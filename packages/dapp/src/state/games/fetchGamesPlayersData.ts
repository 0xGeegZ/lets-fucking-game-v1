import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { multicallv2 } from 'utils/multicall'
import internal from 'config/internal/internal.json'
import { GameFactory } from 'config/types/typechain'

export const fetchGamePlayersData = async (game: any, chainId = ChainId.BSC): Promise<any[]> => {
  const gameCalls = game.playerAddresses.map((playerAddress) => {
    return {
      address: game.address,
      name: 'getPlayer',
      params: [playerAddress],
    }
  })
  const chunkSize = gameCalls.length / game.playerAddresses.length

  const gameMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameV1.abi,
    calls: gameCalls,
    chainId,
  })

  return chunk(gameMultiCallResult, chunkSize)
}

export const fetchGamesPlayersData = async (games: any[], chainId = ChainId.BSC): Promise<any[]> => {
  const chunks = await Promise.all(games.map((game) => fetchGamePlayersData(game, chainId)))

  return chunks
}
