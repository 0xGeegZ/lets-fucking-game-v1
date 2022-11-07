import { useEffect, useCallback, useState, useMemo, useRef, createContext } from 'react'
import { createPortal } from 'react-dom'
import BigNumber from 'bignumber.js'
import { ChainId } from '@pancakeswap/sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useWeb3React } from '@pancakeswap/wagmi'
import { Image, Heading, Toggle, Text, Button, ArrowForwardIcon, Flex, Link, Box } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from 'components/NextLink'
import styled from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { useGames, usePollGamesWithUserData, usePriceCakeBusd } from 'state/games/hooks'
import { useCakeVaultUserData } from 'state/pools/hooks'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { DeserializedGame } from 'state/types'
import { useTranslation } from '@pancakeswap/localization'
import { getFarmApr } from 'utils/apr'
import orderBy from 'lodash/orderBy'
import { latinise } from 'utils/latinise'
import { useUserFarmStakedOnly, useUserFarmsViewMode } from 'state/user/hooks'
import { ViewMode } from 'state/user/actions'
import { useRouter } from 'next/router'
import PageHeader from 'components/PageHeader'
import SearchInput from 'components/SearchInput'
import Select, { OptionProps } from 'components/Select/Select'
import Loading from 'components/Loading'
import ToggleView from 'components/ToggleView/ToggleView'
import ScrollToTopButton from 'components/ScrollToTopButton/ScrollToTopButtonV2'
import Table from './components/GameTable/GameTable'
import GameTabButtons from './components/GameTabButtons'
import { GameWithStakedValue } from './components/types'
import { BCakeBoosterCard } from './components/BCakeBoosterCard'

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

const StyledImage = styled(Image)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 58px;
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

const NUMBER_OF_FARMS_VISIBLE = 12

