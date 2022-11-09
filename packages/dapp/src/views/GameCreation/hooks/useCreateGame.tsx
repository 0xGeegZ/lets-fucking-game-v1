import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameFactoryV1Contract } from 'hooks/useContract'
import { parseEther } from '@ethersproject/units'
import { formatBytes32String } from '@ethersproject/strings'
import { BigNumber } from '@ethersproject/bignumber'

export const useCreateGame = (game) => {
  // TODO handle name
  const {
    /* name, */ maxPlayers,
    playTimeRange,
    registrationAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    numberPlayersAllowedToWin,
    prizeType,
  } = game

  // TODO Load from smart contract
  const gameCreationAmountEther = parseEther('0.1')
  const registrationAmountEther = parseEther(`${registrationAmount}`)

  const prizes = [
    {
      position: 1,
      amount: parseEther(`${registrationAmount * maxPlayers}`),
      standard: 0,
      contractAddress: '0x0000000000000000000000000000000000000000',
      tokenId: 1,
    },
  ]

  const name = formatBytes32String("Let's Fucking Game VMP")

  //   const prizes = [...Array(numberPlayersAllowedToWin).keys()]
  //   console.log('🚀 ~ file: useCreateGame.tsx ~ line 25 ~ useCreateGame ~ Array(numberPlayersAllowedToWin)', prizes)

  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const contract = useGameFactoryV1Contract()

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const handleCreateGame = useCallback(async () => {
    console.log('🚀 ~ file: useCreateGame.tsx ~ line 86 ~ handleCreateGame ~ treasuryFee', treasuryFee)
    console.log('🚀 ~ file: useCreateGame.tsx ~ line 86 ~ handleCreateGame ~ creatorFee', creatorFee)

    const receipt = await fetchWithCatchTxError(() =>
      contract.createNewGame(
        name,
        maxPlayers,
        playTimeRange,
        registrationAmountEther,
        100,
        100,
        // treasuryFee,
        // creatorFee,
        encodedCron,
        prizes,
        { value: gameCreationAmountEther },
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
    maxPlayers,
    playTimeRange,
    registrationAmountEther,
    treasuryFee,
    creatorFee,
    encodedCron,
    // prizes,
    gameCreationAmountEther,
    toastSuccess,
    t,
  ])

  return { isPending, handleCreateGame }
}
