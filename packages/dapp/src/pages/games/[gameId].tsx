import { useState, useCallback } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'

import { Box, Card, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'

import { useRouter } from 'next/router'
import { useTranslation } from '@pancakeswap/localization'

import styled from 'styled-components'
import PageSection from 'components/PageSection'
import useTheme from 'hooks/useTheme'

import { SUPPORT_GAMES } from 'config/constants/supportChains'

import TopTradersCard from 'views/Game/components/TeamRanks/TopTradersCard'
import EasterPrizesCard from 'views/Game/easter/components/PrizesInfo/EasterPrizesCard'

import PotTab from 'views/Game/components/Pot/PotTab'
import Deposit from 'views/Game/components/Pot/Deposit'
import Claim from 'views/Game/components/Pot/Claim'
import CardHeader from 'views/Game/components/Pot/CardHeader'

import { POT_CATEGORY } from 'views/Game/types'

import { useTeamInformation } from 'views/Game/useTeamInformation'

const Wrapper = styled(Flex)`
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const LeftPartWrapper = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;

  ${({ theme }) => theme.mediaQueries.md} {
    flex: 1;
    margin-right: 40px;
    margin-bottom: 0;
  }
`

const RightPartWrapper = styled(Flex)`
  width: 100%;

  ${({ theme }) => theme.mediaQueries.md} {
    flex: 2;
  }
`

const PotImage = styled.div`
  width: 260px;
  height: 228.77px;
  align-self: center;
  background: url(/images/pottery/honeypot.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  margin-top: 48px;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 412px;
    height: 362.52px;
    margin-top: 0;
  }
`

const GamePage = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const { pathname } = useRouter()
  const { account } = useWeb3React()

  const { isMobile } = useMatchBreakpoints()

  const [activeTab, setIndex] = useState<POT_CATEGORY>(POT_CATEGORY.Deposit)
  const handleClick = useCallback((tabType: POT_CATEGORY) => setIndex(tabType), [])

  const {
    globalLeaderboardInformation,
    team1LeaderboardInformation,
    team2LeaderboardInformation,
    team3LeaderboardInformation,
  } = useTeamInformation(1)

  const isTeamLeaderboardDataComplete = Boolean(
    team1LeaderboardInformation.leaderboardData &&
      team2LeaderboardInformation.leaderboardData &&
      team3LeaderboardInformation.leaderboardData,
  )

  const isGlobalLeaderboardDataComplete = Boolean(isTeamLeaderboardDataComplete && globalLeaderboardInformation)

  return (
    <>
      <PageSection index={2}>
        <Wrapper>
          <LeftPartWrapper>
            <Flex justifyContent="space-between" flexDirection={['column', 'column', 'column', 'column', 'row']}>
              <Flex mt="48px" alignItems="flex-start">
                <Card style={{ width: isMobile ? '100%' : '436px' }}>
                  <PotTab onItemClick={handleClick} activeIndex={activeTab} />
                  <Box>
                    <CardHeader
                      title={t('Pottery')}
                      subTitle={t('Stake CAKE, Earn CAKE, Win CAKE')}
                      primarySrc="/images/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.svg"
                      secondarySrc="/images/tokens/pot-icon.svg"
                    />
                    {activeTab === POT_CATEGORY.Deposit ? <Deposit /> : <Claim />}
                  </Box>
                </Card>
              </Flex>
            </Flex>
          </LeftPartWrapper>
          <RightPartWrapper>
            <TopTradersCard
              team1LeaderboardInformation={team1LeaderboardInformation}
              team2LeaderboardInformation={team2LeaderboardInformation}
              team3LeaderboardInformation={team3LeaderboardInformation}
              globalLeaderboardInformation={globalLeaderboardInformation}
              isGlobalLeaderboardDataComplete={isGlobalLeaderboardDataComplete}
            />
          </RightPartWrapper>
        </Wrapper>
        <Wrapper>
          <LeftPartWrapper>Left Part</LeftPartWrapper>
          <RightPartWrapper>
            <EasterPrizesCard />
          </RightPartWrapper>
        </Wrapper>
      </PageSection>
    </>
  )
}

// GamePage.Layout = GamesPageLayout

GamePage.chains = SUPPORT_GAMES

export default GamePage
