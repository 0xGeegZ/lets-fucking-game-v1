import { ChainId, Token } from '@pancakeswap/sdk'
import { differenceInDays } from 'date-fns'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useFeeData } from 'wagmi'
import { useWeb3LibraryContext } from '@pancakeswap/wagmi'
import useSWR from 'swr'
import { AppState, useAppDispatch } from '../../index'
import {
  addSerializedToken,
  muteAudio,
  removeSerializedToken,
  unmuteAudio,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
  ViewMode,
  updateUserGamesViewMode,
  hidePhishingWarningBanner,
  setSubgraphHealthIndicatorDisplayed,
} from '../actions'
import { GAS_PRICE_GWEI } from '../../types'

export function useAudioModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const audioPlay = useSelector<AppState, AppState['user']['audioPlay']>((state) => state.user.audioPlay)

  const toggleSetAudioMode = useCallback(() => {
    if (audioPlay) {
      dispatch(muteAudio())
    } else {
      dispatch(unmuteAudio())
    }
  }, [audioPlay, dispatch])

  return [audioPlay, toggleSetAudioMode]
}

export function usePhishingBannerManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const hideTimestampPhishingWarningBanner = useSelector<
    AppState,
    AppState['user']['hideTimestampPhishingWarningBanner']
  >((state) => state.user.hideTimestampPhishingWarningBanner)
  const now = Date.now()
  const showPhishingWarningBanner = hideTimestampPhishingWarningBanner
    ? differenceInDays(now, hideTimestampPhishingWarningBanner) >= 1
    : true
  const hideBanner = useCallback(() => {
    dispatch(hidePhishingWarningBanner())
  }, [dispatch])

  return [showPhishingWarningBanner, hideBanner]
}

export function useSubgraphHealthIndicatorManager() {
  const dispatch = useAppDispatch()
  const isSubgraphHealthIndicatorDisplayed = useSelector<
    AppState,
    AppState['user']['isSubgraphHealthIndicatorDisplayed']
  >((state) => state.user.isSubgraphHealthIndicatorDisplayed)

  const setSubgraphHealthIndicatorDisplayedPreference = useCallback(
    (newIsDisplayed: boolean) => {
      dispatch(setSubgraphHealthIndicatorDisplayed(newIsDisplayed))
    },
    [dispatch],
  )

  return [isSubgraphHealthIndicatorDisplayed, setSubgraphHealthIndicatorDisplayedPreference] as const
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useUserSingleHopOnly(): [boolean, (newSingleHopOnly: boolean) => void] {
  const dispatch = useAppDispatch()

  const singleHopOnly = useSelector<AppState, AppState['user']['userSingleHopOnly']>(
    (state) => state.user.userSingleHopOnly,
  )

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }))
    },
    [dispatch],
  )

  return [singleHopOnly, setSingleHopOnly]
}

export function useUserSlippageTolerance(): [number, (slippage: number) => void] {
  const dispatch = useAppDispatch()
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>((state) => {
    return state.user.userSlippageTolerance
  })

  const setUserSlippageTolerance = useCallback(
    (slippage: number) => {
      dispatch(updateUserSlippageTolerance({ userSlippageTolerance: slippage }))
    },
    [dispatch],
  )

  return [userSlippageTolerance, setUserSlippageTolerance]
}

export function useUserGamesViewMode(): [ViewMode, (viewMode: ViewMode) => void] {
  const dispatch = useAppDispatch()
  const userGamesViewMode = useSelector<AppState, AppState['user']['userGamesViewMode']>((state) => {
    return state.user.userGamesViewMode
  })

  const setUserGamesViewMode = useCallback(
    (viewMode: ViewMode) => {
      dispatch(updateUserGamesViewMode({ userGamesViewMode: viewMode }))
    },
    [dispatch],
  )

  return [userGamesViewMode, setUserGamesViewMode]
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useAppDispatch()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (deadline: number) => {
      dispatch(updateUserDeadline({ userDeadline: deadline }))
    },
    [dispatch],
  )

  return [userDeadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: token.serialize }))
    },
    [dispatch],
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch],
  )
}

export function useGasPrice(chainIdOverride?: number): string {
  const { chainId: chainId_, chain } = useActiveWeb3React()
  const library = useWeb3LibraryContext()
  const chainId = chainIdOverride ?? chainId_
  const { data: bscProviderGasPrice = GAS_PRICE_GWEI.default } = useSWR(
    library && library.provider && chainId === ChainId.BSC && ['bscProviderGasPrice', library.provider],
    async () => {
      const gasPrice = await library.getGasPrice()
      return gasPrice.toString()
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
  const { data } = useFeeData({
    chainId,
    enabled: chainId !== ChainId.BSC && chainId !== ChainId.BSC_TESTNET,
    watch: true,
  })
  if (chainId === ChainId.BSC) {
    return bscProviderGasPrice
  }
  if (chainId === ChainId.BSC_TESTNET) {
    return GAS_PRICE_GWEI.testnet
  }
  if (chain?.testnet) {
    return data?.formatted?.maxPriorityFeePerGas
  }
  return data?.formatted?.gasPrice
}
