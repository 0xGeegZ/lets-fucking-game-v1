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
    // const parsedPrizepool = parseEther(`${prizepool}`)
    // const parsedTotalWinners = parseEther(`${totalWinners}`)
    // const amount = parsedPrizepool.div(parsedTotalWinners)
    const amount = parseEther(`${prizepool / totalWinners}`)

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

  const updateName = useCallback(
    async (newName) => {
      const receipt = await fetchWithCatchTxError(() => contract.setName(newName))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your game name.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game name updated : ${newName}`,
            translatableSummary: {
              text: 'Game name updated : %newName%',
              data: { newName },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

  const updateMaxPlayers = useCallback(
    async (newMaxPlayers) => {
      const receipt = await fetchWithCatchTxError(() => contract.setMaxPlayers(newMaxPlayers))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your game players.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game players updated : ${newMaxPlayers}`,
            translatableSummary: {
              text: 'Game players updated : %newMaxPlayers%',
              data: { newMaxPlayers },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

  const updatePlayTimeRange = useCallback(
    async (newPlayTimeRange) => {
      const receipt = await fetchWithCatchTxError(() => contract.setPlayTimeRange(newPlayTimeRange))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your game play time range.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game play time range updated : ${newPlayTimeRange}`,
            translatableSummary: {
              text: 'Game play time range updated : %newPlayTimeRange%',
              data: { newPlayTimeRange },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

  const updateTreasuryFee = useCallback(
    async (newTreasuryFee) => {
      const receipt = await fetchWithCatchTxError(() => contract.setTreasuryFee(newTreasuryFee))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your treasury fee.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game treasury fee updated : ${newTreasuryFee}`,
            translatableSummary: {
              text: 'Game treasury fee updated : %newTreasuryFee%',
              data: { newTreasuryFee },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

  const updateCreatorFee = useCallback(
    async (newCreatorFee) => {
      const receipt = await fetchWithCatchTxError(() => contract.setCreatorFee(newCreatorFee))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your creator fee.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game creator fee updated : ${newCreatorFee}`,
            translatableSummary: {
              text: 'Game creator fee updated : %newCreatorFee%',
              data: { newCreatorFee },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

  const updateEncodedCron = useCallback(
    async (newEncodedCron) => {
      const receipt = await fetchWithCatchTxError(() => contract.setEncodedCron(newEncodedCron))

      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully updated your daily draw time.')}
          </ToastDescriptionWithTx>,
        )
        addTransaction(
          {
            ...receipt,
            hash: receipt.transactionHash,
          },
          {
            summary: `Game your daily draw time updated : ${newEncodedCron}`,
            translatableSummary: {
              text: 'Game your daily draw time updated : %newEncodedCron%',
              data: { newEncodedCron },
            },
            type: 'update-game',
          },
        )
      }
    },
    [addTransaction, contract, fetchWithCatchTxError, t, toastSuccess],
  )

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
    const {
      name: needUpdateName,
      maxPlayers: needUpdateMaxPlayers,
      playTimeRange: needUpdatePlayTimeRange,
      treasuryFee: needUpdateTreasuryFee,
      creatorFee: needUpdateCreatorFee,
      encodedCron: needUpdateEncodedCron,
      prizepool: needUpdatePrizepool,
    } = getGameUpdateFieldsList()
    if (needUpdateName) await updateName(formatBytes32String(needUpdateName))
    if (needUpdateMaxPlayers) await updateMaxPlayers(needUpdateMaxPlayers)
    if (needUpdatePlayTimeRange) await updatePlayTimeRange(needUpdatePlayTimeRange)
    if (needUpdateTreasuryFee) await updateTreasuryFee(needUpdateTreasuryFee)
    if (needUpdateCreatorFee) await updateCreatorFee(needUpdateCreatorFee)
    if (needUpdateEncodedCron) await updateEncodedCron(needUpdateEncodedCron)

    // If prizepool is updated for free game, we update all new prize value
    if (game.prizes.length !== prizes.length || (!Number(registrationAmount) && needUpdatePrizepool)) {
      await updatePrizes()
    }

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
    updateCreatorFee,
    updateEncodedCron,
    updateMaxPlayers,
    updateName,
    updatePlayTimeRange,
    updatePrizes,
    updateTreasuryFee,
  ])

  return { isPending, handleUpdateGame }
}
