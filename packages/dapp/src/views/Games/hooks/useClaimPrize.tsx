import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { BigNumber } from '@ethersproject/bignumber'
import { useTransactionAdder } from 'state/transactions/hooks'

export const useClaimPrize = (gameAddress: string, roundId: BigNumber) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleClaim = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.claimPrize(roundId))

    addTransaction(
      {
        ...receipt,
        hash: receipt.transactionHash,
      },
      {
        summary: `Claim prize for game ${gameAddress} and round ${roundId}`,
        translatableSummary: {
          text: 'Claim prize for game %gameAddress% and round %roundId%',
          data: { gameAddress, roundId: roundId.toNumber() },
        },
        type: 'claim-prize',
      },
    )

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed your prize.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [fetchWithCatchTxError, contract, roundId, toastSuccess, t, addTransaction, gameAddress])

  return { isPending, handleClaim }
}
