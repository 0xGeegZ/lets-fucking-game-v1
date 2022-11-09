import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'

export const useCreateGame = (gameAddress: string) => {
  // TODO USE TYPECHAIN INTERFACE
  const { name, image, maxPlayers, playTimeRange, registrationAmount, treasuryFee, creatorFee, encodedCron, prizes } =
    {}

  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const contract = useGameV1Contract(gameAddress)

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleCreateGame = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() =>
      contract.createNewGame(
        name,
        image,
        maxPlayers,
        playTimeRange,
        registrationAmount,
        treasuryFee,
        creatorFee,
        encodedCron,
        prizes,
      ),
    )

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed your prize.')}
        </ToastDescriptionWithTx>,
      )
    }
  }, [
    fetchWithCatchTxError,
    contract,
    name,
    image,
    maxPlayers,
    playTimeRange,
    registrationAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    prizes,
    toastSuccess,
    t,
  ])

  return { isPending, handleCreateGame }
}
