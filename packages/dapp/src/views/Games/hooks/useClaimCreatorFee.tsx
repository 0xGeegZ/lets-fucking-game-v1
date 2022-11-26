import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'

export const useClaimCreatorFee = (gameAddress: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleClaimCreatorFee = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.claimCreatorFee())

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed creator fee')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Claim creator fee for game ${gameAddress}`,
          translatableSummary: {
            text: 'Claim creator fee for game %gameAddress%',
            data: { gameAddress },
          },
          type: 'claim-creator-fee',
        },
      )
    }
  }, [fetchWithCatchTxError, contract, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handleClaimCreatorFee }
}
