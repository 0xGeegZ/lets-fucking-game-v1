import { useState, useMemo } from 'react'
import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { GamesPageLayout } from 'views/Games'
import { useWeb3React } from '@pancakeswap/wagmi'
import GameCard from 'views/Games/components/GameCard/GameCard'

import { useGames } from 'state/games/hooks'
import Loading from 'components/Loading'

import { useTranslation } from '@pancakeswap/localization'

import { Heading, Flex, Box, Text } from '@pancakeswap/uikit'
import FlexLayout from 'components/Layout/Flex'

const NUMBER_OF_GAMES_VISIBLE = 6

const GamesPage = () => {
  const { t } = useTranslation()

  const { account } = useWeb3React()

  const { data: gamesLP, userDataLoaded } = useGames()
  const [numberOfGamesVisible] = useState(NUMBER_OF_GAMES_VISIBLE)

  const activeGames = gamesLP.filter((game) => !game.isDeleted)

  const chosenGamesMemoized = useMemo(() => {
    return activeGames.slice(0, numberOfGamesVisible)
  }, [activeGames, numberOfGamesVisible])

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
          <GameCard key={game.id.toNumber()} game={game} account={account} />
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
