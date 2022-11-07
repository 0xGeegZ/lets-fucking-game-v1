import { ChainId } from '@pancakeswap/sdk'
import { getGameImplementationV1Contract } from 'utils/contractHelpers'
import { useSWRContract } from 'hooks/useSWRContract'
import { useGameImplementationV1Contract } from 'hooks/useContract'
import { FetchStatus } from 'config/constants/types'
import { BigNumber } from '@ethersproject/bignumber'

export const useClaimPrize = (gameAddress: string, roundId: BigNumber) => {
  // const { account, chainId } = useActiveWeb3React()

  const gameImplementationV1Contract = useGameImplementationV1Contract(gameAddress)
  // const gameImplementationV1Contract = useGameImplementationV1Contract(account, chainId)

  const { data, error, status, mutate } = useSWRContract({
    contract: gameImplementationV1Contract,
    methodName: 'claimPrize',
    params: [roundId],
  })
  console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ mutate', mutate)
  console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ status', status)
  console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ error', error)
  console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ data', data)
  return {
    data,
    isFetching: status === FetchStatus.Fetching,
    error,
    refresh: mutate,
  }
  // TODO return useMemo ??
}