const Games: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname, query: urlQuery } = useRouter()
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()
  // TODO GUIGUI update hook
  const { data: games, userDataLoaded } = useGames()

  const cakePrice = usePriceCakeBusd()

  const [_query, setQuery] = useState('')
  const normalizedUrlSearch = useMemo(() => (typeof urlQuery?.search === 'string' ? urlQuery.search : ''), [urlQuery])
  const query = normalizedUrlSearch && !_query ? normalizedUrlSearch : _query

  const [viewMode, setViewMode] = useUserFarmsViewMode()
  const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenGamesLength = useRef(0)

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived

  // useCakeVaultUserData()

  usePollGamesWithUserData()

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)
  const [boostedOnly, setBoostedOnly] = useState(false)

  const activeGames = games.filter((game) => !game.contractPaused)
  const inactiveGames = games.filter((game) => game.contractPaused)
  const archivedGames = games

  const stakedOnlyGames = activeGames.filter(
    (game) =>
      game.userData &&
      (new BigNumber(game.userData.stakedBalance).isGreaterThan(0) ||
        new BigNumber(game.userData.proxy?.stakedBalance).isGreaterThan(0)),
  )

  const stakedInactiveGames = inactiveGames.filter(
    (game) =>
      game.userData &&
      (new BigNumber(game.userData.stakedBalance).isGreaterThan(0) ||
        new BigNumber(game.userData.proxy?.stakedBalance).isGreaterThan(0)),
  )

  const stakedArchivedGames = archivedGames.filter(
    (game) =>
      game.userData &&
      (new BigNumber(game.userData.stakedBalance).isGreaterThan(0) ||
        new BigNumber(game.userData.proxy?.stakedBalance).isGreaterThan(0)),
  )

  // TODO update farmList with GameList
  // TODO GUIGUI UPDATE GameWithStakedValue INTERFACE TO GAME INTERFACE
  const farmsList = useCallback(
    (farmsToDisplay: DeserializedGame[]): GameWithStakedValue[] => {
      let farmsToDisplayWithAPR: GameWithStakedValue[] = farmsToDisplay.map((game) => {
        return game
        // if (!game.lpTotalInQuoteToken || !game.quoteTokenPriceBusd) {
        //   return game
        // }

        // const totalLiquidity = new BigNumber(game.lpTotalInQuoteToken).times(game.quoteTokenPriceBusd)
        // const { cakeRewardsApr, lpRewardsApr } = isActive
        //   ? getFarmApr(
        //       chainId,
        //       new BigNumber(game.poolWeight),
        //       cakePrice,
        //       totalLiquidity,
        //       game.lpAddress,
        //       regularCakePerBlock,
        //     )
        //   : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        // return { ...game, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((game: GameWithStakedValue) => {
          return latinise(game.gameName.toLowerCase()).includes(lowercaseQuery)
        })
      }

      return farmsToDisplayWithAPR
    },
    [query],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const [numberOfGamesVisible, setNumberOfGamesVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const chosenGames = useMemo(() => {
    let chosenFs = []
    if (isActive) {
      chosenFs = stakedOnly ? farmsList(stakedOnlyGames) : farmsList(activeGames)
    }
    if (isInactive) {
      chosenFs = stakedOnly ? farmsList(stakedInactiveGames) : farmsList(inactiveGames)
    }
    if (isArchived) {
      chosenFs = stakedOnly ? farmsList(stakedArchivedGames) : farmsList(archivedGames)
    }

    if (boostedOnly) {
      chosenFs = chosenFs.filter((f) => f.boosted)
    }

    return chosenFs
  }, [
    activeGames,
    farmsList,
    inactiveGames,
    archivedGames,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedGames,
    stakedInactiveGames,
    stakedOnly,
    stakedOnlyGames,
    boostedOnly,
  ])

  const chosenGamesMemoized = useMemo(() => {
    const sortGames = (gamesToSort: GameWithStakedValue[]): GameWithStakedValue[] => {
      switch (sortOption) {
        case 'apr':
          return orderBy(gamesToSort, (game: GameWithStakedValue) => game.apr + game.lpRewardsApr, 'desc')
        case 'multiplier':
          return orderBy(
            gamesToSort,
            (game: GameWithStakedValue) => (game.registrationAmount ? Number(game.registrationAmount) : 0),
            'desc',
          )
        case 'earned':
          return orderBy(
            gamesToSort,
            (game: GameWithStakedValue) => (game.userData ? Number(game.userData.earnings) : 0),
            'desc',
          )
        case 'liquidity':
          return orderBy(gamesToSort, (game: GameWithStakedValue) => Number(game.liquidity), 'desc')
        case 'latest':
          return orderBy(gamesToSort, (game: GameWithStakedValue) => Number(game.roundId), 'desc')
        default:
          return gamesToSort
      }
    }

    return sortGames(chosenGames).slice(0, numberOfGamesVisible)
  }, [chosenGames, sortOption, numberOfGamesVisible])

  chosenGamesLength.current = chosenGamesMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfGamesVisible((farmsCurrentlyVisible) => {
        if (farmsCurrentlyVisible <= chosenGamesLength.current) {
          return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
        }
        return farmsCurrentlyVisible
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
              {t('Stake LP tokens to earn.')}
            </GameH2>
            <NextLinkFromReactRouter to="/games/auction" prefetch={false}>
              <Button p="0" variant="text">
                <Text color="primary" bold fontSize="16px" mr="4px">
                  {t('Community Auctions')}
                </Text>
                <ArrowForwardIcon color="primary" />
              </Button>
            </NextLinkFromReactRouter>
          </Box>
          {chainId === ChainId.BSC && (
            <Box>
              <BCakeBoosterCard />
            </Box>
          )}
        </GameFlexWrapper>
      </PageHeader>
      <Page>
        <ControlContainer>
          <ViewControls>
            {/* <ToggleView idPrefix="clickGame" viewMode={viewMode} onToggle={setViewMode} /> */}
            <ToggleWrapper>
              <Toggle
                id="staked-only-farms"
                checked={stakedOnly}
                onChange={() => setStakedOnly(!stakedOnly)}
                scale="sm"
              />
              <Text> {t('Not full only')}</Text>
            </ToggleWrapper>
            <ToggleWrapper>
              <Toggle
                id="staked-only-farms"
                checked={boostedOnly}
                onChange={() => setBoostedOnly((prev) => !prev)}
                scale="sm"
              />
              <Text> {t('Booster Available')}</Text>
            </ToggleWrapper>
            <GameTabButtons hasStakeInFinishedGames={stakedInactiveGames.length > 0} />
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
        {isInactive && (
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
                href="https://v1-farms.pancakeswap.finance/games/history"
              >
                {t('check out v1 farms')}.
              </FinishedTextLink>
            </Flex>
          </FinishedTextContainer>
        )}
        {viewMode === ViewMode.TABLE ? (
          <Table farms={chosenGamesMemoized} cakePrice={cakePrice} userDataReady={userDataReady} />
        ) : (
          <FlexLayout>{children}</FlexLayout>
        )}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        {userDataLoaded && <div ref={observerRef} />}
        <StyledImage src="/images/decorations/3dpan.png" alt="Pancake illustration" width={120} height={103} />
      </Page>
      {createPortal(<ScrollToTopButton />, document.body)}
    </GamesContext.Provider>
  )
}

export const GamesContext = createContext({ chosenGamesMemoized: [] })

export default Games