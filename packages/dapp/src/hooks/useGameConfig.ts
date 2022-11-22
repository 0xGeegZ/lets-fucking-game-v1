import { useMemo } from 'react'
import { gameConfig, defaultGameConfig } from 'config/internal/gameConfig'

import { useActiveChainId } from './useActiveChainId'

export const useGameConfig = () => {
  const { chainId } = useActiveChainId()

  if (!gameConfig[chainId]) throw new Error(`No game config found for chain id ${chainId}`)

  return useMemo(() => gameConfig[chainId], [chainId])
}

export const useDefaultGameConfig = () => {
  return useMemo(() => defaultGameConfig, [])
}

export const useGameConfigFallback = () => {
  const { chainId } = useActiveChainId()

  return useMemo(() => gameConfig[chainId] || defaultGameConfig, [chainId])
}
