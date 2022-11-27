import BigNumber from 'bignumber.js'
import { ChainId } from '@pancakeswap/sdk'
import erc20ABI from 'config/abi/erc20.json'
import multicall, { multicallv2 } from 'utils/multicall'
import { verifyBscNetwork } from 'utils/verifyBscNetwork'
import { isChainTestnet } from 'utils/wagmi'
import internal from 'config/internal/internal.json'
import chunk from 'lodash/chunk'
import { getGameV1Contract } from 'utils/contractHelpers'
import { GameV1 } from 'config/types/typechain'
import { ZERO_ADDRESS } from 'config/constants'
import { SerializedGame, SerializedGamePlayerData } from '../types'

export const fetchGamesPlayerData = async (
  games: SerializedGame[],
  playerAddress: string,
  chainId = ChainId.BSC,
): Promise<SerializedGamePlayerData[]> => {
  const gameCalls = games.map((game) => {
    return {
      address: game.address,
      name: 'getPlayer',
      params: [playerAddress],
    }
  })

  const gamesMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameV1.abi,
    calls: gameCalls,
    chainId,
  })

  return gamesMultiCallResult.map((gameMultiCallResult) => {
    const [gamePlayer] = gameMultiCallResult

    return {
      address: gamePlayer.playerAddress,
      roundRangeLowerLimit: gamePlayer.roundRangeLowerLimit.toNumber(),
      roundRangeUpperLimit: gamePlayer.roundRangeUpperLimit.toNumber(),
      hasPlayedRound: gamePlayer.hasPlayedRound,
      roundCount: gamePlayer.roundCount.toNumber(),
      position: gamePlayer.position.toNumber(),
      hasLost: gamePlayer.hasLost,
      isSplitOk: gamePlayer.isSplitOk,
    }
  })
}

export const fetchGamePlayerData = async (game: any, playerAddress: string, chainId = ChainId.BSC): Promise<any[]> => {
  const gameMultiCallResult = await multicallv2({
    abi: internal[chainId || ChainId.BSC].GameV1.abi,
    calls: [
      {
        address: game.address,
        name: 'getPlayer',
        params: [playerAddress],
      },
    ],
    chainId,
  })

  return gameMultiCallResult
}

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
