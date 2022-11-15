import { parseUnits } from '@ethersproject/units'

export const MINT_COST = parseUnits('1')
export const REGISTER_COST = parseUnits('0.5')
export const ALLOWANCE_MULTIPLIER = 5
export const STARTER_NFT_BUNNY_IDS = ['5', '6', '7', '8', '9'] // 'sleepy', 'dollop', 'twinkle', 'churro', 'sunny'
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 15
export const HOUSE_EDGE_MIN = 0
export const HOUSE_EDGE_MAX = 0.1
export const CREATOR_EDGE_MIN = 0
export const CREATOR_EDGE_MAX = 0.05
export const PRIZETYPE = ['ERC20', 'ERC721', 'ERC1155']
