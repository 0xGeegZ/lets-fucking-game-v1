import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { SLOW_INTERVAL } from 'config/constants'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useSWRImmutable from 'swr/immutable'
import { BIG_ZERO } from 'utils/bigNumber'

import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { featureFarmApiAtom, useFeatureFlag } from 'hooks/useFeatureFlag'
import { fetchGamesPublicDataAsync, fetchGamePlayerDataAsync, fetchInitialGamesData } from '.'
import { DeserializedGame, DeserializedGamesState, DeserializedGameUserData, State } from '../types'
import {
  // gameFromLpSymbolSelector,
  gameSelector,
  // makeBusdPriceFromIdSelector,
  makeGameFromIdSelector,
  // makeLpTokenPriceFromLpSymbolSelector,
  makeUserGameFromIdSelector,
} from './selectors'

export function useGamesLength() {
  const { chainId } = useActiveWeb3React()
  return useSWRImmutable(chainId ? ['gamesLength', chainId] : null, async () => {
    // TODO GUIGUI UPDATE GAMES LENGHT
    // const mc = getMasterchefContract(undefined, chainId)
    // return (await mc.poolLength()).toNumber()
    return 1
  })
}

export const usePollGamesWithUserData = () => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useActiveWeb3React()
  // const {
  //   proxyAddress,
  //   proxyCreated,
  //   isLoading: isProxyContractLoading,
  // } = useBCakeProxyContractAddress(account, chainId)

  const gameFlag = useFeatureFlag(featureFarmApiAtom)

  useSWRImmutable(
    chainId ? ['publicGameData', chainId] : null,
    async () => {
      dispatch(fetchGamesPublicDataAsync({ chainId, flag: gameFlag }))
    },
    {
      refreshInterval: gameFlag === 'api' ? 50 * 1000 : SLOW_INTERVAL,
    },
  )

  const name = ['gamesWithUserData', account, chainId]

  useSWRImmutable(
    account && chainId ? name : null,
    async () => {
      const params = { account, chainId }
      dispatch(fetchGamePlayerDataAsync(params))
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )
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

export const useGameFromId = (id: number): DeserializedGame => {
  const gameFromId = useMemo(() => makeGameFromIdSelector(id), [id])
  return useSelector(gameFromId)
}

export const useGameUser = (id): DeserializedGameUserData => {
  const gameFromIdUser = useMemo(() => makeUserGameFromIdSelector(id), [id])
  return useSelector(gameFromIdUser)
}

// Return the base token price for a game, from a given id
// export const useBusdPriceFromId = (id: number): BigNumber => {
//   const busdPriceFromId = useMemo(() => makeBusdPriceFromIdSelector(id), [id])
//   return useSelector(busdPriceFromId)
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
