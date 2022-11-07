import { useWeb3React } from '@pancakeswap/wagmi'
import { ChainId, Currency, CurrencyAmount, Pair, Trade, TradeType } from '@pancakeswap/sdk'
import { ParsedUrlQuery } from 'querystring'
import { useEffect, useMemo, useState } from 'react'
import { SLOW_INTERVAL } from 'config/constants'
import { DEFAULT_INPUT_CURRENCY, DEFAULT_OUTPUT_CURRENCY } from 'config/constants/exchange'
import useSWRImmutable from 'swr/immutable'
import { useDispatch, useSelector } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { useRouter } from 'next/router'
import { useTranslation } from '@pancakeswap/localization'
import { isAddress } from 'utils'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { getBlocksFromTimestamps } from 'utils/getBlocksFromTimestamps'
import { getChangeForPeriod } from 'utils/getChangeForPeriod'
import { getLpFeesAndApr } from 'utils/getLpFeesAndApr'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { computeSlippageAdjustedAmounts } from 'utils/exchange'
import { CAKE, USDC } from '@pancakeswap/tokens'
import getLpAddress from 'utils/getLpAddress'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { AppState, useAppDispatch } from '../index'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, updateDerivedPairData, updatePairData } from './actions'
import { SwapState } from './reducer'
import { useUserSlippageTolerance } from '../user/hooks'
import fetchPairPriceData from './fetch/fetchPairPriceData'
import {
  normalizeChartData,
  normalizeDerivedChartData,
  normalizeDerivedPairDataByActiveToken,
  normalizePairDataByActiveToken,
} from './normalizers'
import { PairDataTimeWindowEnum } from './types'
import { derivedPairByDataIdSelector, pairByDataIdSelector } from './selectors'
import fetchDerivedPriceData from './fetch/fetchDerivedPriceData'
import { pairHasEnoughLiquidity } from './fetch/utils'
import { fetchPoolData } from '../info/queries/pools/poolData'

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

// TODO: update
const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade<Currency, Currency, TradeType>, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

// Get swap price for single token disregarding slippage and price impact
export function useSingleTokenSwapInfo(
  inputCurrencyId: string | undefined,
  inputCurrency: Currency | undefined,
  outputCurrencyId: string | undefined,
  outputCurrency: Currency | undefined,
): { [key: string]: number } {
  const token0Address = getTokenAddress(inputCurrencyId)
  const token1Address = getTokenAddress(outputCurrencyId)

  const parsedAmount = tryParseAmount('1', inputCurrency ?? undefined)

  const bestTradeExactIn = useTradeExactIn(parsedAmount, outputCurrency ?? undefined)
  if (!inputCurrency || !outputCurrency || !bestTradeExactIn) {
    return null
  }

  const inputTokenPrice = parseFloat(bestTradeExactIn?.executionPrice?.toSignificant(6))
  const outputTokenPrice = 1 / inputTokenPrice

  return {
    [token0Address]: inputTokenPrice,
    [token1Address]: outputTokenPrice,
  }
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  independentField: Field,
  typedValue: string,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  recipient: string,
): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  v2Trade: Trade<Currency, Currency, TradeType> | undefined
  inputError?: string
} {
  const { account } = useWeb3React()
  const { t } = useTranslation()

  const to: string | null = (recipient === null ? account : isAddress(recipient) || null) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = t('Connect Wallet')
  }

  if (!parsedAmount) {
    inputError = inputError ?? t('Enter an amount')
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? t('Select a token')
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? t('Enter a recipient')
  } else if (
    BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
    (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
  ) {
    inputError = inputError ?? t('Invalid recipient')
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = t('Insufficient %symbol% balance', { symbol: amountIn.currency.symbol })
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
  }
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !Number.isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(
  parsedQs: ParsedUrlQuery,
  nativeSymbol?: string,
  defaultOutputCurrency?: string,
): SwapState {
  let inputCurrency = isAddress(parsedQs.inputCurrency) || (nativeSymbol ?? DEFAULT_INPUT_CURRENCY)
  let outputCurrency =
    typeof parsedQs.outputCurrency === 'string'
      ? isAddress(parsedQs.outputCurrency) || nativeSymbol
      : defaultOutputCurrency ?? DEFAULT_OUTPUT_CURRENCY
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
    pairDataById: {},
    derivedPairDataById: {},
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const native = useNativeCurrency()
  const { query } = useRouter()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId || !native) return
    const parsed = queryParametersToSwapState(query, native.symbol, CAKE[chainId]?.address ?? USDC[chainId]?.address)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: null,
      }),
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
  }, [dispatch, chainId, query, native])

  return result
}

type useFetchPairPricesParams = {
  token0Address: string
  token1Address: string
  timeWindow: PairDataTimeWindowEnum
  currentSwapPrice: {
    [key: string]: number
  }
}

