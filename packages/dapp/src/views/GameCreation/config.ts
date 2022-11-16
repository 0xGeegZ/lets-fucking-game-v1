import { parseEther } from '@ethersproject/units'

export const MINT_COST = parseEther('1')
export const REGISTER_COST = parseEther('0.5')
export const ALLOWANCE_MULTIPLIER = 5
export const STARTER_NFT_BUNNY_IDS = ['5', '6', '7', '8', '9'] // 'sleepy', 'dollop', 'twinkle', 'churro', 'sunny'
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 15
export const TREASURY_FEE_DEFAULT = 100
export const TREASURY_FEE_MIN = 0
export const TREASURY_FEE_MAX = 100
export const CREATOR_FEE_DEFAULT = 300
export const CREATOR_FEE_MIN = 0
export const CREATOR_FEE_MAX = 500
export const PRIZETYPE = ['ERC20', 'ERC721', 'ERC1155']
export const GAME_CREATION_AMOUNT = parseEther('0.1')
