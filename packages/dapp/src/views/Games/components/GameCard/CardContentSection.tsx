import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text, RocketIcon, Heading } from '@pancakeswap/uikit'

import BigNumber from 'bignumber.js'

import styled from 'styled-components'
import { DeserializedPrizeData } from 'state/types'
import Tooltip from '../GameCardButtons/Tooltip'

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

const Details = styled.div`
  padding-top: 16px;
`

const Container = styled.div`
  padding-top: 16px;
`

interface GameCardContentSectionProps {
  registrationAmount: BigNumber
  prizepool: BigNumber
  prizes: DeserializedPrizeData[]
  cronHumanReadable: string
  playerAddressesCount: BigNumber
  maxPlayers: BigNumber
  isInProgress: boolean
  isReady: boolean
}

const CardContentSection: React.FC<React.PropsWithChildren<GameCardContentSectionProps>> = ({
  registrationAmount,
  prizepool,
  prizes,
  cronHumanReadable,
  playerAddressesCount,
  maxPlayers,
  isInProgress,
  isReady,
}) => {
  const { t } = useTranslation()

  return (
    <Container>
      <Flex justifyContent="space-between">
        <Heading mr="4px">{t('Prizepool')}: </Heading>
        {isReady ? (
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            <RocketIcon m="4px" color="success" />
            <Text bold color="success" fontSize={16}>
              {prizepool.toNumber()}
              {' BNB'}
            </Text>
            <Tooltip
              additionalStyle={{ color: 'success' }}
              content={
                <>
                  <Text bold>{t('Prizepool details : ')}</Text>
                  <BulletList>
                    {prizes?.map((prize) => {
                      return (
                        <li>
                          <Text
                            display="inline"
                            color="textSubtle"
                          >{`Position ${prize.position.toNumber()} will win ${prize.amount.toNumber()} BNB`}</Text>
                        </li>
                      )
                    })}
                  </BulletList>
                </>
              }
            />
          </Text>
        ) : (
          <Skeleton height={24} width={80} />
        )}
      </Flex>

      <Flex justifyContent="space-between">
        <Heading mr="4px">{t('Registration')}: </Heading>
        {isReady ? (
          <>
            {registrationAmount && (
              <Text bold style={{ display: 'flex', alignItems: 'center' }}>
                {registrationAmount.toNumber() === 0 ? (
                  <Text bold fontSize={16} /* color="success" */>
                    FREE
                  </Text>
                ) : (
                  <Text bold fontSize={16}>
                    {registrationAmount.toNumber()}
                    {' BNB'}{' '}
                  </Text>
                )}
                <Tooltip
                  content={
                    <Text display="inline" color="textSubtle">
                      Registration amount will be used in the game prizepool
                    </Text>
                  }
                />
              </Text>
            )}
          </>
        ) : (
          <Skeleton height={24} width={80} />
        )}
      </Flex>

      <Flex justifyContent="space-between">
        <Heading mr="4px">{t('Players')}: </Heading>
        {isReady ? (
          <Text style={{ display: 'flex', alignItems: 'center' }}>
            <Text bold>
              {playerAddressesCount.toNumber()}/{maxPlayers.toNumber()}
            </Text>
            <Tooltip
              content={
                <Text display="inline" color="textSubtle">
                  {`Game will start when ${maxPlayers.toNumber()} players have joined this game`}
                </Text>
              }
            />
          </Text>
        ) : (
          <Skeleton height={24} width={80} />
        )}
      </Flex>

      {isInProgress && (
        <Flex justifyContent="space-between">
          <Heading mr="4px">{t('Next Game Draw')}: </Heading>
          {isReady ? (
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              <Text bold>{t(`${cronHumanReadable}`)}</Text>
              <Tooltip
                content={
                  <Text display="inline" color="textSubtle">
                    {`If all ${maxPlayers.toNumber()} players have joined this game up`}
                  </Text>
                }
              />
            </Text>
          ) : (
            <Skeleton height={24} width={80} />
          )}
        </Flex>
      )}

      {/* TODO ADD TIMESTAMP WHEN GAME START */}
      {/* <Details>
          <Flex>
            <Text color="textSubtle" fontSize="12px">
              {t('Started')} {' 5 '} {t('days ago')}
            </Text>
          </Flex>
        </Details> */}
    </Container>
  )
}

export default CardContentSection
