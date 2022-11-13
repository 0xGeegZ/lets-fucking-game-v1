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
  async ({ chainId }) => {
    const games = await fetchGames(chainId)
    console.log('🚀 ~ file: index.ts ~ line 33 ~ games', games)
    return games.map((game) => ({
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
    }))
  },
)

let fallback = false

export const fetchGamesPublicDataAsync = createAsyncThunk<
  SerializedGame[],
  { chainId: number; flag: string },
  {
    state: AppState
  }
>(
  'games/fetchGamesPublicDataAsync',
  async ({ chainId, flag = 'pkg' }) => {
    const chain = chains.find((c) => c.id === chainId)

    if (!chain) throw new Error('chain not supported')
    try {
      if (flag === 'api' && !fallback) {
        try {
          const { updatedAt, data: gamesWithPrice, poolLength, regularCakePerBlock } = await gameApiFetch(chainId)
          if (Date.now() - new Date(updatedAt).getTime() > 3 * 60 * 1000) {
            fallback = true
            throw new Error('Game Api out dated')
          }
          return [gamesWithPrice, poolLength, regularCakePerBlock]
        } catch (error) {
          console.error(error)
          return fetchGamePublicDataPkg({ chainId })
        }
      }

      return fetchGamePublicDataPkg({ chainId })
    } catch (error) {
      console.error(error)
      throw error
    }
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

interface GameUserDataResponse {
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

// async function getBoostedGamesStakeValue(games, account, chainId, proxyAddress) {
//   const [
//     userGameAllowances,
//     userGameTokenBalances,
//     userStakedBalances,
//     userGameEarnings,
//     proxyUserGameAllowances,
//     proxyUserStakedBalances,
//     proxyUserGameEarnings,
//   ] = await Promise.all([
//     fetchGameUserAllowances(account, games, chainId),
//     fetchGameUserTokenBalances(account, games, chainId),
//     fetchGameUserStakedBalances(account, games, chainId),
//     fetchGameUserEarnings(account, games, chainId),
//     // Proxy call
//     fetchGameUserAllowances(account, games, chainId, proxyAddress),
//     fetchGameUserStakedBalances(proxyAddress, games, chainId),
//     fetchGameUserEarnings(proxyAddress, games, chainId),
//   ])

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
//     fetchGameUserAllowances(account, games, chainId),
//     fetchGameUserTokenBalances(account, games, chainId),
//     fetchGameUserStakedBalances(account, games, chainId),
//     fetchGameUserEarnings(account, games, chainId),
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

export const fetchGameUserDataAsync = createAsyncThunk<
  GameUserDataResponse[],
  { account: string; chainId: number },
  {
    state: AppState
  }
>(
  'games/fetchGameUserDataAsync',
  async ({ account, chainId }, config) => {
    // TODO Guigui load user data if needed
    console.log('fetchGameUserDataAsync')
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
      if (games.loadingKeys[stringify({ type: fetchGameUserDataAsync.typePrefix, arg })]) {
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
      console.log('🚀 ~ file: index.ts ~ line 252 ~ state.data=state.data.map ~ state.data', state.data)

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
      const gameData = action.payload
      state.data = gameData
    })

    // Update games with live data
    builder.addCase(fetchGamesPublicDataAsync.fulfilled, (state, action) => {
      // TODO GUIGUI
      // const [gamePayload, poolLength, regularCakePerBlock] = action.payload
      // console.log('🚀 ~ file: index.ts ~ line 321 ~ builder.addCase ~ gamePayload', gamePayload)
      // const gamePayloadPidMap = fromPairs(gamePayload.map((gameData) => [gameData.id, gameData]))
      // state.data = state.data.map((game) => {
      //   const liveGameData = gamePayloadPidMap[game.id]
      //   return { ...game, ...liveGameData }
      // })
      // state.poolLength = poolLength
      // state.regularCakePerBlock = regularCakePerBlock
    })

    // Update games with user data
    builder.addCase(fetchGameUserDataAsync.fulfilled, (state, action) => {
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

    builder.addMatcher(isAnyOf(fetchGameUserDataAsync.pending, fetchGamesPublicDataAsync.pending), (state, action) => {
      state.loadingKeys[serializeLoadingKey(action, 'pending')] = true
    })
    builder.addMatcher(
      isAnyOf(fetchGameUserDataAsync.fulfilled, fetchGamesPublicDataAsync.fulfilled),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'fulfilled')] = false
      },
    )
    builder.addMatcher(
      isAnyOf(fetchGamesPublicDataAsync.rejected, fetchGameUserDataAsync.rejected),
      (state, action) => {
        state.loadingKeys[serializeLoadingKey(action, 'rejected')] = false
      },
    )
  },
})

export default gamesSlice.reducer
