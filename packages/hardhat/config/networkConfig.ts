// GAME CONFIG : UPDATE DEFAULT CONFIG FROM HARDHAT PACKAGE THEN COPY CHANGE TO DAPP BY COMPILING OR DEPLOYING CONTRACT

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
  },
  '1337': {
    name: 'localhost',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
  },
  '56': {
    name: 'bnb',
    linkToken: '0x404460C6A5EdE2D891e8297795264fDe62ADBB75',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
  },
  '97': {
    name: 'bnb_testnet',
    linkToken: '0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
  },
  '5': {
    name: 'goerli',
    linkToken: '0x63bfb2118771bd0da7a6936667a7bb705a06c1ba',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
  },
  '80001': {
    name: 'mumbai',
    linkToken: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
    fee: '100000000000000',
    fundAmount: '100000000000000',
  },
}

export const developmentChains = ['hardhat', 'localhost']
