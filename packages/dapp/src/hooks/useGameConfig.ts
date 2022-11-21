import { useMemo } from 'react'
import { networkConfig, defaultGameConfig } from 'config/internal/networkConfig'

import { useActiveChainId } from './useActiveChainId'

export const useGameConfig = () => {
  const { chainId } = useActiveChainId()

  const { gameConfig } = networkConfig[chainId]
  if (!gameConfig) throw new Error('No game config found for chain id', chainId)

  return useMemo(() => gameConfig, [gameConfig])
}

export const useDefaultGameConfig = () => {
  return useMemo(() => defaultGameConfig, [])
}

export const useGameConfigWithDefaultFallback = () => {
  const { chainId } = useActiveChainId()
  const { gameConfig } = networkConfig[chainId]

  return useMemo(() => gameConfig || defaultGameConfig, [gameConfig])
}
