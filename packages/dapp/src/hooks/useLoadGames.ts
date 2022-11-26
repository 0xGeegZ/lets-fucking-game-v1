import { useMemo } from 'react'
import { useGameFactoryV1Contract } from 'hooks/useContract'
import { useSWRContract, UseSWRContractKey } from 'hooks/useSWRContract'
import { SLOW_INTERVAL } from 'config/constants'

export const useLoadGames = () => {
  const contract = useGameFactoryV1Contract()

  const key = useMemo<UseSWRContractKey>(() => {
    return {
      contract,
      methodName: 'getDeployedGames',
    }
  }, [contract])

  const { data, status, ...rest } = useSWRContract(key, {
    refreshInterval: SLOW_INTERVAL,
  })

  return {
    ...rest,
    fetchStatus: status,
    games: data,
  }
}

export default useLoadGames
