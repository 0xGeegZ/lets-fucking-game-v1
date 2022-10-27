import dotenv from 'dotenv'
import ethers from 'ethers'

dotenv.config()

const mnemonicWallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC)

console.log('private key', mnemonicWallet.privateKey)
