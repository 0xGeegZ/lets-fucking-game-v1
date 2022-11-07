import { useEffect, useCallback, useState, useMemo, useRef, createContext, useContext } from 'react'
import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { GamesPageLayout, GamesContext } from 'views/Games'
import GamCard from 'views/Games/components/GameCard/GameCard'
import { getDisplayApr } from 'views/Games/components/getDisplayApr'
import { useWeb3React } from '@pancakeswap/wagmi'

import { useGames, usePollGamesWithUserData, usePriceCakeBusd } from 'state/games/hooks'
import Loading from 'components/Loading'
import { getFarmApr } from 'utils/apr'
import BigNumber from 'bignumber.js'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTranslation } from '@pancakeswap/localization'

import { Image, Heading, Toggle, Text, Button, ArrowForwardIcon, Flex, Link, Box } from '@pancakeswap/uikit'
import { DeserializedGame } from 'state/types'
import { GameWithStakedValue } from 'views/Games/components/types'
import FlexLayout from 'components/Layout/Flex'

const NUMBER_OF_FARMS_VISIBLE = 6

const GamesPage = () => {
  const { t } = useTranslation()

  const { account } = useWeb3React()
  const cakePrice = usePriceCakeBusd()
  const { chainId } = useActiveWeb3React()

  const { data: gamesLP, userDataLoaded, poolLength, regularCakePerBlock } = useGames()
  const [numberOfGamesVisible, setNumberOfGamesVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const activeGames = gamesLP.filter(
    (game) => game.pid !== 0 && game.multiplier !== '0X' && (!poolLength || poolLength > game.pid),
  )

  const gamesList = useCallback(
    (gamesToDisplay: DeserializedGame[]): GameWithStakedValue[] => {
      const gamesToDisplayWithAPR: GameWithStakedValue[] = gamesToDisplay.map((game) => {
        if (!game.lpTotalInQuoteToken || !game.quoteTokenPriceBusd) {
          return game
        }

        const totalLiquidity = new BigNumber(game.lpTotalInQuoteToken).times(game.quoteTokenPriceBusd)
        const { cakeRewardsApr, lpRewardsApr } = getFarmApr(
          chainId,
          new BigNumber(game.poolWeight),
          cakePrice,
          totalLiquidity,
          game.lpAddress,
          regularCakePerBlock,
        )

        return { ...game, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      return gamesToDisplayWithAPR
    },
    [cakePrice, chainId, regularCakePerBlock],
  )

  const chosenGamesMemoized = useMemo(() => {
    return gamesList(activeGames).slice(0, numberOfGamesVisible)
  }, [activeGames, gamesList, numberOfGamesVisible])

  return (
    <Box width="100%">
      <Flex mb="40px" alignItems="center" flexDirection="column">
        <Heading mb="24px" scale="xl" color="secondary">
          {t('Games')}
        </Heading>
        <Text textAlign="center">
          {t(
            'If the digits on your tickets match the winning numbers in the correct order, you win a portion of the prize pool.',
          )}
        </Text>
        <Text>{t('Simple as it!')}</Text>
      </Flex>
      <FlexLayout>
        {chosenGamesMemoized.map((game) => (
          <GamCard
            key={game.pid}
            game={game}
            displayApr={getDisplayApr(game.apr, game.lpRewardsApr)}
            cakePrice={cakePrice}
            account={account}
            removed={false}
          />
        ))}
        {account && !userDataLoaded && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
      </FlexLayout>
    </Box>
  )
}

GamesPage.Layout = GamesPageLayout

GamesPage.chains = SUPPORT_FARMS

export default GamesPage
