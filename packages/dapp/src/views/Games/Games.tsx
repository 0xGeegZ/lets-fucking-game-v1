import { useEffect, useCallback, useState, useMemo, useRef, createContext } from 'react'
import { createPortal } from 'react-dom'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useWeb3React } from '@pancakeswap/wagmi'
import { Image, Heading, Toggle, Text, Button, ArrowForwardIcon, Flex, Link, Box } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from 'components/NextLink'
import styled from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { useGames, usePollGamesWithUserData, usePriceCakeBusd } from 'state/games/hooks'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { DeserializedGame } from 'state/types'
import { useTranslation } from '@pancakeswap/localization'
import orderBy from 'lodash/orderBy'
import { useUserGamesViewMode } from 'state/user/hooks'
import { useRouter } from 'next/router'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import Loading from 'components/Loading'
import ScrollToTopButton from 'components/ScrollToTopButton/ScrollToTopButtonV2'
import { latinise } from 'utils/latinise'
import GameTabButtons from './components/GameTabButtons'
import { CreateGameCard } from './components/CreateGameCard'

const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
  }
`
const GameFlexWrapper = styled(Flex)`
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-wrap: nowrap;
  }
`
const GameH1 = styled(Heading)`
  font-size: 32px;
  margin-bottom: 8px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 64px;
    margin-bottom: 24px;
  }
