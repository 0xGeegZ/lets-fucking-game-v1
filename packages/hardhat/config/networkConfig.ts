export const networkConfig: Record<
  string,
  {
    name: string
    linkToken?: string
    feedRegistry?: string
    ethUsdPriceFeed?: string
    vrfCoordinator?: string
    keyHash: string
    oracle?: string
    jobId: string
    fee: string
    fundAmount: string
  }
> = {
  '31337': {
    name: 'hardhat',
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
  '4': {
    name: 'rinkeby',
    linkToken: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    fee: '100000000000000000',
    fundAmount: '1000000000000000000',
  },
  '42': {
    name: 'kovan',
    linkToken: '0xa36085F69e2889c224210F603D836748e7dC0088',
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
