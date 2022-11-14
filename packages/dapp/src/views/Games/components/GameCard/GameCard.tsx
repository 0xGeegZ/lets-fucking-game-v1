import { useTranslation } from '@pancakeswap/localization'
import { Card, Flex, Skeleton, Text, RocketIcon, Heading } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { ChainId, WBNB } from '@pancakeswap/sdk'
import { DeserializedGame } from 'state/types'
import { formatEther } from '@ethersproject/units'
import CardActionsContainer from './CardActionsContainer'
import CardHeading from './CardHeading'
import DetailsSection from './DetailsSection'

const StyledCard = styled(Card)`
  align-self: baseline;
  max-width: 100%;
  margin: 0 0 24px 0;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 350px;
    margin: 0 12px 46px;
  }
`

const GameCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface GameCardProps {
  game: DeserializedGame
  account?: string
}

const GameCard: React.FC<React.PropsWithChildren<GameCardProps>> = ({ game, account }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const {
    name,
    roundId,
    id,
    isPaused,
    isInProgress,
    isDeleted,
    maxPlayers,
    playerAddressesCount,
    registrationAmount,
    gameCreationAmount,
    address,
    prizepool,
    encodedCron,
    creator,
    treasuryFee,
    creatorFee,
    userData: {
      isPlaying,
      isCreator,
      isAdmin,
      wonAmount,
      nextFromRange,
      nextToRange,
      isWonLastGames,
      isCanVoteSplitPot,
      isInTimeRange,
    },
  } = game

  // const name = 'Cake Game'
  // const isDeleted = false
  // const isPaused = false
  // const isInProgress = false

  // const roundId = new BigNumber('1')
  // const encodedCron = '0 18 * * *'
  // const id = new BigNumber('1')

  // const maxPlayers = new BigNumber('10')
  // const playerAddressesCount = new BigNumber('5')
  // const gameCreationAmount = new BigNumber('0.1')
  // const registrationAmount = new BigNumber('0.1')
  // const prizepool = registrationAmount.multipliedBy(maxPlayers)
  // const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

  // const isCreator = true
  // const isPlaying = false
  // const wonAmount = new BigNumber('1')
  // const nextFromRange = new BigNumber(new Date().getTime())
  // const nextToRange = new BigNumber(new Date().getTime())
  // const isWonLastGames = false
  // const isCanVoteSplitPot = false
  // const isInTimeRange = false

  const isPromotedGame = true

  const toggleExpandableSection = useCallback(() => {
    setShowExpandableSection((prev) => !prev)
  }, [])

  const isReady = game !== undefined

  return (
    <StyledCard isActive={isPromotedGame}>
      <GameCardInnerContainer>
        <CardHeading name={name} id={id} token={WBNB[chainId]} prizepool={prizepool} isReady={isReady} boosted />

        {!isDeleted && (
          <Flex justifyContent="space-between">
            <Heading mr="4px">{t('To earn')}: </Heading>
            {isReady ? (
              <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                <RocketIcon m="4px" color="success" />
                <Text bold color="success" fontSize={16}>
                  {t('Up to ')}
                  {prizepool.toNumber()}BNB
                </Text>
              </Text>
            ) : (
              <Skeleton height={24} width={80} />
            )}
          </Flex>
        )}

        <Flex justifyContent="space-between">
          <Heading mr="4px">{t('Players')}: </Heading>
          {isReady ? (
            <Text bold>
              {playerAddressesCount.toNumber()}/{maxPlayers.toNumber()}
            </Text>
          ) : (
            <Skeleton height={24} width={80} />
          )}
        </Flex>

        <CardActionsContainer
          address={address}
          roundId={roundId}
          isInProgress={isInProgress}
          wonAmount={wonAmount}
          nextFromRange={nextFromRange}
          nextToRange={nextToRange}
          encodedCron={encodedCron}
          isPlaying={isPlaying}
          isWonLastGames={isWonLastGames}
          isCanVoteSplitPot={isCanVoteSplitPot}
          isInTimeRange={isInTimeRange}
          gameCreationAmount={gameCreationAmount}
          registrationAmount={registrationAmount}
          isReady={isReady}
          isPaused={isPaused}
          isCreator={isCreator}
          account={account}
        />
      </GameCardInnerContainer>

      <ExpandingWrapper>
        <ExpandableSectionButton onClick={toggleExpandableSection} expanded={showExpandableSection} />
        {showExpandableSection && (
          <DetailsSection
            isReady={isReady}
            bscScanAddress={getBlockExploreLink(address, 'address', chainId)}
            treasuryFee={treasuryFee}
            creatorFee={creatorFee}
          />
        )}
      </ExpandingWrapper>
    </StyledCard>
  )
}

export default GameCard
