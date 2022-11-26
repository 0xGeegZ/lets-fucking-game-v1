import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading, Skeleton, Text, WarningIcon } from '@pancakeswap/uikit'
import cronstrue from 'cronstrue'

import BigNumber from 'bignumber.js'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import momentTz from 'moment-timezone'

import moment from 'moment'
import ClaimButton from '../GameCardButtons/ClaimButton'
import PlayButton from '../GameCardButtons/PlayButton'
import RegisterButton from '../GameCardButtons/RegisterButton'
import VoteSplitButton from '../GameCardButtons/VoteSplitButton'
import PauseButton from '../GameCardButtons/PauseButton'
import UnpauseButton from '../GameCardButtons/UnpauseButton'

const Container = styled.div`
  padding-top: 16px;
`

interface GameCardPlayerSectionProps {
  address: string
  roundId: BigNumber
  registrationAmount: BigNumber
  gameCreationAmount: BigNumber
  isInProgress: boolean
  isRegistering: boolean
  wonAmount: BigNumber
  nextFromRange: string
  nextToRange: string
  remainingPlayersCount: BigNumber
  playerAddressesCount: BigNumber
  encodedCron: string
  isPlaying: boolean
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  isReady: boolean
  isPaused: boolean
  isCreator: boolean
  isAdmin: boolean
  hasLost: boolean
  hasPlayedRound: boolean
  account?: string
}

const CardPlayerSection: React.FC<React.PropsWithChildren<GameCardPlayerSectionProps>> = ({
  address,
  roundId,
  registrationAmount,
  gameCreationAmount,
  isInProgress,
  isRegistering,
  wonAmount,
  nextFromRange,
  nextToRange,
  encodedCron,
  remainingPlayersCount,
  playerAddressesCount,
  isPlaying,
  isWonLastGames,
  isCanVoteSplitPot,
  isInTimeRange,
  isReady,
  isPaused,
  isCreator,
  isAdmin,
  hasLost,
  hasPlayedRound,
  account,
}) => {
  const {
    t,
    // currentLanguage: { locale },
  } = useTranslation()
  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  return (
    <Container>
      {isWonLastGames && (
        <>
          <Flex justifyContent="space-between">
            <Heading mr="4px">{t('Earned')}: </Heading>

            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              {isReady ? (
                <Text bold color="success" fontSize={16}>
                  {wonAmount.toNumber()} {chainSymbol}
                </Text>
              ) : (
                <Skeleton width={80} height={18} mb="4px" />
              )}
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Heading mr="4px" />
            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              {isReady ? (
                <ClaimButton address={address} roundId={roundId} />
              ) : (
                <Skeleton width={80} height={36} mb="4px" />
              )}
            </Text>
          </Flex>
        </>
      )}

      {isInProgress && isPlaying && false && (
        <Flex justifyContent="space-between">
          <Heading mr="4px">{`${t('Split pot')}:`}</Heading>
          {isReady ? (
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              <Text bold>
                {isReady ? (
                  <>
                    {0}/{remainingPlayersCount.toNumber()}
                  </>
                ) : (
                  <Skeleton width={80} height={36} mb="4px" />
                )}
              </Text>
            </Text>
          ) : (
            <Skeleton width="100%" height={18} mb="4px" />
          )}
        </Flex>
      )}

      {isInProgress && isPlaying && !hasLost && (
        <>
          <Flex justifyContent="space-between">
            <Heading mr="4px">{`${t('Next play time')}:`}</Heading>
            {isReady ? (
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <Text bold style={{ textAlign: 'right' }}>
                  {nextFromRange && nextToRange && (
                    <>
                      {moment(nextFromRange).isSame(moment(), 'day') ? 'Today' : 'Tomorrow'}
                      {' between '}
                      {moment(nextFromRange).format('hh:mm A')} and {moment(nextToRange).format('hh:mm A')}
                    </>
                  )}
                </Text>
              </Text>
            ) : (
              <Skeleton width="100%" height={18} mb="4px" />
            )}
          </Flex>

          {/* {(hasLost || (!isInTimeRange && moment().isAfter(moment(nextToRange)))) && ( */}
          {(hasLost || (moment().isAfter(moment(nextToRange)) && moment(nextFromRange).isSame(moment(), 'day'))) && (
            <Flex justifyContent="center" m="10px">
              <WarningIcon width="16px" color="failure" style={{ verticalAlign: 'middle' }} />
              <Heading mr="4px" color="failure">
                {t('You Loose')}
              </Heading>
              <WarningIcon width="16px" color="failure" style={{ verticalAlign: 'middle' }} />
            </Flex>
          )}
        </>
      )}

      {/* TODO ADD CONDITION IF ACCOUNT IS GAME CREATOR. If true, display play and pause button */}
      {!account ? (
        <ConnectWalletButton mt="8px" width="100%" />
      ) : (
        <>
          {(isInProgress || !isRegistering) && (
            <PlayButton
              address={address}
              isInTimeRange={isInTimeRange}
              isDisabled={!isPlaying || isCreator || isAdmin || isPaused || hasPlayedRound}
            />
          )}
          {isRegistering && (
            <RegisterButton
              address={address}
              registrationAmount={registrationAmount}
              isDisabled={isPlaying || isCreator || isAdmin || isPaused}
            />
          )}
          {isCanVoteSplitPot && <VoteSplitButton address={address} />}
          {(isCreator || isAdmin) && !isInProgress && isRegistering && (
            <>
              {isPaused && <UnpauseButton address={address} isInProgress={isInProgress} />}
              {!isPaused && <PauseButton address={address} isInProgress={isInProgress} />}
            </>
          )}
        </>
      )}
      {/* TODO Remove after integration phase */}
      {/* <Link href="/games/1" passHref>
        <Button as="a" id="showGameDetails" mt="8px" width="100%">
          {t('Show Game Details')}
        </Button>
      </Link> */}
    </Container>
  )
}

export default CardPlayerSection
