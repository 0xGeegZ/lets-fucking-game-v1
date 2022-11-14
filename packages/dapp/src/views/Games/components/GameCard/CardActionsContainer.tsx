import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import cronstrue from 'cronstrue'

import BigNumber from 'bignumber.js'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'

import moment from 'moment'
import ClaimButton from '../GameCardButtons/ClaimButton'
import PlayButton from '../GameCardButtons/PlayButton'
import RegisterButton from '../GameCardButtons/RegisterButton'
import VoteSplitButton from '../GameCardButtons/VoteSplitButton'
import PauseButton from '../GameCardButtons/PauseButton'
import UnpauseButton from '../GameCardButtons/UnpauseButton'

const Container = styled.div`
  margin-right: 4px;
`

const Action = styled.div`
  padding-top: 16px;
`

const ActionContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ActionTitles = styled.div`
  display: flex;
  margin-bottom: 8px;
`

export const ActionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
interface GameCardActionsProps {
  address: string
  roundId: BigNumber
  registrationAmount: BigNumber
  gameCreationAmount: BigNumber
  isInProgress: boolean
  wonAmount: BigNumber
  nextFromRange: BigNumber
  nextToRange: BigNumber
  encodedCron: string
  isPlaying: boolean
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  isReady: boolean
  isPaused: boolean
  isCreator: boolean
  account?: string
}

const CardActions: React.FC<React.PropsWithChildren<GameCardActionsProps>> = ({
  address,
  roundId,
  registrationAmount,
  gameCreationAmount,
  isInProgress,
  wonAmount,
  nextFromRange,
  nextToRange,
  encodedCron,
  isPlaying,
  isWonLastGames,
  isCanVoteSplitPot,
  isInTimeRange,
  isReady,
  isPaused,
  isCreator,
  account,
}) => {
  const {
    t,
    // currentLanguage: { locale },
  } = useTranslation()

  // const currentDate = useMemo(
  //   () => new Date().toLocaleString(locale, { month: 'short', year: 'numeric', day: 'numeric' }),
  //   [locale],
  // )

  const [cronHumanRedeable, setCronHumanRedeable] = useState('')

  useEffect(() => {
    if (!encodedCron) return

    try {
      const transform = cronstrue.toString(encodedCron, {
        use24HourTimeFormat: false,
      })
      setCronHumanRedeable(transform.toLowerCase())
    } catch (e) {
      setCronHumanRedeable('')
    }
  }, [encodedCron])

  return (
    <Action>
      {isWonLastGames && (
        <>
          <ActionContainer>
            <ActionTitles>
              <Text bold textTransform="uppercase" color="secondary" pr="4px">
                {t('Earned')}
              </Text>
            </ActionTitles>
            <ActionContent>
              {isReady ? (
                <Text bold color="success" fontSize={16}>
                  {wonAmount.toNumber()} BNB
                </Text>
              ) : (
                <Skeleton width={80} height={18} mb="4px" />
              )}
            </ActionContent>
          </ActionContainer>
          <ActionContainer>
            <ActionTitles />
            <ActionContent>
              {isReady ? (
                <ClaimButton address={address} roundId={roundId} />
              ) : (
                <Skeleton width={80} height={36} mb="4px" />
              )}
            </ActionContent>
          </ActionContainer>
        </>
      )}

      {isPlaying && (
        <Container>
          <Flex justifyContent="space-between">
            <Heading mr="4px">{t('Next play time')}: </Heading>
            {isReady ? (
              <>
                {nextFromRange && nextToRange && (
                  <Text>
                    {moment(nextFromRange).isSame(moment(), 'day') ? 'Today' : 'Tomorrow'} between{' '}
                    {moment(nextFromRange).format('hh:mm A')} and {moment(nextToRange).format('hh:mm A')}
                  </Text>
                )}
              </>
            ) : (
              <Skeleton width="100%" height={18} mb="4px" />
            )}
          </Flex>
          {!isInTimeRange && moment().isAfter(moment(nextToRange)) && (
            <Flex justifyContent="space-arround">
              <Heading mr="4px">{t('You Loos')}</Heading>
            </Flex>
          )}
        </Container>
      )}

      {cronHumanRedeable && (
        <Container>
          <Flex justifyContent="space-between">
            <Heading mr="4px">{t('Next game draw')}</Heading>
            {isReady ? <Text>{t(`${cronHumanRedeable}`)}</Text> : <Skeleton width="100%" height={18} mb="4px" />}
          </Flex>
        </Container>
      )}

      {/* TODO ADD TIMESTAMP WHEN GAME START */}
      {/* <Container>
        <Flex>
          <Text color="textSubtle" fontSize="12px">
            {t('Started')} {' 5 '} {t('days ago')}
          </Text>
        </Flex>
      </Container> */}

      {/* TODO ADD CONDITION IF ACCOUNT IS GAME CREATOR. If true, display play and pause button */}
      {!account ? (
        <ConnectWalletButton mt="8px" width="100%" />
      ) : (
        <>
          {isInProgress && isInTimeRange && <PlayButton address={address} />}

          {!isInProgress && <RegisterButton address={address} registrationAmount={registrationAmount} />}

          {isCanVoteSplitPot && <VoteSplitButton address={address} />}
          {isCreator && !isInProgress && isPaused && <UnpauseButton address={address} />}
          {isCreator && !isInProgress && !isPaused && <PauseButton address={address} />}
        </>
      )}
      {/* TODO Remove after integration phase */}
      {/* <Link href="/games/1" passHref>
        <Button as="a" id="showGameDetails" mt="8px" width="100%">
          {t('Show Game Details')}
        </Button>
      </Link> */}
    </Action>
  )
}

export default CardActions
