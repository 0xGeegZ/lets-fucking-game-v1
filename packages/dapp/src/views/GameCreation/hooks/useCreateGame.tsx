import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameFactoryV1Contract } from 'hooks/useContract'
import { parseEther, formatEther } from '@ethersproject/units'
import { formatBytes32String } from '@ethersproject/strings'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import { ZERO_ADDRESS } from 'config/constants'
import { useTransactionAdder } from 'state/transactions/hooks'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { parse } from 'path'

export const useCreateGame = (game) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameFactoryV1Contract()
  const { actions, gameConfig, currentStep } = useGameContext()

  const { GAME_CREATION_AMOUNT } = gameConfig

  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()

  const {
    name,
    maxPlayers,
    playTimeRange,
    registrationAmount,
    freeGamePrizepoolAmount,
    treasuryFee,
    creatorFee,
    encodedCron,
    numberPlayersAllowedToWin,
    // prizeType,
  } = game

  const parsedRegistrationAmount: number = registrationAmount ? parseFloat(formatEther(`${registrationAmount}`)) : 0

  const gameCreationAmountEther = GAME_CREATION_AMOUNT

  const registrationAmountEther = parseEther(`${parsedRegistrationAmount}`)

  const totalValueAmount = parsedRegistrationAmount
    ? gameCreationAmountEther
    : gameCreationAmountEther.add(parseEther(`${freeGamePrizepoolAmount}`))

  const prizepool = parsedRegistrationAmount ? parsedRegistrationAmount * maxPlayers : freeGamePrizepoolAmount
  console.log('🚀 ~ file: useCreateGame.tsx ~ line 49 ~ useCreateGame ~ prizepool', prizepool)

  const createPrize = (index, totalWinners) => {
    const parsedPrizepool = parseEther(`${prizepool}`)
    const parsedTotalWinners = parseEther(`${totalWinners}`)
    const amount = parsedPrizepool.div(parsedTotalWinners)

    return {
      position: index,
      amount,
      standard: 0,
      contractAddress: ZERO_ADDRESS,
      tokenId: 1,
    }
  }

  const range = (start, end) => Array.from(Array(end + 1).keys()).slice(start)
  const mapper = [...range(1, numberPlayersAllowedToWin)]

  const prizes = mapper.map((index) => createPrize(index, numberPlayersAllowedToWin))

  const formattedName = formatBytes32String(name)

  const handleCreateGame = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() =>
      contract.createNewGame(
        formattedName,
        maxPlayers,
        playTimeRange,
        registrationAmountEther,
        treasuryFee,
        creatorFee,
        encodedCron,
        prizes,
        { value: totalValueAmount },
      ),
    )

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed your prize.')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Game ${name} created`,
          translatableSummary: {
            text: 'Game %name% create',
            data: { name },
          },
          type: 'create-game',
        },
      )

      actions.nextStep(currentStep + 1)
    }
  }, [
    fetchWithCatchTxError,
    addTransaction,
    name,
    contract,
    formattedName,
    maxPlayers,
    playTimeRange,
    registrationAmountEther,
    treasuryFee,
    creatorFee,
    encodedCron,
    prizes,
    totalValueAmount,
    toastSuccess,
    t,
    actions,
    currentStep,
  ])

  return { isPending, handleCreateGame }
}
