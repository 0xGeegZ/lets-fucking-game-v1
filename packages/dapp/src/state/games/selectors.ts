import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { createSelector } from '@reduxjs/toolkit'
import _isEmpty from 'lodash/isEmpty'
import {
  State,
  SerializedGame,
  DeserializedGame,
  DeserializedGameUserData,
  DeserializedPrizeData,
  DeserializedGamePlayerData,
} from '../types'

const deserializeGameUserData = (game: SerializedGame): DeserializedGameUserData => {
  return {
    isPlaying: game?.userData ? game.userData.isPlaying : false,
    isCreator: game?.userData ? game.userData.isCreator : false,
    isAdmin: game?.userData ? game.userData.isAdmin : false,
    wonAmount: game?.userData ? new BigNumber(game.userData.wonAmount) : BIG_ZERO,
    nextFromRange: game?.userData ? game.userData.nextFromRange : '',
    nextToRange: game?.userData ? game.userData.nextToRange : '',
    isWonLastGames: game?.userData ? game.userData.isWonLastGames : false,
    isCanVoteSplitPot: game?.userData ? game.userData.isCanVoteSplitPot : false,
    isInTimeRange: game?.userData ? game.userData.isInTimeRange : false,
  }
}

const deserializeGamePlayerData = (game: SerializedGame): DeserializedGamePlayerData => {
  return {
    playerAddress: game?.playerData ? game.playerData.playerAddress : '',
    roundRangeLowerLimit: game?.playerData ? new BigNumber(game.playerData.roundRangeLowerLimit) : BIG_ZERO,
    roundRangeUpperLimit: game?.playerData ? new BigNumber(game.playerData.roundRangeUpperLimit) : BIG_ZERO,
    hasPlayedRound: game?.playerData ? game.playerData.hasPlayedRound : false,
    roundCount: game?.playerData ? new BigNumber(game.playerData.roundCount) : BIG_ZERO,
    position: game?.playerData ? new BigNumber(game.playerData.position) : BIG_ZERO,
    hasLost: game?.playerData ? game.playerData.hasLost : false,
    isSplitOk: game?.playerData ? game.playerData.isSplitOk : false,
  }
}

const deserializeGamePrize = (game: SerializedGame): DeserializedPrizeData[] => {
  return game?.prizes?.map((prize) => {
    return {
      amount: prize?.amount ? new BigNumber(prize.amount) : BIG_ZERO,
      position: prize?.position ? new BigNumber(prize.position) : BIG_ZERO,
    }
  })
}

const deserializeGame = (game: SerializedGame): DeserializedGame => {
  const {
    id,
    name,
    roundId,
    isPaused,
    isInProgress,
    isDeleted,
    maxPlayers,
    playTimeRange,
    remainingPlayersCount,
    playerAddressesCount,
    gameCreationAmount,
    registrationAmount,
    address,
    prizepool,
    encodedCron,
    creator,
    admin,
    treasuryFee,
    treasuryAmount,
    creatorFee,
    creatorAmount,
    playerAddresses,
  } = game

  return {
    id: id ? new BigNumber(id) : BIG_ZERO,
    name,
    roundId: roundId ? new BigNumber(roundId) : BIG_ZERO,
    isPaused,
    isInProgress,
    isDeleted,
    playTimeRange: playTimeRange ? new BigNumber(playTimeRange) : BIG_ZERO,
    maxPlayers: maxPlayers ? new BigNumber(maxPlayers) : BIG_ZERO,
    remainingPlayersCount: remainingPlayersCount ? new BigNumber(remainingPlayersCount) : BIG_ZERO,
    playerAddressesCount: playerAddressesCount ? new BigNumber(playerAddressesCount) : BIG_ZERO,
    gameCreationAmount: gameCreationAmount ? new BigNumber(gameCreationAmount) : BIG_ZERO,
    registrationAmount: registrationAmount ? new BigNumber(registrationAmount) : BIG_ZERO,
    address,
    prizepool: prizepool ? new BigNumber(prizepool) : BIG_ZERO,
    encodedCron,
    creator,
    admin,
    treasuryFee: treasuryFee ? new BigNumber(treasuryFee) : BIG_ZERO,
    // treasuryAmount: treasuryAmount ? new BigNumber(treasuryAmount) : BIG_ZERO,
    treasuryAmount,
    creatorFee: creatorFee ? new BigNumber(creatorFee) : BIG_ZERO,
    // creatorAmount: creatorAmount ? new BigNumber(creatorAmount) : BIG_ZERO,
    creatorAmount,
    playerAddresses,
    prizes: deserializeGamePrize(game),
    userData: deserializeGameUserData(game),
    playerData: deserializeGamePlayerData(game),
  }
}

const selectGameByKey = (key: string, value: string | number) => (state: State) =>
  state.games.data.find((f) => f[key] === value)

export const makeGameFromIdSelector = (id: number) =>
  createSelector([selectGameByKey('id', id)], (game) => deserializeGame(game))

export const makeUserGameFromIdSelector = (id: number) =>
  createSelector([selectGameByKey('id', id)], (game) => deserializeGameUserData(game))

export const makePlayerGameFromIdSelector = (id: number) =>
  createSelector([selectGameByKey('id', id)], (game) => deserializeGameUserData(game))

export const gameSelector = () =>
  createSelector(
    (state: State) => state.games,
    (games) => {
      const deserializedGamesData = games.data.map(deserializeGame)
      const { loadArchivedGamesData, userDataLoaded, loadingKeys } = games

      return {
        loadArchivedGamesData,
        userDataLoaded,
        loadingKeys,
        data: deserializedGamesData,
      }
    },
  )
