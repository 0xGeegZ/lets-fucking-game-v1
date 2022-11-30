import { Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import { formatEther } from '@ethersproject/units'
import { useState, useEffect } from 'react'
import parser from 'cron-parser'
import momentTz from 'moment-timezone'

import useActiveWeb3React from 'hooks/useActiveWeb3React'

const BulletList = styled.ul`
  list-style-type: none;
  margin-top: 16px;
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

const RecapConfigGame = () => {
  const { t } = useTranslation()

  const {
    game,
    name,
    treasuryFee,
    creatorFee,
    registrationAmount,
    freeGamePrizepoolAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    numberPlayersAllowedToWin,
    prizeType,
  } = useGameContext()

  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const [cronHumanReadable, setCronHumanReadable] = useState('')

  let timezone = 'Etc/UTC'
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    // noop
  }

  useEffect(() => {
    if (!encodedCron) return

    try {
      const interval = parser.parseExpression(encodedCron, { tz: timezone })
      //   const transform = moment(interval.next().toString()).format('hh:mm A')
      const transform = momentTz.tz(interval.next().toString(), timezone).format('hh:mm A')
      setCronHumanReadable(`${transform} ${timezone}`)
    } catch (e) {
      setCronHumanReadable(encodedCron)
    }
  }, [encodedCron, timezone])

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            {game ? <>{t('Confirm update of your game')}</> : <>{t('Confirm configuration for your game')}</>}
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            {t('You could update configuration later if game is not in progress')}
          </Text>

          <Text as="h2" mt="16px">
            {name}
          </Text>

          <Flex
            justifyContent="space-between"
            alignItems="center"
            pr={[null, null, '4px']}
            pl={['4px', null, '0']}
            mb="8px"
          >
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Registration amount')}:{' '}
                    {registrationAmount !== '0'
                      ? `${parseFloat(formatEther(registrationAmount.toString()))} ${chainSymbol}`
                      : 'FREE'}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Daily draw')}: {cronHumanReadable}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Winners')}: {numberPlayersAllowedToWin}
                  </Text>
                </li>

                <li>
                  <Text fontSize="12px" color="textSubtle" display="inline" lineHeight={2.5}>
                    {t('Treasury fee')}: {treasuryFee / 100} %
                  </Text>
                </li>
              </BulletList>
            </Flex>
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Prizepool')}:{' '}
                    {registrationAmount !== '0'
                      ? parseFloat(formatEther(`${Number(registrationAmount) * Number(maxPlayers)}`))
                      : parseFloat(freeGamePrizepoolAmount)}{' '}
                    {chainSymbol}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Daily play time range')}: {playTimeRange}H
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    {t('Maximum players')}: {maxPlayers}
                  </Text>
                </li>

                <li>
                  <Text fontSize="12px" color="textSubtle" display="inline">
                    {t('Creator fee')}: {creatorFee / 100} %
                  </Text>
                </li>
              </BulletList>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </>
  )
}

export default RecapConfigGame
