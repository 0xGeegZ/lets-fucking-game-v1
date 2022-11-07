import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { SLOW_INTERVAL } from 'config/constants'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useSWRImmutable from 'swr/immutable'
import { BIG_ZERO } from 'utils/bigNumber'
import { useBCakeProxyContractAddress } from 'views/Games/hooks/useBCakeProxyContractAddress'
import { getMasterchefContract } from 'utils/contractHelpers'
import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { featureFarmApiAtom, useFeatureFlag } from 'hooks/useFeatureFlag'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { fetchGamesPublicDataAsync, fetchGameUserDataAsync, fetchInitialGamesData } from '.'
import { DeserializedGame, DeserializedGamesState, DeserializedGameUserData, State } from '../types'
import {
  gameFromLpSymbolSelector,
  gameSelector,
  // makeBusdPriceFromPidSelector,
  makeGameFromPidSelector,
  // makeLpTokenPriceFromLpSymbolSelector,
  makeUserGameFromPidSelector,
} from './selectors'

export function useGamesLength() {
  const { chainId } = useActiveWeb3React()
  return useSWRImmutable(chainId ? ['gamesLength', chainId] : null, async () => {
    const mc = getMasterchefContract(undefined, chainId)
    return (await mc.poolLength()).toNumber()
  })
}

export const usePollGamesWithUserData = () => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useActiveWeb3React()
  const {
    proxyAddress,
    proxyCreated,
    isLoading: isProxyContractLoading,
  } = useBCakeProxyContractAddress(account, chainId)
  const gameFlag = useFeatureFlag(featureFarmApiAtom)

  useSWRImmutable(
    chainId ? ['publicGameData', chainId] : null,
    async () => {
      const gamesConfig = await getFarmConfig(chainId)
      const pids = gamesConfig.map((gameToFetch) => gameToFetch.pid)

      dispatch(fetchGamesPublicDataAsync({ chainId, flag: gameFlag }))
    },
    {
      refreshInterval: gameFlag === 'api' ? 50 * 1000 : SLOW_INTERVAL,
    },
  )

  const name = proxyCreated
    ? ['gamesWithUserData', account, proxyAddress, chainId]
    : ['gamesWithUserData', account, chainId]

  useSWRImmutable(
    account && chainId && !isProxyContractLoading ? name : null,
    async () => {
      const gamesConfig = await getFarmConfig(chainId)
      const pids = gamesConfig.map((gameToFetch) => gameToFetch.pid)
      const params = proxyCreated ? { account, pids, proxyAddress, chainId } : { account, pids, chainId }

      dispatch(fetchGameUserDataAsync(params))
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )
}

/**
 * Fetches the "core" game data used globally
 * 2 = CAKE-BNB LP
 * 3 = BUSD-BNB LP
 */
const coreGamePIDs = {
  56: [2, 3],
  97: [4, 10],
  5: [13, 11],
  1: [124, 125],
}

export const usePollCoreGameData = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()
  const gameFlag = useFeatureFlag(featureFarmApiAtom)

  useEffect(() => {
    if (chainId) {
      dispatch(fetchInitialGamesData({ chainId }))
    }
  }, [chainId, dispatch])

  useFastRefreshEffect(() => {
    if (chainId && gameFlag !== 'api') {
      dispatch(fetchGamesPublicDataAsync({ chainId, flag: gameFlag }))
    }
  }, [dispatch, chainId, gameFlag])
}

export const useGames = (): DeserializedGamesState => {
  return useSelector(useMemo(() => gameSelector(), []))
}

export const useGamesPoolLength = (): number => {
  return useSelector((state: State) => state.games.data.length)
}

export const useGameFromPid = (pid: number): DeserializedGame => {
  const gameFromPid = useMemo(() => makeGameFromPidSelector(pid), [pid])
  return useSelector(gameFromPid)
}

export const useGameFromLpSymbol = (lpSymbol: string): DeserializedGame => {
  const gameFromLpSymbol = useMemo(() => gameFromLpSymbolSelector(lpSymbol), [lpSymbol])
  return useSelector(gameFromLpSymbol)
}

export const useGameUser = (pid): DeserializedGameUserData => {
  const gameFromPidUser = useMemo(() => makeUserGameFromPidSelector(pid), [pid])
  return useSelector(gameFromPidUser)
}

// Return the base token price for a game, from a given pid
// export const useBusdPriceFromPid = (pid: number): BigNumber => {
//   const busdPriceFromPid = useMemo(() => makeBusdPriceFromPidSelector(pid), [pid])
//   return useSelector(busdPriceFromPid)
// }

// export const useLpTokenPrice = (symbol: string) => {
//   const lpTokenPriceFromLpSymbol = useMemo(() => makeLpTokenPriceFromLpSymbolSelector(symbol), [symbol])
//   return useSelector(lpTokenPriceFromLpSymbol)
// }

/**
 * @deprecated use the BUSD hook in /hooks
 */
export const usePriceCakeBusd = ({ forceMainnet } = { forceMainnet: false }): BigNumber => {
  const price = useCakeBusdPrice({ forceMainnet })
  return useMemo(() => (price ? new BigNumber(price.toSignificant(6)) : BIG_ZERO), [price])
}
