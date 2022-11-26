import { getFullDecimalMultiplier } from 'utils/getFullDecimalMultiplier'

export const BSC_BLOCK_TIME = 3
export const BLOCKS_PER_DAY = (60 / BSC_BLOCK_TIME) * 60 * 24
export const BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365 // 10512000
export const BASE_URL = 'https://lfgames.xyz'
export const DEFAULT_TOKEN_DECIMAL = getFullDecimalMultiplier(18)
export const DEFAULT_GAS_LIMIT = 250000
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs'
