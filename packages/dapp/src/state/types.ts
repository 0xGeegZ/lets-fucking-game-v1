import { parseUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'

export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '10',
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, 'gwei').toString(),
  fast: parseUnits(GAS_PRICE.fast, 'gwei').toString(),
  instant: parseUnits(GAS_PRICE.instant, 'gwei').toString(),
  testnet: parseUnits(GAS_PRICE.testnet, 'gwei').toString(),
}

export interface BigNumberToJson {
  type: 'BigNumber'
  hex: string
}

export type SerializedBigNumber = string

// Games

export interface SerializedPrizeData {
  amount: string
  position: number
}

export interface DeserializedPrizeData {
  amount: BigNumber
  position: BigNumber
}

export interface SerializedGamePlayerData {
  playerAddress: string
  roundRangeLowerLimit: number
  roundRangeUpperLimit: number
  hasPlayedRound: boolean
  roundCount: number
  position: number
  hasLost: boolean
  isSplitOk: boolean
}

export interface DeserializedGamePlayerData {
  playerAddress: string
  roundRangeLowerLimit: BigNumber
  roundRangeUpperLimit: BigNumber
  hasPlayedRound: boolean
  roundCount: BigNumber
  position: BigNumber
  hasLost: boolean
  isSplitOk: boolean
}

export interface SerializedGameUserData {
  isCreator: boolean
  isAdmin: boolean
  isPlaying: boolean
  wonAmount: string
  // TODO delete this var ??
  nextFromRange: string
  // TODO delete this var ??
  nextToRange: string
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  // TODO add isLoosed ?
}

export interface DeserializedGameUserData {
  isCreator: boolean
  isAdmin: boolean
  isPlaying: boolean
  wonAmount: BigNumber
  // TODO delete this var ??
  nextFromRange: string
  // TODO delete this var ??
  nextToRange: string
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  // TODO add isLoosed ?
}

export interface SerializedGame {
  id: number
  name: string
  versionId: number
  roundId: number
  isPaused: boolean
  isInProgress: boolean
  isDeleted: boolean
  maxPlayers: number
  playTimeRange: number
  remainingPlayersCount: number
  playerAddressesCount: number
  gameCreationAmount: string
  registrationAmount: string
  address: string
  prizepool: string
  encodedCron: string
  creator: string
  admin: string
  treasuryFee: string
  treasuryAmount: string
  creatorFee: string
  creatorAmount: string
  playerAddresses: string[]
  prizes: SerializedPrizeData[]
  userData?: SerializedGameUserData
  playerData?: SerializedGamePlayerData
}

export interface DeserializedGame {
  id: BigNumber
  name: string
  versionId: BigNumber
  roundId: BigNumber
  isPaused: boolean
  isInProgress: boolean
  isDeleted: boolean
  maxPlayers: BigNumber
  playTimeRange: BigNumber
  remainingPlayersCount: BigNumber
  playerAddressesCount: BigNumber
  gameCreationAmount: BigNumber
  registrationAmount: BigNumber
  address: string
  prizepool: BigNumber
  encodedCron: string
  creator: string
  admin: string
  treasuryFee: BigNumber
  treasuryAmount: string
  creatorFee: BigNumber
  creatorAmount: string
  playerAddresses: string[]
  prizes: DeserializedPrizeData[]
  userData?: DeserializedGameUserData
  playerData?: DeserializedGamePlayerData
}

// Slices states

export interface SerializedGamesState {
  data: SerializedGame[]
  chainId?: number
  loadArchivedGamesData: boolean
  userDataLoaded: boolean
  loadingKeys: Record<string, boolean>
}

export interface DeserializedGamesState {
  data: DeserializedGame[]
  loadArchivedGamesData: boolean
  userDataLoaded: boolean
  loadingKeys: Record<string, boolean>
}

// Global state

export interface State {
  games: SerializedGamesState
}
