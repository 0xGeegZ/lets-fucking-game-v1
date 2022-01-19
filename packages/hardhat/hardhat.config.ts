import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@appliedblockchain/chainlink-plugins-fund-link'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'dotenv/config'
import { task } from 'hardhat/config'
import './tasks/withdraw-link'
import './tasks/accounts'
import { HardhatUserConfig } from 'hardhat/types'
import 'solidity-coverage'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (_args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const RINKEBY_RPC_URL =
  process.env.RINKEBY_RPC_URL || 'https://rinkeby.infura.io/v3/your-api-key'
const KOVAN_RPC_URL =
  process.env.KOVAN_RPC_URL || 'https://kovan.infura.io/v3/your-api-key'
const MUMBAI_RPC_URL =
  process.env.MUMBAI_RPC_URL || 'https://mumbai.infura.io/v3/your-api-key'
const MNEMONIC = process.env.MNEMONIC || 'your mnemonic'
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || 'Your etherscan API key'
// const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your private key'

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      // accounts: [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
    kovan: {
      url: KOVAN_RPC_URL,
      // accounts: [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      // accounts: [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
      saveDeployments: true,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    feeCollector: {
      default: 1,
    },
  },
  typechain: {
    outDir: '../types/typechain',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.3',
      },
      {
        version: '0.6.6',
      },
    ],
  },
  mocha: {
    timeout: 100000,
  },
}

export default config
