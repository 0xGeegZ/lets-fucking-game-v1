import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

export const useRegisterForGame = (
  gameAddress: string,
  registrationAmount: BigNumber,
  gameCreationAmount: BigNumber,
) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleRegister = useCallback(async () => {
    const registerAmount = EthersBigNumber.from(registrationAmount).add(EthersBigNumber.from(gameCreationAmount))

    const receipt = await fetchWithCatchTxError(() => contract.registerForGame({ value: registerAmount }))

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully played this round.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [registrationAmount, gameCreationAmount, fetchWithCatchTxError, contract, toastSuccess, t])

  return { isPending, handleRegister }
}
