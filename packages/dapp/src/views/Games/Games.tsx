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
import { sortGamesDefault } from 'utils/sortGames'
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
const FinishedTextContainer = styled(Flex)`
  padding-bottom: 32px;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`
const FinishedTextLink = styled(Link)`
  font-weight: 400;
  white-space: nowrap;
  text-decoration: underline;
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
  const [sortOption, setSortOption] = useState('playing')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenGamesLength = useRef(0)

  const isMyGames = pathname.includes('my-games')
  const isDeleted = pathname.includes('history')
  const isActive = !isDeleted

  usePollGamesWithUserData()

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  //   const userDataReady = !account || (!!account && userDataLoaded)

  // TODO GUIGUI FIRST HANDLE FILTERS
  const [isNotFullOnly, setNotFullOnly] = useState(false)
  const [myPlayingGamesOnly, setMyPlayingGamesOnly] = useState(false)

  const activeGames = games
    .filter((game) => (!isMyGames ? !game.isPaused && !game.isDeleted : !game.isDeleted))
    .sort(sortGamesDefault)

  const notFullGames = games.filter(
    (game) => !game.isInProgress && game.maxPlayers.toNumber() !== game.playerAddressesCount.toNumber(),
  )

  const playingOnlyGames = games.filter((game) => game.userData && game.userData.isPlaying)

  const mineOnlyGames = games.filter((game) => game.userData && game.userData.isCreator && !game.isPaused)

  const deletedGames = games.filter((game) => game.isDeleted || game.isPaused)

  const myDeletedGames = games.filter(
    (game) => game.isDeleted || (game.isPaused && game.userData && game.userData.isCreator),
  )

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

    if (isDeleted) {
      if (isMyGames) chosenFs = gamesList(myDeletedGames)
      else chosenFs = gamesList(deletedGames)
    }

    if (isNotFullOnly) {
      chosenFs = gamesList(notFullGames)
    }

    if (myPlayingGamesOnly) {
      chosenFs = gamesList(playingOnlyGames)
    }

    if (isMyGames) {
      chosenFs = gamesList(mineOnlyGames)
    }

    return chosenFs.sort(sortGamesDefault)
  }, [
    isActive,
    isDeleted,
    isMyGames,
    isNotFullOnly,
    myPlayingGamesOnly,
    gamesList,
    activeGames,
    myDeletedGames,
    deletedGames,
    notFullGames,
    playingOnlyGames,
    mineOnlyGames,
  ])

  const chosenGamesMemoized = useMemo(() => {
    const sortGames = (gamesToSort: DeserializedGame[]): DeserializedGame[] => {
      switch (sortOption) {
        case 'players':
          return orderBy(gamesToSort, (game: DeserializedGame) => game.playerAddressesCount, 'desc')
        case 'prize':
          return orderBy(
            gamesToSort,
            (game: DeserializedGame) => (game.registrationAmount ? Number(game.registrationAmount) : 0),
            'desc',
          )
        case 'playing':
          return orderBy(gamesToSort, (game: DeserializedGame) => Number(game.userData.isPlaying), 'desc')
        case 'latest':
          return orderBy(gamesToSort, (game: DeserializedGame) => Number(game.id), 'desc')
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
              {isMyGames ? t('My Games') : t('Games')}
            </GameH1>
            <GameH2 scale="lg" color="text">
              {t('Register to a game to start playing.')}
            </GameH2>
            {isMyGames ? (
              <NextLinkFromReactRouter to="/games" prefetch={false}>
                <Button variant="secondary">
                  <Text color="primary" bold fontSize="16px" mr="4px">
                    {t('All Games')}
                  </Text>
                  <ArrowForwardIcon color="primary" />
                </Button>
              </NextLinkFromReactRouter>
            ) : (
              <NextLinkFromReactRouter to="/games/my-games" prefetch={false}>
                <Button variant="secondary">
                  <Text color="primary" bold fontSize="16px" mr="4px">
                    {t('My Created Games')}
                  </Text>
                  <ArrowForwardIcon color="primary" />
                </Button>
              </NextLinkFromReactRouter>
            )}
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
                id="my-games-only"
                checked={myPlayingGamesOnly}
                onChange={() => setMyPlayingGamesOnly((prev) => !prev)}
                scale="sm"
              />
              <Text> {t('Playing only')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle
                id="not-full-games"
                checked={isNotFullOnly}
                onChange={() => setNotFullOnly(!isNotFullOnly)}
                scale="sm"
              />
              <Text> {t('Registering only')}</Text>
            </ToggleWrapper>
            <GameTabButtons hasStakeInFinishedGames={myDeletedGames.length > 0 && isMyGames} />
          </ViewControls>
          <FilterContainer>
            <LabelWrapper>
              <Text textTransform="uppercase">{t('Sort by')}</Text>
              <Select
                options={[
                  {
                    label: t('Playing'),
                    value: 'playing',
                  },
                  {
                    label: t('Players'),
                    value: 'players',
                  },
                  {
                    label: t('Prize'),
                    value: 'prize',
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

        {/* {viewMode === ViewMode.TABLE ? (
          <Table games={chosenGamesMemoized} cakePrice={cakePrice} userDataReady={userDataReady} />
        ) : ( */}
        <FlexLayout>{children}</FlexLayout>
        {/* )} */}

        {!chosenGamesMemoized.length && isMyGames && (
          <FinishedTextContainer>
            <Text fontSize={['16px', null, '20px']} color="failure" pr="4px">
              {t("You haven't created any games yet")}
            </Text>
            <Flex>
              <FinishedTextLink href="/game/create" fontSize={['16px', null, '20px']} color="failure">
                {t('Create a new game')}
              </FinishedTextLink>
            </Flex>
          </FinishedTextContainer>
        )}
        {!chosenGamesMemoized.length && !userDataLoaded && (
          <Flex justifyContent="center">
            <Loading />
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
