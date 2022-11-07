import { useCallback } from 'react'
import { useCrossFarmingProxy } from 'hooks/useContract'

const useNonBscHarvestGame = (gamePid: number, cProxyAddress: string) => {
  const contract = useCrossFarmingProxy(cProxyAddress)

  const handleHarvest = useCallback(async () => {
    return contract.harvest(gamePid)
  }, [contract, gamePid])

  return { onReward: handleHarvest }
}

export default useNonBscHarvestGame
