import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import cronstrue from 'cronstrue'

import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'

import moment from 'moment'
import ClaimButton from './ClaimButton'
import PlayButton from './PlayButton'
import RegisterButton from './RegisterButton'
import VoteSplitButton from './VoteSplitButton'

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
  isGameStarted: boolean
  wonAmount: BigNumber
  nextFromRange: BigNumber
  nextToRange: BigNumber
  encodedCron: string
  isPlaying: boolean
  isWonLastGames: boolean
  isCanVoteSplitPot: boolean
  isInTimeRange: boolean
  isReady: boolean
  account?: string
}

const CardActions: React.FC<React.PropsWithChildren<GameCardActionsProps>> = ({
  address,
  roundId,
  isGameStarted,
  wonAmount,
  nextFromRange,
  nextToRange,
  encodedCron,
  isPlaying,
  isWonLastGames,
  isCanVoteSplitPot,
  isInTimeRange,
  isReady,
  account,
}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const currentDate = useMemo(
    () => new Date().toLocaleString(locale, { month: 'short', year: 'numeric', day: 'numeric' }),
    [locale],
  )

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
                <ClaimButton ml="4px" address={address} roundId={roundId} />
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
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '1rem' }}>
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
          {isGameStarted && isInTimeRange && <PlayButton address="0x86f13647f5b308e915a48b7e9dc15a216e3d8dbe" />}

          {!isGameStarted && (
            <RegisterButton
              address="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE"
              registrationAmount={EthersBigNumber.from(1)}
              gameCreationAmount={EthersBigNumber.from(1)}
            />
          )}

          {isCanVoteSplitPot && (
            <VoteSplitButton address="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE" roundId={EthersBigNumber.from(1)} />
          )}
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
