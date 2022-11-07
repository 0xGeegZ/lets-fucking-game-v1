import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { useMasterchef } from 'hooks/useContract'

const useHarvestGame = (gamePid: number) => {
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    return harvestFarm(masterChefContract, gamePid)
  }, [gamePid, masterChefContract])

  return { onReward: handleHarvest }
}

export default useHarvestGame
