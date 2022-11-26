// GAME CONFIG : UPDATE DEFAULT CONFIG FROM HARDHAT PACKAGE THEN COPY CHANGE TO DAPP BY COMPILING OR DEPLOYING CONTRACT
import { formatBytes32String } from '@ethersproject/strings'
import { parseEther } from '@ethersproject/units'

export const range = (start, end) => Array.from(Array(end + 1).keys()).slice(start)

const randomNumber = () => {
  return Math.floor(Math.random() * (10000 - 1) + 1)
}

export const defaultGameConfig = {
  NAME_DEFAULT: `LFG MVP #${randomNumber()}`,
  // NAME_DEFAULT: formatBytes32String(`LFG MVP #${randomNumber()}`),
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
  AUTHORIZED_REGISTRATION_AMOUNTS: [0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10],

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

export const networkConfig: Record<
  string,
  {
    name: string
    linkToken?: string
    fee: string
    fundAmount: string
    gameConfig?
  }
> = {
  '31337': {
    name: 'hardhat',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
    gameConfig: defaultGameConfig,
  },
  '1337': {
    name: 'localhost',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
    gameConfig: defaultGameConfig,
  },
  '56': {
    name: 'bnb',
    linkToken: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
    gameConfig: {
      ...defaultGameConfig,
      GAME_CREATION_AMOUNT: parseEther('0.1'),
      PLAYERS_DEFAULT: 5,
    },
  },
  '97': {
    name: 'bnb_testnet',
    linkToken: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
    gameConfig: {
      ...defaultGameConfig,
      GAME_CREATION_AMOUNT: parseEther('0.1'),
      PLAYERS_DEFAULT: 5,
    },
  },
  '5': {
    name: 'goerli',
    linkToken: '0x63bfb2118771bd0da7a6936667a7bb705a06c1ba',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
    gameConfig: {
      ...defaultGameConfig,
      GAME_CREATION_AMOUNT: parseEther('0.05'),
      PLAYERS_DEFAULT: 6,
    },
  },
  '80001': {
    name: 'mumbai',
    linkToken: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
    fee: '100000000000000',
    fundAmount: '100000000000000',
    gameConfig: {
      ...defaultGameConfig,
      GAME_CREATION_AMOUNT: parseEther('1'),
      PLAYERS_DEFAULT: 4,
    },
  },
}

export const developmentChains = ['hardhat', 'localhost']
