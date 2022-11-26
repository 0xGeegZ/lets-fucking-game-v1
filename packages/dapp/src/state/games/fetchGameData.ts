import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { multicallv2 } from 'utils/multicall'
import internal from 'config/internal/internal.json'
import { GameFactory } from 'config/types/typechain'

import { fetchGamePlayersData } from './fetchGamePlayerData'

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

export const fetchGamesRemainingPlayersCount = async (
  games: GameFactory.GameStructOutput[],
  chainId = ChainId.BSC,
): Promise<any[]> => {
  const gameCalls = games.map((game) => {
    return {
      address: game.deployedAddress,
      name: 'getRemainingPlayersCount',
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

export const fetchGamesPlayersAddresses = async (
  games: GameFactory.GameStructOutput[],
  chainId = ChainId.BSC,
): Promise<any[]> => {
  const gameCalls = games.map((game) => {
    return {
      address: game.deployedAddress,
      name: 'getPlayerAddresses',
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

export const fetchGamesPlayersData = async (games: any[], chainId = ChainId.BSC): Promise<any[]> => {
  const chunks = await Promise.all(games.map((game) => fetchGamePlayersData(game, chainId)))

  return chunks
}

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
