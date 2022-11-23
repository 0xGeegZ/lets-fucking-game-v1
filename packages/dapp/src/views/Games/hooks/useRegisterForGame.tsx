import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import { parseEther } from '@ethersproject/units'
import { useTransactionAdder } from 'state/transactions/hooks'

export const useRegisterForGame = (gameAddress: string, registrationAmount: BigNumber) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleRegister = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() =>
      contract.registerForGame({ value: parseEther(`${registrationAmount}`) }),
    )

    addTransaction(
      {
        ...receipt,
        hash: receipt.transactionHash,
      },
      {
        summary: `Register for game ${gameAddress} with amount ${registrationAmount}`,
        translatableSummary: {
          text: 'Register for game %gameAddress% with amount %registrationAmount%',
          data: { gameAddress, registrationAmount: registrationAmount.toNumber() },
        },
        type: 'register',
      },
    )
    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully registered for this game.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [fetchWithCatchTxError, contract, registrationAmount, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handleRegister }
}
