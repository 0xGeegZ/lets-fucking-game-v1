import { useCallback, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useGameV1Contract } from 'hooks/useContract'
import { parseEther, formatEther } from '@ethersproject/units'
import { formatBytes32String } from '@ethersproject/strings'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import { ZERO_ADDRESS } from 'config/constants'
import { useTransactionAdder } from 'state/transactions/hooks'
import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { parse } from 'path'
import { range, difference } from 'utils'
import { useUnpauseGame } from 'views/Games/hooks/useUnpauseGame'
import isEmpty from 'lodash/isEmpty'

export const useUpdateGame = (data) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const addTransaction = useTransactionAdder()

  const contract = useGameV1Contract(data.game.address)
  const { actions, currentStep } = useGameContext()

  const { fetchWithCatchTxError, ...rest /* , loading: isPending */ } = useCatchTxError()

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
    game,
    // prizeType,
  } = data

  const { handleUnpause } = useUnpauseGame(game.address)
  const [isPending, setIsPending] = useState(false)

  const parsedRegistrationAmount: number = registrationAmount ? parseFloat(formatEther(`${registrationAmount}`)) : 0

  const totalValueAmount = parsedRegistrationAmount ? parseEther('0') : parseEther(`${freeGamePrizepoolAmount}`)

  const prizepool = parsedRegistrationAmount ? parsedRegistrationAmount * maxPlayers : freeGamePrizepoolAmount

  const createPrize = (index, totalWinners) => {
    const amountNumber = (prizepool / totalWinners).toFixed(6)
    const amount = parseEther(amountNumber.toString())

    return {
      position: index,
      amount,
      standard: 0,
      contractAddress: ZERO_ADDRESS,
      tokenId: 1,
    }
  }

  const mapper = [...range(1, numberPlayersAllowedToWin)]

  const prizes = mapper.map((index) => createPrize(index, numberPlayersAllowedToWin))

  const updatePrizes = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => contract.addPrizes(prizes, { value: totalValueAmount }))

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully updated your game.')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Game ${name} updated`,
          translatableSummary: {
            text: 'Game %name% updated',
            data: { name },
          },
          type: 'update-game',
        },
      )
    }
  }, [addTransaction, contract, fetchWithCatchTxError, name, prizes, t, toastSuccess, totalValueAmount])

  const updateGame = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() =>
      contract.setGameData({
        name: formatBytes32String(name),
        maxPlayers,
        registrationAmount,
        playTimeRange,
        treasuryFee,
        creatorFee,
        encodedCron,
      }),
    )

    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully updated your game')}
        </ToastDescriptionWithTx>,
      )
      addTransaction(
        {
          ...receipt,
          hash: receipt.transactionHash,
        },
        {
          summary: `Game updated with success`,
          translatableSummary: {
            text: 'Game updated with success',
          },
          type: 'update-game',
        },
      )
    }
  }, [
    addTransaction,
    contract,
    creatorFee,
    encodedCron,
    fetchWithCatchTxError,
    maxPlayers,
    name,
    playTimeRange,
    registrationAmount,
    t,
    toastSuccess,
    treasuryFee,
  ])

  const getGameUpdateFieldsList: any = useCallback(() => {
    const updatedValues = {
      name,
      maxPlayers,
      playTimeRange,
      prizepool: freeGamePrizepoolAmount,
      treasuryFee,
      creatorFee,
      encodedCron,
    }
    return difference(updatedValues, game)
  }, [creatorFee, encodedCron, freeGamePrizepoolAmount, game, maxPlayers, name, playTimeRange, treasuryFee])

  const handleUpdateGame = useCallback(async () => {
    setIsPending(true)

    const isGameNeedUpdate = getGameUpdateFieldsList()
    if (!isEmpty(isGameNeedUpdate)) await updateGame()

    // If prizepool is updated for free game, we update all new prize value
    if (
      game.prizes.length !== prizes.length ||
      (!Number(registrationAmount) && isGameNeedUpdate && isGameNeedUpdate.prizepool)
    )
      await updatePrizes()

    await handleUnpause()
    setIsPending(false)
    actions.nextStep(currentStep + 1)
  }, [
    actions,
    currentStep,
    game.prizes.length,
    getGameUpdateFieldsList,
    handleUnpause,
    prizes.length,
    registrationAmount,
    updateGame,
    updatePrizes,
  ])

  return { isPending, handleUpdateGame }
}
