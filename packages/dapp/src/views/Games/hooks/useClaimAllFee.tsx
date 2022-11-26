import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'

export const useClaimAllFee = (gameAddress: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleClaimAllFee = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.claimAllFee())

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed treasury and creator fee')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Claim treasury and creator fee for game ${gameAddress}`,
          translatableSummary: {
            text: 'Claim treasury and creator fee for game %gameAddress%',
            data: { gameAddress },
          },
          type: 'claim-all-fee',
        },
      )
    }
  }, [fetchWithCatchTxError, contract, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handleClaimAllFee }
}
