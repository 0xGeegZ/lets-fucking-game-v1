import { Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import { formatEther, parseEther } from '@ethersproject/units'
import { useCallback, useState, useEffect } from 'react'
import parser from 'cron-parser'
import moment from 'moment'
import momentTz from 'moment-timezone'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import BackStepButton from 'views/GameCreation/components/buttons/BackStepButton'
import CreateGameButton from 'views/GameCreation/components/CreateGameButton'

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
  const {
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
            Confirm configuration for your game
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            You could update configuration later if game is not in progress
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
                    Registration amount :{' '}
                    {registrationAmount !== '0'
                      ? `${parseFloat(formatEther(registrationAmount.toString()))} ${chainSymbol}`
                      : 'FREE'}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    Daily draw : {cronHumanReadable}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    Winners : {numberPlayersAllowedToWin}
                  </Text>
                </li>

                <li>
                  <Text fontSize="12px" color="textSubtle" display="inline" lineHeight={2.5}>
                    Treasury fee : {treasuryFee / 100} %
                  </Text>
                </li>
              </BulletList>
            </Flex>
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text color="textSubtle" display="inline">
                    Prizepool :{' '}
                    {registrationAmount !== '0'
                      ? parseFloat(formatEther(`${Number(registrationAmount) * Number(maxPlayers)}`))
                      : parseFloat(freeGamePrizepoolAmount)}{' '}
                    {chainSymbol}
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    Daily play time range : {playTimeRange}H
                  </Text>
                </li>

                <li>
                  <Text color="textSubtle" display="inline">
                    Maximum players : {maxPlayers}
                  </Text>
                </li>

                <li>
                  <Text fontSize="12px" color="textSubtle" display="inline">
                    Creator fee: {creatorFee / 100} %
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

const GameConfirmationAndContractCreation: React.FC<React.PropsWithChildren> = () => {
  const { actions, currentStep, ...game } = useGameContext()
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 4 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Contract creation')}
      </Heading>
      <RecapConfigGame />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)}>{t('Previous Step')}</BackStepButton>
        <CreateGameButton game={game} />
      </Flex>
    </>
  )
}

export default GameConfirmationAndContractCreation
