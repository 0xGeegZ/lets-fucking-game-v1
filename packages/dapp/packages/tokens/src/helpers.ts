import { TokenInfo, TokenList, Tags } from '@uniswap/token-lists'
import { Token, ChainId, SerializedToken } from '@pancakeswap/sdk'

export interface SerializedWrappedToken extends SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol: string
  name?: string
  projectLink?: string
  logoURI?: string
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly logoURI: string | undefined

  constructor(tokenInfo: TokenInfo) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.logoURI = tokenInfo.logoURI
  }

  public get serialize(): SerializedWrappedToken {
    return {
      address: this.address,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink,
      logoURI: this.logoURI,
    }
  }
}

export type TokenAddressMap = Readonly<{
  [chainId in ChainId]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }>
}>

/**
 * An empty result, useful as a default.
 */
export const EMPTY_LIST: TokenAddressMap = {
  [ChainId.ETHEREUM]: {},
  [ChainId.RINKEBY]: {},
  [ChainId.GOERLI]: {},
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {},
  [ChainId.POLYGON]: {},
  [ChainId.MUMBAI]: {},
  [ChainId.HARDHAT]: {},
}

export function deserializeToken(serializedToken: SerializedWrappedToken): Token {
  if (serializedToken.logoURI) {
    return new WrappedTokenInfo({
      chainId: serializedToken.chainId,
      address: serializedToken.address,
      decimals: serializedToken.decimals,
      symbol: serializedToken.symbol || 'Unknown',
      name: serializedToken.name || 'Unknown',
      logoURI: serializedToken.logoURI,
    })
  }
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
    serializedToken.projectLink,
  )
}

export function serializeTokens(unserializedTokens) {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: unserializedTokens[key].serialize }
  }, {} as any)

  return serializedTokens
}
