import { ChainId } from '@pancakeswap/sdk'
import { getChainlinkOracleContract, getGameFactoryV1Contract, getGameV1Contract } from 'utils/contractHelpers'
import { useSWRContract } from 'hooks/useSWRContract'
import { useGameV1Contract } from 'hooks/useContract'

import { Zero } from '@ethersproject/constants'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { FetchStatus } from 'config/constants/types'
import { BigNumber } from '@ethersproject/bignumber'

export const useVoteToSplitPot = (gameAddress: string) => {
  // const { account, chainId } = useActiveWeb3React()

  const gameV1Contract = useGameV1Contract(gameAddress)
  // const gameV1Contract = useGameV1Contract(account, chainId)

  const { data, error, status, mutate } = useSWRContract({
    contract: gameV1Contract,
    methodName: 'voteToSplitPot',
    params: [],
  })
  console.log('🚀 ~ file: useVoteToSplitPot.ts ~ line 32 ~ useVoteToSplitPot ~ mutate', mutate)
  console.log('🚀 ~ file: useVoteToSplitPot.ts ~ line 32 ~ useVoteToSplitPot ~ status', status)
  console.log('🚀 ~ file: useVoteToSplitPot.ts ~ line 32 ~ useVoteToSplitPot ~ error', error)
  console.log('🚀 ~ file: useVoteToSplitPot.ts ~ line 32 ~ useVoteToSplitPot ~ data', data)
  return {
    data,
    isFetching: status === FetchStatus.Fetching,
    error,
    refresh: mutate,
  }
  // TODO return useMemo ??
}
