import BigNumber from 'bignumber.js'
import { BIG_ONE, BIG_ZERO } from 'utils/bigNumber'
import { filterFarmsByQuoteToken } from '@pancakeswap/farms'
import { SerializedGame } from 'state/types'

const getGameFromTokenSymbol = (
  games: SerializedGame[],
  tokenSymbol: string,
  preferredQuoteTokens?: string[],
): SerializedGame => {
  const gamesWithTokenSymbol = games.filter((game) => game.token.symbol === tokenSymbol)
  const filteredGame = filterFarmsByQuoteToken(gamesWithTokenSymbol, preferredQuoteTokens)
  return filteredGame
}

const getGameBaseTokenPrice = (
  game: SerializedGame,
  quoteTokenGame: SerializedGame,
  nativePriceUSD: BigNumber,
  wNative: string,
  stable: string,
): BigNumber => {
  const hasTokenPriceVsQuote = Boolean(game.tokenPriceVsQuote)

  if (game.quoteToken.symbol === stable) {
    return hasTokenPriceVsQuote ? new BigNumber(game.tokenPriceVsQuote) : BIG_ZERO
  }

  if (game.quoteToken.symbol === wNative) {
    return hasTokenPriceVsQuote ? nativePriceUSD.times(game.tokenPriceVsQuote) : BIG_ZERO
  }

  // We can only calculate profits without a quoteTokenGame for BUSD/BNB games
  if (!quoteTokenGame) {
    return BIG_ZERO
  }

  // Possible alternative game quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the game's quote token isn't BUSD or WBNB, we then use the quote token, of the original game's quote token
  // i.e. for game PNT - pBTC we use the pBTC game's quote token - BNB, (pBTC - BNB)
  // from the BNB - pBTC price, we can calculate the PNT - BUSD price
  if (quoteTokenGame.quoteToken.symbol === wNative) {
    const quoteTokenInBusd = nativePriceUSD.times(quoteTokenGame.tokenPriceVsQuote)
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(game.tokenPriceVsQuote).times(quoteTokenInBusd)
      : BIG_ZERO
  }

  if (quoteTokenGame.quoteToken.symbol === stable) {
    const quoteTokenInBusd = quoteTokenGame.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(game.tokenPriceVsQuote).times(quoteTokenInBusd)
      : BIG_ZERO
  }

  // Catch in case token does not have immediate or once-removed BUSD/WBNB quoteToken
  return BIG_ZERO
}

const getGameQuoteTokenPrice = (
  game: SerializedGame,
  quoteTokenGame: SerializedGame,
  nativePriceUSD: BigNumber,
  wNative: string,
  stable: string,
): BigNumber => {
  if (game.quoteToken.symbol === stable) {
    return BIG_ONE
  }

  if (game.quoteToken.symbol === wNative) {
    return nativePriceUSD
  }

  if (!quoteTokenGame) {
    return BIG_ZERO
  }

  if (quoteTokenGame.quoteToken.symbol === wNative) {
    return quoteTokenGame.tokenPriceVsQuote ? nativePriceUSD.times(quoteTokenGame.tokenPriceVsQuote) : BIG_ZERO
  }

  if (quoteTokenGame.quoteToken.symbol === stable) {
    return quoteTokenGame.tokenPriceVsQuote ? new BigNumber(quoteTokenGame.tokenPriceVsQuote) : BIG_ZERO
  }

  return BIG_ZERO
}

const getGamesPrices = (games: SerializedGame[], chainId: number) => {
  if (!nativeStableLpMap[chainId]) {
    throw new Error(`chainId ${chainId} not supported`)
  }

  const nativeStableGame = games.find(
    (game) => game.lpAddress.toLowerCase() === nativeStableLpMap[chainId].address.toLowerCase(),
  )
  const nativePriceUSD = nativeStableGame.tokenPriceVsQuote ? BIG_ONE.div(nativeStableGame.tokenPriceVsQuote) : BIG_ZERO
  const gamesWithPrices = games.map((game) => {
    const quoteTokenGame = getGameFromTokenSymbol(games, game.quoteToken.symbol, [
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
    ])
    const tokenPriceBusd = getGameBaseTokenPrice(
      game,
      quoteTokenGame,
      nativePriceUSD,
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
    )
    const quoteTokenPriceBusd = getGameQuoteTokenPrice(
      game,
      quoteTokenGame,
      nativePriceUSD,
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
    )

    return {
      ...game,
      tokenPriceBusd: tokenPriceBusd.toJSON(),
      quoteTokenPriceBusd: quoteTokenPriceBusd.toJSON(),
    }
  })

  return gamesWithPrices
}

export default getGamesPrices

const nativeStableLpMap = {
  5: {
    address: '0xf5bf0C34d3c428A74Ceb98d27d38d0036C587200',
    wNative: 'WETH',
    stable: 'USDC',
  },
  56: {
    address: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    wNative: 'WBNB',
    stable: 'BUSD',
  },
  97: {
    address: '0x4E96D2e92680Ca65D58A0e2eB5bd1c0f44cAB897',
    wNative: 'WBNB',
    stable: 'BUSD',
  },
}
