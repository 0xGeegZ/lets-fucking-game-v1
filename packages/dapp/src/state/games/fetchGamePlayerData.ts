import BigNumber from 'bignumber.js'
import { ChainId } from '@pancakeswap/sdk'
import erc20ABI from 'config/abi/erc20.json'
import masterchefABI from 'config/abi/masterchef.json'
import nonBscVault from 'config/abi/nonBscVault.json'
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

export const fetchGamePlayerAllowances = async (
  account: string,
  gamesToFetch: SerializedGame[],
  chainId: number,
  proxyAddress?: string,
) => {
  const isBscNetwork = verifyBscNetwork(chainId)

  const calls = gamesToFetch.map((game) => {
    const contractAddress = game.address
    return { address: contractAddress, name: 'allowance', params: [account, proxyAddress] }
  })

  const rawLpAllowances = await multicall<BigNumber[]>(erc20ABI, calls, chainId)
  const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON()
  })

  return parsedLpAllowances
}

export const fetchGamePlayerTokenBalances = async (
  account: string,
  gamesToFetch: SerializedGame[],
  chainId: number,
) => {
  const calls = gamesToFetch.map((game) => {
    const contractAddress = game.address
    return {
      address: contractAddress,
      name: 'balanceOf',
      params: [account],
    }
  })

  const rawTokenBalances = await multicall(erc20ABI, calls, chainId)
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
    return new BigNumber(tokenBalance).toJSON()
  })
  return parsedTokenBalances
}

export const fetchGamePlayerStakedBalances = async (
  account: string,
  gamesToFetch: SerializedGame[],
  chainId: number,
) => {
  const isBscNetwork = verifyBscNetwork(chainId)

  const calls = gamesToFetch.map((game) => {
    return {
      address: account,
      name: 'userInfo',
      params: [game.id],
    }
  })

  const rawStakedBalances = await multicallv2({
    abi: isBscNetwork ? masterchefABI : nonBscVault,
    calls,
    chainId,
    options: { requireSuccess: false },
  })
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
    return new BigNumber(stakedBalance[0]._hex).toJSON()
  })
  return parsedStakedBalances
}

export const fetchGamePlayerEarnings = async (account: string, gamesToFetch: SerializedGame[], chainId: number) => {
  const isBscNetwork = verifyBscNetwork(chainId)
  const multiCallChainId = isChainTestnet(chainId) ? ChainId.BSC_TESTNET : ChainId.BSC
  const userAddress = account

  const calls = gamesToFetch.map((game) => {
    return {
      address: account,
      name: 'pendingCake',
      params: [game.id, userAddress],
    }
  })

  const rawEarnings = await multicallv2({ abi: masterchefABI, calls, chainId: multiCallChainId })

  const parsedEarnings = rawEarnings.map((earnings) => {
    return new BigNumber(earnings).toJSON()
  })

  return parsedEarnings
}
