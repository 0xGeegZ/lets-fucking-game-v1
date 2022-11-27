import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading, Skeleton, Text, ErrorIcon, Button, Link } from '@pancakeswap/uikit'

import BigNumber from 'bignumber.js'

import ConnectWalletButton from 'components/ConnectWalletButton'
import styled from 'styled-components'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import Tooltip from 'views/Games/components/GameCardButtons/Tooltip'

import moment from 'moment'
import ClaimButton from '../GameCardButtons/ClaimButton'
import PlayButton from '../GameCardButtons/PlayButton'
import RegisterButton from '../GameCardButtons/RegisterButton'
import VoteSplitButton from '../GameCardButtons/VoteSplitButton'
import PauseButton from '../GameCardButtons/PauseButton'
import UnpauseButton from '../GameCardButtons/UnpauseButton'
import ClaimCreatorFeeButton from '../GameCardButtons/ClaimCreatorFeeButton'
import ClaimTreasuryFeeButton from '../GameCardButtons/ClaimTreasuryFeeButton'
import ClaimAllFeeButton from '../GameCardButtons/ClaimAllFeeButton'

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
  nextFromRange: string
  nextToRange: string
  remainingPlayersCount: BigNumber
  playerAddressesCount: BigNumber
  encodedCron: string
  creatorAmount: string
  treasuryAmount: string
  isPlaying: boolean
  isWonLastGames: boolean
  lastGameWonAmount: BigNumber
  lastGameRoundId: BigNumber
  roundCount: BigNumber
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  isReady: boolean
  isPaused: boolean
  isCreator: boolean
  isAdmin: boolean
  hasLost: boolean
  isLoosing: boolean
  hasPlayedRound: boolean
  isSplitOk: boolean
  account?: string
}

const CardPlayerSection: React.FC<React.PropsWithChildren<GameCardPlayerSectionProps>> = ({
  address,
  roundId,
  registrationAmount,
  gameCreationAmount,
  isInProgress,
  isRegistering,
  nextFromRange,
  nextToRange,
  encodedCron,
  remainingPlayersCount,
  playerAddressesCount,
  creatorAmount,
  treasuryAmount,
  isPlaying,
  isWonLastGames,
  lastGameWonAmount,
  lastGameRoundId,
  roundCount,
  isCanVoteSplitPot,
  isInTimeRange,
  isReady,
  isPaused,
  isCreator,
  isAdmin,
  hasLost,
  isLoosing,
  hasPlayedRound,
  isSplitOk,
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
                  {lastGameWonAmount.toNumber()} {chainSymbol}
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
                <ClaimButton address={address} roundId={lastGameRoundId} />
              ) : (
                <Skeleton width={80} height={36} mb="4px" />
              )}
            </Text>
          </Flex>
        </>
      )}
      {isInProgress && isPlaying && !hasLost && (
        <>
          <Flex justifyContent="space-between">
            <Heading mr="4px">{`${t('Round')}:`}</Heading>
            {isReady ? (
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <Text bold style={{ textAlign: 'right' }}>
                  <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                    {roundCount.toNumber()}
                  </Text>
                </Text>
              </Text>
            ) : (
              <Skeleton width="100%" height={18} mb="4px" />
            )}
          </Flex>
        </>
      )}
      {isInProgress && isPlaying && isCanVoteSplitPot && (
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
                {nextFromRange && nextToRange && (
                  <Text bold style={{ textAlign: 'right' }}>
                    {hasPlayedRound ? (
                      <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                        ...
                        <Tooltip
                          content={
                            <>
                              <Text>{t('Already played, waiting for next draw')}</Text>
                            </>
                          }
                        />
                      </Text>
                    ) : (
                      <>
                        {moment(nextFromRange).isSame(moment(), 'day') ? 'Today' : 'Tomorrow'}
                        {' between '}
                        {moment(nextFromRange).format('hh:mm A')} and {moment(nextToRange).format('hh:mm A')}
                      </>
                    )}
                  </Text>
                )}
              </Text>
            ) : (
              <Skeleton width="100%" height={18} mb="4px" />
            )}
          </Flex>
        </>
      )}
      {!account ? (
        <ConnectWalletButton mt="8px" width="100%" />
      ) : (
        <>
          {hasLost && (
            <Flex justifyContent="center" mt="20px" mb="16px">
              <ErrorIcon width="16px" color="failure" style={{ verticalAlign: 'bottom' }} />
              <Heading mr="4px" ml="4px" color="failure">
                {t('You loose')}
              </Heading>
              <ErrorIcon width="16px" color="failure" style={{ verticalAlign: 'bottom' }} />
            </Flex>
          )}
          {!hasPlayedRound && isLoosing && (
            <Flex justifyContent="center" mt="20px">
              <ErrorIcon width="16px" color="failure" style={{ verticalAlign: 'bottom' }} />
              <Heading mr="4px" ml="4px" color="failure">
                {t('Round missed')}
              </Heading>
              <ErrorIcon width="16px" color="failure" style={{ verticalAlign: 'bottom' }} />
            </Flex>
          )}

          {(isInProgress || !isRegistering) && !hasLost && !(!hasPlayedRound && isLoosing) && (
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
          {isCanVoteSplitPot && <VoteSplitButton address={address} isSplitOk={isSplitOk} />}
          {(isCreator || isAdmin) && !isInProgress && isRegistering && (
            <>
              {isPaused && <UnpauseButton address={address} isInProgress={isInProgress} />}
              {!isPaused && <PauseButton address={address} isInProgress={isInProgress} />}
            </>
          )}
          {isCreator && isAdmin && !!+treasuryAmount && !!+creatorAmount && (
            <ClaimAllFeeButton address={address} treasuryAmount={treasuryAmount} creatorAmount={creatorAmount} />
          )}
          {isCreator && !isAdmin && !!+creatorAmount && (
            <ClaimCreatorFeeButton address={address} creatorAmount={creatorAmount} />
          )}
          {isAdmin && !isCreator && !!+treasuryAmount && (
            <ClaimTreasuryFeeButton address={address} treasuryAmount={treasuryAmount} />
          )}
        </>
      )}

      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {/* <Link href="" passHref style={{ width: '100%' }}> */}
      <Button
        width="100%"
        as="a"
        id="showGameDetails"
        disabled
        variant="tertiary"
        mt="16px"
        decorator={{ text: 'Soon' }}
      >
        {t('Show Game Details')}
      </Button>
      {/* </Link> */}
    </Container>
  )
}

export default CardPlayerSection
