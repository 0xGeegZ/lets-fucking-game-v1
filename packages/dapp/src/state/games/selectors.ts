import BigNumber from 'bignumber.js'
import addSeconds from 'date-fns/addSeconds'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { deserializeToken } from '@pancakeswap/tokens'
import { createSelector } from '@reduxjs/toolkit'
import _isEmpty from 'lodash/isEmpty'
import { State, SerializedGame, DeserializedGame, DeserializedGameUserData } from '../types'
import { FARM_AUCTION_HOSTING_IN_SECONDS } from '../../config/constants'

const deserializeGameUserData = (game: SerializedGame): DeserializedGameUserData => {
  return {
    allowance: game?.userData ? new BigNumber(game.userData.allowance) : BIG_ZERO,
    tokenBalance: game?.userData ? new BigNumber(game.userData.tokenBalance) : BIG_ZERO,
    stakedBalance: game?.userData ? new BigNumber(game.userData.stakedBalance) : BIG_ZERO,
    earnings: game?.userData ? new BigNumber(game.userData.earnings) : BIG_ZERO,
    proxy: {
      allowance: game?.userData?.proxy ? new BigNumber(game?.userData?.proxy.allowance) : BIG_ZERO,
      tokenBalance: game?.userData?.proxy ? new BigNumber(game?.userData?.proxy.tokenBalance) : BIG_ZERO,
      stakedBalance: game?.userData?.proxy ? new BigNumber(game?.userData?.proxy.stakedBalance) : BIG_ZERO,
      earnings: game?.userData?.proxy ? new BigNumber(game?.userData?.proxy.earnings) : BIG_ZERO,
    },
  }
}

const deserializeGame = (game: SerializedGame): DeserializedGame => {
  const { creator, gameImage, gameName, gameInProgress, contractPaused } = game

  return {
    creator,
    creatorFee: game.creatorFee ? new BigNumber(game.creatorFee) : BIG_ZERO,
    treasuryFee: game.treasuryFee ? new BigNumber(game.treasuryFee) : BIG_ZERO,
    gameImage,
    gameName,
    gameInProgress,
    contractPaused,
    maxPlayers: game.maxPlayers ? new BigNumber(game.maxPlayers) : BIG_ZERO,
    playTimeRange: game.playTimeRange ? new BigNumber(game.playTimeRange) : BIG_ZERO,
    playerAddressesCount: game.playerAddressesCount ? new BigNumber(game.playerAddressesCount) : BIG_ZERO,
    registrationAmount: game.registrationAmount ? new BigNumber(game.registrationAmount) : BIG_ZERO,
    roundId: game.roundId ? new BigNumber(game.roundId) : BIG_ZERO,
    userData: deserializeGameUserData(game),
  }
}

const selectCakeGame = (state: State) => state.games.data.find((g) => g.roundId === 2)
const selectGameByKey = (key: string, value: string | number) => (state: State) =>
  state.games.data.find((f) => f[key] === value)

export const makeGameFromPidSelector = (pid: number) =>
  createSelector([selectGameByKey('pid', pid)], (game) => deserializeGame(game))

// export const makeBusdPriceFromPidSelector = (pid: number) =>
//   createSelector([selectGameByKey('pid', pid)], (game) => {
//     return game && new BigNumber(game.tokenPriceBusd)
//   })

export const makeUserGameFromPidSelector = (pid: number) =>
  createSelector([selectGameByKey('pid', pid)], (game) => {
    const { allowance, tokenBalance, stakedBalance, earnings, proxy } = deserializeGameUserData(game)
    return {
      allowance,
      tokenBalance,
      stakedBalance,
      earnings,
      proxy,
    }
  })

export const priceCakeFromPidSelector = createSelector([selectCakeGame], (cakeBnbGame) => {
  const cakePriceBusdAsString = 0
  return new BigNumber(cakePriceBusdAsString)
})

export const gameFromLpSymbolSelector = (lpSymbol: string) =>
  createSelector([selectGameByKey('lpSymbol', lpSymbol)], (game) => deserializeGame(game))

// export const makeLpTokenPriceFromLpSymbolSelector = (lpSymbol: string) =>
//   createSelector([selectGameByKey('lpSymbol', lpSymbol)], (game) => {
//     let lpTokenPrice = BIG_ZERO
//     if (game) {
//       const lpTotalInQuoteToken = game.lpTotalInQuoteToken ? new BigNumber(game.lpTotalInQuoteToken) : BIG_ZERO
//       const lpTotalSupply = game.lpTotalSupply ? new BigNumber(game.lpTotalSupply) : BIG_ZERO

//       if (lpTotalSupply.gt(0) && lpTotalInQuoteToken.gt(0)) {
//         const gameTokenPriceInUsd = new BigNumber(game.tokenPriceBusd)
//         const tokenAmountTotal = game.tokenAmountTotal ? new BigNumber(game.tokenAmountTotal) : BIG_ZERO
//         // Total value of base token in LP
//         const valueOfBaseTokenInGame = gameTokenPriceInUsd.times(tokenAmountTotal)
//         // Double it to get overall value in LP
//         const overallValueOfAllTokensInGame = valueOfBaseTokenInGame.times(2)
//         // Divide total value of all tokens, by the number of LP tokens
//         const totalLpTokens = getBalanceAmount(lpTotalSupply)
//         lpTokenPrice = overallValueOfAllTokensInGame.div(totalLpTokens)
//       }
//     }

//     return lpTokenPrice
//   })

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
