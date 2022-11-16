import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import type {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from '@reduxjs/toolkit/dist/matchers'

import stringify from 'fast-json-stable-stringify'
import type { AppState } from 'state'
import { chains } from 'utils/wagmi'

import { resetUserState } from '../global/actions'
import { SerializedGame, SerializedGamesState, SerializedGamePlayerData } from '../types'
import fetchGames from './fetchGames'
import { fetchGamesPlayerData } from './fetchGamePlayerData'
import { gamePlayerDataTransformer } from './transformers'

const fetchGamePublicDataPkg = async ({ chainId }): Promise<SerializedGame[]> => fetchGames(chainId)

const initialState: SerializedGamesState = {
  data: [],
  loadArchivedGamesData: false,
  userDataLoaded: false,
  loadingKeys: {},
}

// Async thunks
export const fetchInitialGamesData = createAsyncThunk<SerializedGame[], { chainId: number; account: string }>(
  'games/fetchInitialGamesData',
  async ({ chainId, account }) => {
    console.log('fetchInitialGamesData')
    const chain = chains.find((c) => c.id === chainId)

    if (!chain) throw new Error('chain not supported')

    const games = await fetchGamePublicDataPkg({ chainId })

    return games.map((game) => {
      return {
        ...game,
        userData: {
          isPlaying: false,
          isCreator: false,
          isAdmin: false,
          wonAmount: '0',
          nextFromRange: '0',
          nextToRange: '0',
          isWonLastGames: false,
          isCanVoteSplitPot: false,
          isInTimeRange: false,
        },
        playerData: {
          playerAddress: '',
          roundRangeLowerLimit: 0,
          roundRangeUpperLimit: 0,
          hasPlayedRound: false,
          roundCount: 0,
          position: 0,
          hasLost: false,
          isSplitOk: false,
        },
      }
    })
  },
)

export const fetchGamesPublicDataAsync = createAsyncThunk<
  SerializedGame[],
  { chainId: number; account: string },
  {
    state: AppState
  }
>(
  'games/fetchGamesPublicDataAsync',
  async ({ chainId, account }) => {
    console.log('fetchGamesPublicDataAsync')

    // TODO GUIGUI add chain id to reload games if we change blockchain
    // github.com/pancakeswap/pancake-frontend/blob/develop/apps/web/src/state/farms/index.ts

    // const state = getState()
    // if (state.farms.chainId !== chainId) {
    //   await dispatch(fetchInitialFarmsData({ chainId }))
    // }

    const chain = chains.find((c) => c.id === chainId)

    if (!chain) throw new Error('chain not supported')

    return fetchGamePublicDataPkg({ chainId })
  },
  {
    condition: (arg, { getState }) => {
      const { games } = getState()
      if (games.loadingKeys[stringify({ type: fetchGamesPublicDataAsync.typePrefix, arg })]) {
        console.debug('games action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

//   const gameAllowances = userGameAllowances.map((gameAllowance, index) => {
//     return {
//       id: games[index].id,
//       allowance: userGameAllowances[index],
//       tokenBalance: userGameTokenBalances[index],
//       stakedBalance: userStakedBalances[index],
//       earnings: userGameEarnings[index],
//       proxy: {
//         allowance: proxyUserGameAllowances[index],
//         // NOTE: Duplicate tokenBalance to maintain data structure consistence
//         tokenBalance: userGameTokenBalances[index],
//         stakedBalance: proxyUserStakedBalances[index],
//         earnings: proxyUserGameEarnings[index],
//       },
//     }
//   })

//   return gameAllowances
// }

// async function getNormalGamesStakeValue(games, account, chainId) {
//   const [userGameAllowances, userGameTokenBalances, userStakedBalances, userGameEarnings] = await Promise.all([
//     fetchGamePlayerAllowances(account, games, chainId),
//     fetchGamePlayerTokenBalances(account, games, chainId),
//     fetchGamePlayerStakedBalances(account, games, chainId),
//     fetchGamePlayerEarnings(account, games, chainId),
//   ])

//   const normalGameAllowances = userGameAllowances.map((_, index) => {
//     return {
//       id: games[index].id,
//       allowance: userGameAllowances[index],
//       tokenBalance: userGameTokenBalances[index],
//       stakedBalance: userStakedBalances[index],
//       earnings: userGameEarnings[index],
//     }
//   })

//   return normalGameAllowances
// }

export const fetchGamePlayerDataAsync = createAsyncThunk<
  SerializedGame[],
  { account: string; chainId: number },
  {
    state: AppState
  }
>(
  'games/fetchGamePlayerDataAsync',
  async ({ account, chainId }, { getState }) => {
    // TODO GUIGUI add chain id to reload games if we change blockchain
    // github.com/pancakeswap/pancake-frontend/blob/develop/apps/web/src/state/farms/index.ts

    // const state = getState()
    // if (state.farms.chainId !== chainId) {
    //   await dispatch(fetchInitialFarmsData({ chainId }))
    // }

    console.log('fetchGamePlayerDataAsync')

    const chain = chains.find((c) => c.id === chainId)

    if (!chain) throw new Error('chain not supported')

    const {
      games: { data },
    } = getState()

    const games = data.length ? data : await fetchGamePublicDataPkg({ chainId })

    const playerData = await fetchGamesPlayerData(games, account, chainId)

    return games.map(gamePlayerDataTransformer(playerData, account))
  },
  {
    condition: (arg, { getState }) => {
      const { games } = getState()
      if (games.loadingKeys[stringify({ type: fetchGamePlayerDataAsync.typePrefix, arg })]) {
        console.debug('games user action is fetching, skipping here')
        return false
      }
      return true
    },
  },
)

type UnknownAsyncThunkFulfilledOrPendingAction =
  | UnknownAsyncThunkFulfilledAction
  | UnknownAsyncThunkPendingAction
  | UnknownAsyncThunkRejectedAction

const serializeLoadingKey = (
  action: UnknownAsyncThunkFulfilledOrPendingAction,
  suffix: UnknownAsyncThunkFulfilledOrPendingAction['meta']['requestStatus'],
) => {
  const type = action.type.split(`/${suffix}`)[0]
  return stringify({
    arg: action.meta.arg,
    type,
  })
}

export const gamesSlice = createSlice({
  name: 'Games',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map((game) => {
        return {
          ...game,
          userData: {
            isPlaying: false,
            isCreator: false,
            isAdmin: false,
            wonAmount: '0',
            nextFromRange: '0',
            nextToRange: '0',
            isWonLastGames: false,
            isCanVoteSplitPot: false,
            isInTimeRange: false,
          },
          playerData: {
            playerAddress: '',
            roundRangeLowerLimit: 0,
            roundRangeUpperLimit: 0,
            hasPlayedRound: false,
            roundCount: 0,
            position: 0,
            hasLost: false,
            isSplitOk: false,
          },
        }
      })
      state.userDataLoaded = false
    })
    // Init game data
    builder.addCase(fetchInitialGamesData.fulfilled, (state, action) => {
      console.log('Init game data')
      const gameData = action.payload
      if (gameData.length) state.data = gameData
    })

    // Update games with live data
    builder.addCase(fetchGamesPublicDataAsync.fulfilled, (state, action) => {
      console.log('Update games with live data')
      const gameData = action.payload
      if (!gameData.length) return

      // state.data = gameData

      state.data = state.data.map((game, index) => {
        // const { userData: oldUsedData, playerData: oldPlayerData, ...rest } = game
        // const { userData, playerData } = gameData[index]
        const { userData, playerData } = game

        return {
          ...gameData[index],
          userData,
          playerData,
        }
      })
    })

    // Update games with user data
    builder.addCase(fetchGamePlayerDataAsync.fulfilled, (state, action) => {
      console.log('Update games with user data')
      const gameData = action.payload
      if (gameData.length) state.data = gameData
      state.userDataLoaded = true
    })

    builder.addMatcher(
      isAnyOf(fetchGamePlayerDataAsync.pending, fetchGamesPublicDataAsync.pending),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'pending')] = true
      },
    )
    builder.addMatcher(
      isAnyOf(fetchGamePlayerDataAsync.fulfilled, fetchGamesPublicDataAsync.fulfilled),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addMatcher(
      isAnyOf(fetchGamesPublicDataAsync.rejected, fetchGamePlayerDataAsync.rejected),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'rejected')] = false
      },
    )
  },
})

export default gamesSlice.reducer
