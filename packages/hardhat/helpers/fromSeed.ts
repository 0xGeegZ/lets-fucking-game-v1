const ethers = require('ethers')

require('dotenv').config()

const mnemonicWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC)

console.log('private key', mnemonicWallet.privateKey)
