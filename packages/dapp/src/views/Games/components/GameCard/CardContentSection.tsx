import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text, RocketIcon, Heading } from '@pancakeswap/uikit'

import BigNumber from 'bignumber.js'

import styled from 'styled-components'
import { DeserializedPrizeData } from 'state/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
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
  isRegistering: boolean
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
  isRegistering,
  isReady,
}) => {
  const { t } = useTranslation()
  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'
  return (
    <Container>
      <Flex justifyContent="space-between">
        <Heading mr="4px">{t('Prizepool')}: </Heading>
        {isReady ? (
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            <RocketIcon m="4px" color="success" />
            <Text bold color="success" fontSize={16}>
              {prizepool.toNumber()} {chainSymbol}
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
                          >{`Position ${prize.position.toNumber()} will win ${prize.amount.toNumber()} ${chainSymbol}`}</Text>
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
                    {registrationAmount.toNumber()} {chainSymbol}
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
            {isRegistering && (
              <Tooltip
                content={
                  <Text display="inline" color="textSubtle">
                    {`Game will start when ${maxPlayers.toNumber()} players have joined this game`}
                  </Text>
                }
              />
            )}
          </Text>
        ) : (
          <Skeleton height={24} width={80} />
        )}
      </Flex>

      <Flex justifyContent="space-between">
        {(isRegistering || isInProgress) && <Heading mr="4px">{t('Daily Draw')}: </Heading>}
        {!isInProgress && !isRegistering && <Heading mr="4px">{t('Game will start')}: </Heading>}
        {isReady ? (
          <Text style={{ display: 'flex', alignItems: 'center' }}>
            <Text bold>{t(`${cronHumanReadable}`)}</Text>
            {isRegistering && (
              <Tooltip
                content={
                  <Text display="inline" color="textSubtle">
                    {`If all ${maxPlayers.toNumber()} players have joined this game up`}
                  </Text>
                }
              />
            )}
          </Text>
        ) : (
          <Skeleton height={24} width={80} />
        )}
      </Flex>

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
