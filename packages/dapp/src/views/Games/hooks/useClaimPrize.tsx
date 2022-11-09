import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'

export const useClaimPrize = (gameAddress: string, roundId: BigNumber) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleClaim = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.claimPrize(roundId))

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed your prize.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [fetchWithCatchTxError, contract, roundId, toastSuccess, t])

  return { isPending, handleClaim }
}

// import { ChainId } from '@pancakeswap/sdk'
// import { getGameV1Contract } from 'utils/contractHelpers'
// import { useSWRContract } from 'hooks/useSWRContract'
// import { useGameV1Contract } from 'hooks/useContract'
// import { FetchStatus } from 'config/constants/types'
// import { BigNumber } from '@ethersproject/bignumber'

// export const useClaimPrize = (gameAddress: string, roundId: BigNumber) => {
//   // const { account, chainId } = useActiveWeb3React()

//   const gameV1Contract = useGameV1Contract(gameAddress)
//   // const gameV1Contract = useGameV1Contract(account, chainId)

//   const { data, error, status, mutate } = useSWRContract({
//     contract: gameV1Contract,
//     methodName: 'claimPrize',
//     params: [roundId],
//   })
//   console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ mutate', mutate)
//   console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ status', status)
//   console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ error', error)
//   console.log('🚀 ~ file: useClaimPrize.ts ~ line 32 ~ useClaimPrize ~ data', data)
//   return {
//     data,
//     isFetching: status === FetchStatus.Fetching,
//     error,
//     refresh: mutate,
//   }
//   // TODO return useMemo ??
// }
