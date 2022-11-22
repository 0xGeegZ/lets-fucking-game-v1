// GAME CONFIG : UPDATE DEFAULT CONFIG FROM HARDHAT PACKAGE THEN COPY CHANGE TO DAPP BY COMPILING OR DEPLOYING CONTRACT
import { parseEther } from '@ethersproject/units'

export const range = (start, end) =>
  Array.from(Array(end + 1).keys()).slice(start)

const randomNumber = () => {
  return Math.floor(Math.random() * (10000 - 1) + 1)
}

export const defaultGameConfig = {
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

  TREASURY_FEE_DEFAULT: 100,
  TREASURY_FEE_MIN: 0,
  TREASURY_FEE_MAX: 100,
  AUTHORIZED_TREASURY_FEE: [...range(3, 10)],
  CREATOR_FEE_DEFAULT: 300,
  CREATOR_FEE_MIN: 0,
  CREATOR_FEE_MAX: 500,
  AUTHORIZED_CREATOR_FEE: [...range(0, 5)],
}

export const gameConfig: Record<
  string,
  {
    NAME_DEFAULT: string
    NAME_MIN_LENGTH: number
    NAME_MAX_LENGTH: number

    PLAYERS_DEFAULT: number
    PLAYERS_MIN_LENGTH: number
    PLAYERS_MAX_LENGTH: number

    GAME_CREATION_AMOUNT: number

    PLAY_TIME_RANGE_DEFAULT: number
    AUTHORIZED_PLAY_TIME_RANGE: Array

    REGISTRATION_AMOUNT_DEFAULT: number
    REGISTRATION_AMOUNT_FREE: number
    AUTHORIZED_REGISTRATION_AMOUNTS: Array

    PRIZEPOOL_NUMBER: number
    PRIZEPOOL_AMOUNT: number

    ENCODED_CRON_DEFAULT: string
    AUTHORIZED_CRONS: Array

    PRIZETYPE: Array

    TREASURY_FEE_DEFAULT: number
    TREASURY_FEE_MIN: number
    TREASURY_FEE_MAX: number
    AUTHORIZED_TREASURY_FEE: Array
    CREATOR_FEE_DEFAULT: number
    CREATOR_FEE_MIN: number
    CREATOR_FEE_MAX: number
    AUTHORIZED_CREATOR_FEE: Array
  }
> = {
  '31337': { ...defaultGameConfig },
  '1337': { ...defaultGameConfig },
  '56': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.5'),
  },
  '97': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.1'),
    PLAYERS_DEFAULT: 5,
  },
  '5': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('0.05'),
    PLAYERS_DEFAULT: 5,
  },
  '80001': {
    ...defaultGameConfig,
    GAME_CREATION_AMOUNT: parseEther('1'),
    PLAYERS_DEFAULT: 5,
  },
}

export const developmentChains = ['hardhat', 'localhost']