`
const GameH2 = styled(Heading)`
  font-size: 16px;
  margin-bottom: 8px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 24px;
    margin-bottom: 18px;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`

const NUMBER_OF_GAMES_VISIBLE = 12

const Games: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname, query: urlQuery } = useRouter()
  const { t } = useTranslation()
  // TODO GUIGUI update hook
  const { data: games, userDataLoaded } = useGames()

  const [_query, setQuery] = useState('')
  const normalizedUrlSearch = useMemo(() => (typeof urlQuery?.search === 'string' ? urlQuery.search : ''), [urlQuery])
  const query = normalizedUrlSearch && !_query ? normalizedUrlSearch : _query

  //   const [viewMode, setViewMode] = useUserGamesViewMode()

  //   const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenGamesLength = useRef(0)

  const isDeleted = pathname.includes('archived')
  const isPlayingOnly = pathname.includes('history')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isDeleted

  // TODO GUIGUI get used Data
  usePollGamesWithUserData()

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  //   const userDataReady = !account || (!!account && userDataLoaded)

  // TODO GUIGUI FIRST HANDLE FILTERS
  const [isNotFullOnly, setStakedOnly] = useState(isActive)
  const [boostedOnly, setBoostedOnly] = useState(false)

  const activeGames = games.filter((game) => !game.isDeleted /* && game.isInProgress */)
  const inactiveGames = games.filter((game) => !game.isInProgress)

  const playingOnlyGames = games.filter((game) => game.userData && game.userData.isPlaying)

  const deletedGames = games.filter((game) => game.isDeleted)

  // const archivedGames = archivedGames.filter((game) => game.userData && false)

  // TODO update gameList with GameList
  // TODO GUIGUI UPDATE GameWithStakedValue INTERFACE TO GAME INTERFACE
  const gamesList = useCallback(
    (gamesToDisplay: DeserializedGame[]): DeserializedGame[] => {
      let gamesToDisplayWithAPR: DeserializedGame[] = gamesToDisplay.map((game) => {
        return game
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        gamesToDisplayWithAPR = gamesToDisplayWithAPR.filter((game: DeserializedGame) => {
          return latinise(game.name.toLowerCase()).includes(lowercaseQuery)
        })
      }

      return gamesToDisplayWithAPR
    },
    [query],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const [numberOfGamesVisible, setNumberOfGamesVisible] = useState(NUMBER_OF_GAMES_VISIBLE)

  const chosenGames = useMemo(() => {
    let chosenFs = []

    if (isActive) {
      chosenFs = gamesList(activeGames)
    }
    if (isInactive) {
      chosenFs = gamesList(inactiveGames)
    }
    if (isDeleted) {
      chosenFs = gamesList(deletedGames)
    }
    if (isPlayingOnly) {
      chosenFs = gamesList(playingOnlyGames)
    }

    if (boostedOnly) {
      chosenFs = chosenFs.filter((f) => f.boosted)
    }

    return chosenFs
  }, [
    isActive,
    isInactive,
    isDeleted,
    isPlayingOnly,
    boostedOnly,
    gamesList,
    activeGames,
    inactiveGames,
    deletedGames,
    playingOnlyGames,
  ])

  const chosenGamesMemoized = useMemo(() => {
    const sortGames = (gamesToSort: DeserializedGame[]): DeserializedGame[] => {
      switch (sortOption) {
        case 'hot':
          return orderBy(gamesToSort, (game: DeserializedGame) => game.playerAddressesCount, 'desc')
        case 'amount':
          return orderBy(
            gamesToSort,
            (game: DeserializedGame) => (game.registrationAmount ? Number(game.registrationAmount) : 0),
            'desc',
          )
        case 'earned':
          return orderBy(
            gamesToSort,
            (game: DeserializedGame) => (game.userData ? Number(game.userData.wonAmount) : 0),
            'desc',
          )
        case 'playing':
          return orderBy(gamesToSort, (game: DeserializedGame) => Number(game.userData.isPlaying), 'desc')
        case 'latest':
          return orderBy(gamesToSort, (game: DeserializedGame) => Number(game.roundId), 'desc')
        default:
          return gamesToSort
      }
    }

    return sortGames(chosenGames).slice(0, numberOfGamesVisible)
  }, [chosenGames, sortOption, numberOfGamesVisible])

  chosenGamesLength.current = chosenGamesMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfGamesVisible((gamesCurrentlyVisible) => {
        if (gamesCurrentlyVisible <= chosenGamesLength.current) {
          return gamesCurrentlyVisible + NUMBER_OF_GAMES_VISIBLE
        }
        return gamesCurrentlyVisible
      })
    }
  }, [isIntersecting])

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  return (
    <GamesContext.Provider value={{ chosenGamesMemoized }}>
      <PageHeader>
        <GameFlexWrapper justifyContent="space-between">
          <Box>
            <GameH1 as="h1" scale="xxl" color="secondary" mb="24px">
              {t('Games')}
            </GameH1>
            <GameH2 scale="lg" color="text">
              {t('Register to a game to start playing.')}
            </GameH2>
            {/* <NextLinkFromReactRouter to="/games/my-games" prefetch={false}> */}
            <NextLinkFromReactRouter to="#" prefetch={false}>
              <Button variant="text" disabled>
                <Text color="primary" bold fontSize="16px" mr="4px">
                  {t('My Games')}
                </Text>
                <ArrowForwardIcon color="primary" />
              </Button>
            </NextLinkFromReactRouter>
          </Box>
          {/* {chainId === ChainId.BSC && ( */}
          <Box>
            <CreateGameCard />
          </Box>
          {/* )} */}
        </GameFlexWrapper>
      </PageHeader>
      <Page>
        <ControlContainer>
          <ViewControls>
            {/* <ToggleView idPrefix="clickGame" viewMode={viewMode} onToggle={setViewMode} /> */}
            <ToggleWrapper>
              <Toggle
                id="staked-only-games"
                checked={isNotFullOnly}
                onChange={() => setStakedOnly(!isNotFullOnly)}
                scale="sm"
              />
              <Text> {t('Not full only')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle
                id="staked-only-games"
                checked={boostedOnly}
                onChange={() => setBoostedOnly((prev) => !prev)}
                scale="sm"
              />
              <Text> {t('Booster Available')}</Text>
            </ToggleWrapper>
            <GameTabButtons hasStakeInFinishedGames={deletedGames.length > 0} />
          </ViewControls>
          <FilterContainer>
            <LabelWrapper>
              <Text textTransform="uppercase">{t('Sort by')}</Text>
              <Select
                options={[
                  {
                    label: t('Hot'),
                    value: 'hot',
                  },
                  {
                    label: t('Prize'),
                    value: 'prize',
                  },
                  {
                    label: t('Players'),
                    value: 'players',
                  },
                  {
                    label: t('Latest'),
                    value: 'latest',
                  },
                ]}
                onOptionChange={handleSortOptionChange}
              />
            </LabelWrapper>
            <LabelWrapper style={{ marginLeft: 16 }}>
              <Text textTransform="uppercase">{t('Search')}</Text>
              <SearchInput initialValue={normalizedUrlSearch} onChange={handleChangeQuery} placeholder="Search Games" />
            </LabelWrapper>
          </FilterContainer>
        </ControlContainer>
        {/* {isInactive && (
          <FinishedTextContainer>
            <Text fontSize={['16px', null, '20px']} color="failure" pr="4px">
              {t("Don't see the game you are staking?")}
            </Text>
            <Flex>
              <FinishedTextLink href="/migration" fontSize={['16px', null, '20px']} color="failure">
                {t('Go to migration page')}
              </FinishedTextLink>
              <Text fontSize={['16px', null, '20px']} color="failure" padding="0px 4px">
                or
              </Text>
              <FinishedTextLink
                external
                color="failure"
                fontSize={['16px', null, '20px']}
                href="https://v1-games.pancakeswap.finance/games/history"
              >
                {t('check out v1 games')}.
              </FinishedTextLink>
            </Flex>
          </FinishedTextContainer>
        )} */}
        {/* {viewMode === ViewMode.TABLE ? (
          <Table games={chosenGamesMemoized} cakePrice={cakePrice} userDataReady={userDataReady} />
        ) : ( */}
        <FlexLayout>{children}</FlexLayout>
        {/* )} */}

        {/* // TODO GUIGUI UPDATE CONDITION */}
        {/* {account && !userDataLoaded && ( */}
        {!games && (
          <Flex justifyContent="center">
            <Loading />
            {/* <StyledImage src="/images/decorations/3dpan.png" alt="Pancake illustration" width={120} height={103} /> */}
          </Flex>
        )}

        {userDataLoaded && <div ref={observerRef} />}
      </Page>
      {createPortal(<ScrollToTopButton />, document.body)}
    </GamesContext.Provider>
  )
}

export const GamesContext = createContext({ chosenGamesMemoized: [] })

export default Games
