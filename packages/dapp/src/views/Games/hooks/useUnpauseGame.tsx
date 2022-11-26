import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'

export const useUnpauseGame = (gameAddress: string) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleUnpause = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.unpause())

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully unpaused the game.')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Unpause game ${gameAddress}`,
          translatableSummary: {
            text: 'Unpause game %gameAddress%',
            data: { gameAddress },
          },
          type: 'unpause-game',
        },
      )
    }
  }, [fetchWithCatchTxError, contract, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handleUnpause }
}
