import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { FAST_INTERVAL, SLOW_INTERVAL } from 'config/constants'
import { useCakeBusdPrice } from 'hooks/useBUSDPrice'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useSWRImmutable from 'swr/immutable'
import { BIG_ZERO } from 'utils/bigNumber'

import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { fetchGamesPublicDataAsync, fetchGamePlayerDataAsync, fetchInitialGamesData } from '.'
import { DeserializedGame, DeserializedGamesState, DeserializedGameUserData, State } from '../types'
import {
  gameSelector,
  makeGameFromIdSelector,
  makeUserGameFromIdSelector,
  makePlayerGameFromIdSelector,
} from './selectors'

export const usePollGamesWithUserData = () => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useActiveWeb3React()

  useSWRImmutable(
    account && chainId ? ['publicGameData', account, chainId] : null,
    async () => {
      dispatch(fetchGamesPublicDataAsync({ chainId, account }))
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  useSWRImmutable(
    account && chainId ? ['gamesWithUserData', account, chainId] : null,
    async () => {
      dispatch(fetchGamePlayerDataAsync({ account, chainId }))
    },
    {
      refreshInterval: FAST_INTERVAL,
    },
  )
}

export const usePollCoreGameData = () => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useActiveWeb3React()

  useEffect(() => {
    if (chainId) {
      dispatch(fetchInitialGamesData({ chainId, account }))
    }
  }, [account, chainId, dispatch])

  useFastRefreshEffect(() => {
    if (chainId) {
      dispatch(fetchGamesPublicDataAsync({ chainId, account }))
    }
  }, [dispatch, chainId, account])

  // TODO GUIGUI LOAD PLAYER DATA
  // useFastRefreshEffect(() => {
  //   if (chainId && dispatch) {
  //     dispatch(fetchGamePlayerDataAsync({ chainId, account }))
  //   }
  // }, [dispatch, chainId, account])
}

export const useGames = (): DeserializedGamesState => {
  return useSelector(useMemo(() => gameSelector(), []))
}

export const useGamesLength = (): number => {
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

export const useGamePlayer = (id): DeserializedGameUserData => {
  const gameFromIdUser = useMemo(() => makePlayerGameFromIdSelector(id), [id])
  return useSelector(gameFromIdUser)
}
/**
 * @deprecated use the BUSD hook in /hooks
 */
export const usePriceCakeBusd = ({ forceMainnet } = { forceMainnet: false }): BigNumber => {
  const price = useCakeBusdPrice({ forceMainnet })
  return useMemo(() => (price ? new BigNumber(price.toSignificant(6)) : BIG_ZERO), [price])
}
