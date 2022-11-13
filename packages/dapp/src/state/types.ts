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

interface SerializedGameUserData {
  isCreator: boolean
  isAdmin: boolean
  isPlaying: boolean
  wonAmount: number
  nextFromRange: number
  nextToRange: number
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
}

export interface DeserializedGameUserData {
  isCreator: boolean
  isAdmin: boolean
  isPlaying: boolean
  // TODO add isLoosed ?
  wonAmount: BigNumber
  nextFromRange: BigNumber
  nextToRange: BigNumber
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
}

export interface SerializedGame {
  id: number
  name: string
  roundId: number
  isPaused: boolean
  isInProgress: boolean
  isDeleted: boolean
  maxPlayers: number
  playTimeRange: number
  playerAddressesCount: number
  gameCreationAmount: number
  registrationAmount: number
  address: string
  prizepool: number
  encodedCron: string
  creator: string
  admin: string
  treasuryFee: number
  creatorFee: number
  userData?: SerializedGameUserData
}

export interface DeserializedGame {
  id: BigNumber
  name: string
  roundId: BigNumber
  isPaused: boolean
  isInProgress: boolean
  isDeleted: boolean
  maxPlayers: BigNumber
  playTimeRange: BigNumber
  playerAddressesCount: BigNumber
  gameCreationAmount: BigNumber
  registrationAmount: BigNumber
  address: string
  prizepool: BigNumber
  encodedCron: string
  creator: string
  admin: string
  treasuryFee: BigNumber
  creatorFee: BigNumber
  userData?: DeserializedGameUserData
}

// Slices states

export interface SerializedGamesState {
  data: SerializedGame[]
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
