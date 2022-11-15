import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'

export const usePlayRound = (gameAddress: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handlePlay = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.playRound())

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully played this round.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [fetchWithCatchTxError, contract, toastSuccess, t])

  return { isPending, handlePlay }
}
