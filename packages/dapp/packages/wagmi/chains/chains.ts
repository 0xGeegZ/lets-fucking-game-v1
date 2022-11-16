// import { rinkeby, mainnet, goerli, polygon, polygonMumbai } from 'wagmi/chains'
import { rinkeby, polygon, polygonMumbai } from 'wagmi/chains'
import { Chain } from 'wagmi'

export const mainnet: Chain = {
  id: 1,
  name: 'ETHEREUM Testnet',
  network: 'ethereum-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: process.env.NEXT_PUBLIC_RPC_PROVIDER_ETHEREUM,
    default: process.env.NEXT_PUBLIC_RPC_PROVIDER_ETHEREUM,
  },
  blockExplorers: {
    default: { name: 'EtherScan', url: 'https://etherscan.io' },
  },
}

export const goerli: Chain = {
  id: 5,
  name: 'GOERLI Testnet',
  network: 'goerli-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: process.env.NEXT_PUBLIC_RPC_PROVIDER_GOERLI,
    default: process.env.NEXT_PUBLIC_RPC_PROVIDER_GOERLI,
  },
  blockExplorers: {
    default: { name: 'EtherScan', url: 'https://goerli.etherscan.io' },
  },
  testnet: true,
}

export const avalandche: Chain = {
  id: 43114,
  name: 'Avalanche C-Chain',
  network: 'avalanche',
  rpcUrls: {
    default: 'https://rpc.ankr.com/avalanche',
  },
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  blockExplorers: {
    default: {
      name: 'snowtrace',
      url: 'https://snowtrace.io/',
    },
  },
}

export const avalandcheFuji: Chain = {
  id: 43113,
  name: 'Avalanche Fuji',
  network: 'avalanche-fuji',
  rpcUrls: {
    default: 'https://rpc.ankr.com/avalanche_fuji',
  },
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  blockExplorers: {
    default: {
      name: 'snowtrace',
      url: 'https://testnet.snowtrace.io/',
    },
  },
  testnet: true,
}

export const fantomOpera: Chain = {
  id: 250,
  name: 'Fantom Opera',
  network: 'fantom',
  nativeCurrency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
  rpcUrls: {
    default: 'https://rpc.ftm.tools',
  },
  blockExplorers: {
    default: {
      name: 'FTMScan',
      url: 'https://ftmscan.com',
    },
  },
}

export const fantomTestnet: Chain = {
  id: 4002,
  name: 'Fantom Testnet',
  network: 'fantom-testnet',
  nativeCurrency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
  rpcUrls: {
    default: 'https://rpc.testnet.fantom.network',
  },
  blockExplorers: {
    default: {
      name: 'FTMScan',
      url: 'https://testnet.ftmscan.com',
    },
  },
  testnet: true,
}

const bscExplorer = { name: 'BscScan', url: 'https://bscscan.com' }

export const bsc: Chain = {
  id: 56,
  name: 'BNB Smart Chain',
  network: 'bsc',
  rpcUrls: {
    public: 'https://bsc-dataseed1.binance.org',
    default: 'https://bsc-dataseed1.binance.org',
  },
  blockExplorers: {
    default: bscExplorer,
    etherscan: bscExplorer,
  },
  nativeCurrency: {
    name: 'Binance Chain',
    symbol: 'BNB',
    decimals: 18,
  },
  multicall: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    blockCreated: 15921452,
  },
}

export const bscTest: Chain = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Chain',
    symbol: 'BNB',
  },
  rpcUrls: {
    // TODO GUIGUI Better RPC MANAGEMENT
    // public: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    // default: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    public: 'https://data-seed-prebsc-1-s3.binance.org:8545/',
    default: 'https://bsc-testnet.public.blastapi.io/',
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  multicall: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    blockCreated: 17422483,
  },
  testnet: true,
}

export const hardhat: Chain = {
  id: 31337,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat Native Token',
    symbol: 'tETH',
  },
  rpcUrls: {
    public: 'http://localhost:8545/',
    default: 'http://localhost:8545/',
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
}

export { rinkeby, polygon, polygonMumbai as mumbai }
// export { rinkeby, mainnet, goerli, polygon, polygonMumbai as mumbai }
