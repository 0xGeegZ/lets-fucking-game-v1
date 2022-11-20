import { parseEther } from '@ethersproject/units'
import { range } from 'utils'

export const NAME_MIN_LENGTH = 3
export const NAME_MAX_LENGTH = 32

export const PLAYERS_MIN_LENGTH = 2
export const PLAYERS_MAX_LENGTH = 100

export const AUTHORIZED_CRONS = [...range(0, 23)]
export const AUTHORIZED_PLAY_TIME_RANGE = [...range(1, 5)]
export const AUTHORIZED_CREATOR_FEE = [...range(0, 5)]
export const AUTHORIZED_TREASURY_FEE = [...range(3, 10)]

// TODO GUIGUI HANDLE FREE GAMES AND LOAD AUTHORIZED AMOUNTS FROM CONFIG
// export const AUTHORIZED_AMOUNTS = [0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
export const AUTHORIZED_AMOUNTS = [0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]

export const PRIZETYPE = ['ERC20', 'ERC721', 'ERC1155']
export const GAME_CREATION_AMOUNT = parseEther('0.1')

export const REGISTER_COST = parseEther('0.1')

export const TREASURY_FEE_DEFAULT = 100
export const TREASURY_FEE_MIN = 0
export const TREASURY_FEE_MAX = 100
export const CREATOR_FEE_DEFAULT = 300
export const CREATOR_FEE_MIN = 0
export const CREATOR_FEE_MAX = 500
