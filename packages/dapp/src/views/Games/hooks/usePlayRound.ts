import { ChainId } from '@pancakeswap/sdk'
import { getChainlinkOracleContract, getGameFactoryV1Contract, getGameV1Contract } from 'utils/contractHelpers'
import { useSWRContract } from 'hooks/useSWRContract'
import { useGameV1Contract } from 'hooks/useContract'

import { Zero } from '@ethersproject/constants'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { FetchStatus } from 'config/constants/types'
import { BigNumber } from '@ethersproject/bignumber'

export const usePlayRound = (gameAddress: string) => {
  // const { account, chainId } = useActiveWeb3React()

  const gameV1Contract = useGameV1Contract(gameAddress)
  // const gameV1Contract = useGameV1Contract(account, chainId)

  const { data, error, status, mutate } = useSWRContract({
    contract: gameV1Contract,
    methodName: 'playRound',
    params: [],
  })
  console.log('🚀 ~ file: usePlayRound.ts ~ line 32 ~ usePlayRound ~ mutate', mutate)
  console.log('🚀 ~ file: usePlayRound.ts ~ line 32 ~ usePlayRound ~ status', status)
  console.log('🚀 ~ file: usePlayRound.ts ~ line 32 ~ usePlayRound ~ error', error)
  console.log('🚀 ~ file: usePlayRound.ts ~ line 32 ~ usePlayRound ~ data', data)
  return {
    data,
    isFetching: status === FetchStatus.Fetching,
    error,
    refresh: mutate,
  }
  // TODO return useMemo ??
}
