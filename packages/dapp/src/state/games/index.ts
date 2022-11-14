import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import type {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from '@reduxjs/toolkit/dist/matchers'

import { FARM_API } from 'config/constants/endpoints'
import stringify from 'fast-json-stable-stringify'
import type { AppState } from 'state'
import { chains } from 'utils/wagmi'

import { resetUserState } from '../global/actions'
import { SerializedGame, SerializedGamesState } from '../types'
import fetchGames from './fetchGames'

const fetchGamePublicDataPkg = async ({ chainId }): Promise<SerializedGame[]> => fetchGames(chainId)

const gameApiFetch = (chainId: number) => fetch(`${FARM_API}/${chainId}`).then((res) => res.json())

const initialState: SerializedGamesState = {
  data: [],
  loadArchivedGamesData: false,
  userDataLoaded: false,
  loadingKeys: {},
}

// Async thunks
export const fetchInitialGamesData = createAsyncThunk<SerializedGame[], { chainId: number }>(
  'games/fetchInitialGamesData',
  async ({ chainId: number, account: string }) => {
    console.log('fetchInitialGamesData')

    const games = await fetchGames(chainId)

    return games.map((game) => {
      const isPlaying = game.playerAddresses.find(account)
      return {
        ...game,
        userData: {
          isPlaying: !!isPlaying,
          isCreator: game.creator === account,
          isAdmin: game.admin === account,
          isCanVoteSplitPot: isPlaying && game.playerAddressesCount <= game.maxPlayers * 0.5,
          wonAmount: 0,
          nextFromRange: 0,
          nextToRange: 0,
          isWonLastGames: false,
          isInTimeRange: false,
        },
      }
    })
  },
)

export const fetchGamesPublicDataAsync = createAsyncThunk<
  SerializedGame[],
  { chainId: number; account: string; flag: string },
  {
    state: AppState
  }
>(
  'games/fetchGamesPublicDataAsync',
  async ({ chainId }) => {
    console.log('fetchGamesPublicDataAsync')

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

// TODO UPDATE INTERFACE
interface GamePlayerDataResponse {
  id: number
  allowance: string
  tokenBalance: string
  stakedBalance: string
  earnings: string
  proxy?: {
    allowance: string
    tokenBalance: string
    stakedBalance: string
    earnings: string
  }
}

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
  GamePlayerDataResponse[],
  { account: string; chainId: number },
  {
    state: AppState
  }
>(
  'games/fetchGamePlayerDataAsync',
  async ({ account, chainId }, config) => {
    // TODO Guigui load user data if needed
    console.log('fetchGamePlayerDataAsync')
    // const poolLength = config.getState().games.poolLength ?? (await fetchMasterChefGamePoolLength(ChainId.BSC))
    // const gamesConfig = await getFarmConfig(chainId)
    // const gamesCanFetch = gamesConfig.filter((gameConfig) => ids.includes(gameConfig.id))
    // if (proxyAddress && gamesCanFetch?.length && verifyBscNetwork(chainId)) {
    //   const { normalFarms, farmsWithProxy } = splitProxyFarms(gamesCanFetch)

    //   const [proxyAllowances, normalAllowances] = await Promise.all([
    //     getBoostedGamesStakeValue(farmsWithProxy, account, chainId, proxyAddress),
    //     getNormalGamesStakeValue(normalFarms, account, chainId),
    //   ])

    //   return [...proxyAllowances, ...normalAllowances]
    // }

    // return getNormalGamesStakeValue(gamesCanFetch, account, chainId)
    return []
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
            wonAmount: 0,
            nextFromRange: 0,
            nextToRange: 0,
            isWonLastGames: false,
            isCanVoteSplitPot: false,
            isInTimeRange: false,
          },
        }
      })
      state.userDataLoaded = false
    })
    // Init game data
    builder.addCase(fetchInitialGamesData.fulfilled, (state, action) => {
      console.log('Init game data')
      const gameData = action.payload
      state.data = gameData
    })

    // Update games with live data
    builder.addCase(fetchGamesPublicDataAsync.fulfilled, (state, action) => {
      console.log('Update games with live data')
      const gameData = action.payload
      state.data = gameData
    })

    // Update games with user data
    builder.addCase(fetchGamePlayerDataAsync.fulfilled, (state, action) => {
      console.log('Update games with user data')

      // TODO GUIGUI
      // const userDataMap = fromPairs(action.payload.map((userDataEl) => [userDataEl.id, userDataEl]))
      // state.data = state.data.map((game) => {
      //   const userDataEl = userDataMap[game.roundId]
      //   if (userDataEl) {
      //     return { ...game, userData: userDataEl }
      //   }
      //   return game
      // })
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
