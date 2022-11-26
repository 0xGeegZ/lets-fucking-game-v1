import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'

export const usePauseGame = (gameAddress: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handlePause = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.pause())

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully paused the game.')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Pause game ${gameAddress}`,
          translatableSummary: {
            text: 'Pause game %gameAddress%',
            data: { gameAddress },
          },
          type: 'pause-game',
        },
      )
    }
  }, [fetchWithCatchTxError, contract, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handlePause }
}