export const useFetchPairPrices = ({
  token0Address,
  token1Address,
  timeWindow,
  currentSwapPrice,
}: useFetchPairPricesParams) => {
  const [pairId, setPairId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const pairData = useSelector(pairByDataIdSelector({ pairId, timeWindow }))
  const derivedPairData = useSelector(derivedPairByDataIdSelector({ pairId, timeWindow }))
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchDerivedData = async () => {
      console.info(
        '[Price Chart]: Not possible to retrieve price data from single pool, trying to fetch derived prices',
      )
      try {
        // Try to get at least derived data for chart
        // This is used when there is no direct data for pool
        // i.e. when multihops are necessary
        const derivedData = await fetchDerivedPriceData(token0Address, token1Address, timeWindow)
        if (derivedData) {
          const normalizedDerivedData = normalizeDerivedChartData(derivedData)
          dispatch(updateDerivedPairData({ pairData: normalizedDerivedData, pairId, timeWindow }))
        } else {
          dispatch(updateDerivedPairData({ pairData: [], pairId, timeWindow }))
        }
      } catch (error) {
        console.error('Failed to fetch derived prices for chart', error)
        dispatch(updateDerivedPairData({ pairData: [], pairId, timeWindow }))
      } finally {
        setIsLoading(false)
      }
    }

    const fetchAndUpdatePairPrice = async () => {
      setIsLoading(true)
      const { data } = await fetchPairPriceData({ pairId, timeWindow })
      if (data) {
        // Find out if Liquidity Pool has enough liquidity
        // low liquidity pool might mean that the price is incorrect
        // in that case try to get derived price
        const hasEnoughLiquidity = pairHasEnoughLiquidity(data, timeWindow)
        const newPairData = normalizeChartData(data, timeWindow) || []
        if (newPairData.length > 0 && hasEnoughLiquidity) {
          dispatch(updatePairData({ pairData: newPairData, pairId, timeWindow }))
          setIsLoading(false)
        } else {
          console.info(`[Price Chart]: Liquidity too low for ${pairId}`)
          dispatch(updatePairData({ pairData: [], pairId, timeWindow }))
          fetchDerivedData()
        }
      } else {
        dispatch(updatePairData({ pairData: [], pairId, timeWindow }))
        fetchDerivedData()
      }
    }

    if (!pairData && !derivedPairData && pairId && !isLoading) {
      fetchAndUpdatePairPrice()
    }
  }, [
    pairId,
    timeWindow,
    pairData,
    currentSwapPrice,
    token0Address,
    token1Address,
    derivedPairData,
    dispatch,
    isLoading,
  ])

  useEffect(() => {
    const updatePairId = () => {
      try {
        const pairAddress = getLpAddress(token0Address, token1Address)?.toLowerCase()
        if (pairAddress !== pairId) {
          setPairId(pairAddress)
        }
      } catch (error) {
        setPairId(null)
      }
    }

    updatePairId()
  }, [token0Address, token1Address, pairId])

  const normalizedPairData = useMemo(
    () => normalizePairDataByActiveToken({ activeToken: token0Address, pairData }),
    [token0Address, pairData],
  )

  const normalizedDerivedPairData = useMemo(
    () => normalizeDerivedPairDataByActiveToken({ activeToken: token0Address, pairData: derivedPairData }),
    [token0Address, derivedPairData],
  )

  const hasSwapPrice = currentSwapPrice && currentSwapPrice[token0Address] > 0

  const normalizedPairDataWithCurrentSwapPrice =
    normalizedPairData?.length > 0 && hasSwapPrice
      ? [...normalizedPairData, { time: new Date(), value: currentSwapPrice[token0Address] }]
      : normalizedPairData

  const normalizedDerivedPairDataWithCurrentSwapPrice =
    normalizedDerivedPairData?.length > 0 && hasSwapPrice
      ? [...normalizedDerivedPairData, { time: new Date(), value: currentSwapPrice[token0Address] }]
      : normalizedDerivedPairData

  const hasNoDirectData = normalizedPairDataWithCurrentSwapPrice && normalizedPairDataWithCurrentSwapPrice?.length === 0
  const hasNoDerivedData =
    normalizedDerivedPairDataWithCurrentSwapPrice && normalizedDerivedPairDataWithCurrentSwapPrice?.length === 0

  // undefined is used for loading
  let pairPrices = hasNoDirectData && hasNoDerivedData ? [] : undefined
  if (normalizedPairDataWithCurrentSwapPrice && normalizedPairDataWithCurrentSwapPrice?.length > 0) {
    pairPrices = normalizedPairDataWithCurrentSwapPrice
  } else if (
    normalizedDerivedPairDataWithCurrentSwapPrice &&
    normalizedDerivedPairDataWithCurrentSwapPrice?.length > 0
  ) {
    pairPrices = normalizedDerivedPairDataWithCurrentSwapPrice
  }
  return { pairPrices, pairId }
}

export const useLPApr = (pair?: Pair) => {
  const { data: poolData } = useSWRImmutable(
    pair && pair.chainId === ChainId.BSC ? ['LP7dApr', pair.liquidityToken.address] : null,
    async () => {
      const timestampsArray = getDeltaTimestamps()
      const blocks = await getBlocksFromTimestamps(timestampsArray, 'desc', 1000)
      const [block24h, block48h, block7d, block14d] = blocks ?? []
      const lowerCasedAddress = pair.liquidityToken.address.toLowerCase()
      const { error, data } = await fetchPoolData(block24h.number, block48h.number, block7d.number, block14d.number, [
        lowerCasedAddress,
      ])
      if (error) return null
      const current = parseFloat(data?.now[0]?.volumeUSD)
      const currentReserveUSD = parseFloat(data?.now[0]?.reserveUSD)
      const oneDay = parseFloat(data?.oneDayAgo[0]?.volumeUSD)
      const twoDays = parseFloat(data?.twoDaysAgo[0]?.volumeUSD)
      const week = parseFloat(data?.oneWeekAgo[0]?.volumeUSD)
      const twoWeeks = parseFloat(data?.twoWeeksAgo[0]?.volumeUSD)
      const [volumeUSD] = getChangeForPeriod(current, oneDay, twoDays)
      const [volumeUSDWeek] = getChangeForPeriod(current, week, twoWeeks)
      const liquidityUSD = currentReserveUSD || 0
      const { lpApr7d } = getLpFeesAndApr(volumeUSD, volumeUSDWeek, liquidityUSD)
      return lpApr7d ? { lpApr7d } : null
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  )

  return poolData
}
