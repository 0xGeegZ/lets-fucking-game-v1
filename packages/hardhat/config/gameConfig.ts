// GAME CONFIG : UPDATE DEFAULT CONFIG FROM HARDHAT PACKAGE THEN COPY CHANGE TO DAPP BY COMPILING OR DEPLOYING CONTRACT
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'

export const range = (start, end) =>
  Array.from(Array(end + 1).keys()).slice(start)

const randomNumber = () => {
  return Math.floor(Math.random() * (10000 - 1) + 1)
}

export interface GameConfig {
  NAME_DEFAULT: string
  NAME_MIN_LENGTH: number
  NAME_MAX_LENGTH: number

  PLAYERS_DEFAULT: number
  PLAYERS_MIN_LENGTH: number
  PLAYERS_MAX_LENGTH: number

  GAME_CREATION_AMOUNT: BigNumber

  PLAY_TIME_RANGE_DEFAULT: number
  AUTHORIZED_PLAY_TIME_RANGE: Array<number>

  REGISTRATION_AMOUNT_DEFAULT: BigNumber
  REGISTRATION_AMOUNT_FREE: BigNumber
  AUTHORIZED_REGISTRATION_AMOUNTS: Array<number>

  PRIZEPOOL_NUMBER: number
  PRIZEPOOL_AMOUNT: BigNumber

  ENCODED_CRON_DEFAULT: string
  AUTHORIZED_CRONS: Array<number>

  PRIZETYPE: Array<string>

  TREASURY_FEE_DEFAULT: number
  TREASURY_FEE_MIN: number
  TREASURY_FEE_MAX: number
  AUTHORIZED_TREASURY_FEE: Array<number>
  CREATOR_FEE_DEFAULT: number
  CREATOR_FEE_MIN: number
  CREATOR_FEE_MAX: number
  AUTHORIZED_CREATOR_FEE: Array<number>
}
export const defaultGameConfig: GameConfig = {
  NAME_DEFAULT: `LFG MVP #${randomNumber()}`,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 32,

  PLAYERS_DEFAULT: 10,
  PLAYERS_MIN_LENGTH: 2,
  PLAYERS_MAX_LENGTH: 100,

  GAME_CREATION_AMOUNT: parseEther('0.01'),

  PLAY_TIME_RANGE_DEFAULT: 2,
  AUTHORIZED_PLAY_TIME_RANGE: [...range(1, 5)],

  REGISTRATION_AMOUNT_DEFAULT: parseEther('0.0001'),
  REGISTRATION_AMOUNT_FREE: parseEther('0'),
  AUTHORIZED_REGISTRATION_AMOUNTS: [
    0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
  ],

  PRIZEPOOL_NUMBER: 0.01,
  PRIZEPOOL_AMOUNT: parseEther('0.01'),

  ENCODED_CRON_DEFAULT: '0 17 * * *',
  AUTHORIZED_CRONS: [...range(0, 23)],

  PRIZETYPE: ['ERC20', 'ERC721', 'ERC1155'],

  TREASURY_FEE_DEFAULT: 300,
  TREASURY_FEE_MIN: 0,
  TREASURY_FEE_MAX: 100,
  AUTHORIZED_TREASURY_FEE: [...range(3, 10)],
  CREATOR_FEE_DEFAULT: 100,
  CREATOR_FEE_MIN: 0,
  CREATOR_FEE_MAX: 500,
  AUTHORIZED_CREATOR_FEE: [...range(0, 5)],
}

export const gameConfig: Record<string, GameConfig | null> = {
  '31337': { ...defaultGameConfig },
  '1337': { ...defaultGameConfig },
  '56': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.5'),
    AUTHORIZED_REGISTRATION_AMOUNTS: [
      0, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10,
    ],
    REGISTRATION_AMOUNT_DEFAULT: parseEther('0.1'),
  },
  '97': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.01'),
    PLAYERS_DEFAULT: 5,
  },
  '5': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.05'),
    // GAME_CREATION_AMOUNT: parseEther('0.05'),
    PLAYERS_DEFAULT: 5,
  },
  '80001': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.01'),
    // GAME_CREATION_AMOUNT: parseEther('50'),
    PLAYERS_DEFAULT: 5,
    AUTHORIZED_REGISTRATION_AMOUNTS: [
      0, 0.0001, 0.5, 1, 2, 5, 10, 100, 200, 250,
    ],
  },
}

export const developmentChains = ['hardhat', 'localhost']
