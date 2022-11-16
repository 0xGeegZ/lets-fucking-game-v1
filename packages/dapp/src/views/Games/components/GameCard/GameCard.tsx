import { useTranslation } from '@pancakeswap/localization'
import { Card, Flex, Skeleton, Text, RocketIcon, Heading } from '@pancakeswap/uikit'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { WBNB } from '@pancakeswap/sdk'
import { DeserializedGame } from 'state/types'
import cronstrue from 'cronstrue'
import Tooltip from '../GameCardButtons/Tooltip'
import CardPlayerSection from './CardPlayerSection'
import CardHeadingSection from './CardHeadingSection'

import DetailsSection from './DetailsSection'
import CardContentSection from './CardContentSection'

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

const BulletList = styled.ul`
  list-style-type: none;
  margin-left: 8px;
  padding: 0;
  li {
    margin: 0;
    padding: 0;
  }
  li::before {
    content: '•';
    margin-right: 4px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  li::marker {
    font-size: 12px;
  }
`

const Container = styled.div`
  margin-right: 4px;
`

interface GameCardProps {
  game: DeserializedGame
  account?: string
}

const GameCard: React.FC<React.PropsWithChildren<GameCardProps>> = ({ game, account }) => {
  const { chainId } = useActiveWeb3React()

  const [showExpandableSection, setShowExpandableSection] = useState(false)
  const [cronHumanReadable, setCronHumanReadable] = useState('')

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
    prizes,
    userData: {
      isCreator,
      isAdmin,
      isPlaying,
      wonAmount,
      nextFromRange,
      nextToRange,
      isWonLastGames,
      isCanVoteSplitPot,
      isInTimeRange,
    },
    // TODO GUIGUI USE playerData
    playerData: {
      playerAddress,
      roundRangeLowerLimit,
      roundRangeUpperLimit,
      hasPlayedRound,
      roundCount,
      position,
      hasLost,
      isSplitOk,
    },
  } = game

  const isPromotedGame = true

  const toggleExpandableSection = useCallback(() => {
    setShowExpandableSection((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!encodedCron) return

    try {
      const transform = cronstrue.toString(encodedCron, {
        use24HourTimeFormat: false,
      })
      setCronHumanReadable(transform)
    } catch (e) {
      setCronHumanReadable('')
    }
  }, [encodedCron])

  // TODO GUIGUI isReady is when userData are loaded ??
  const isReady = game !== undefined

  // TODO GUIGUI use RoundProgress to display a progressBar if i
  return (
    <StyledCard isActive={isPromotedGame}>
      <GameCardInnerContainer>
        <CardHeadingSection
          id={id}
          name={name}
          token={WBNB[chainId]}
          prizepool={prizepool}
          multiplier={registrationAmount.toNumber() !== 0 ? prizepool.dividedBy(registrationAmount) : null}
          isReady={isReady}
          isFree={registrationAmount.toNumber() === 0}
          boosted={false}
        />

        <CardContentSection
          registrationAmount={registrationAmount}
          prizepool={prizepool}
          maxPlayers={maxPlayers}
          playerAddressesCount={playerAddressesCount}
          cronHumanReadable={cronHumanReadable}
          isInProgress={isInProgress}
          isReady={isReady}
          prizes={prizes}
        />

        <CardPlayerSection
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
          isAdmin={isAdmin}
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
