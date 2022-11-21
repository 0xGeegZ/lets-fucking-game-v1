import { formatUnits } from '@ethersproject/units'
import { useTranslation } from '@pancakeswap/localization'
import {
  AutoRenewIcon,
  Card,
  CardBody,
  Checkbox,
  CheckmarkIcon,
  Flex,
  Heading,
  Input as UIKitInput,
  Text,
  WarningIcon,
} from '@pancakeswap/uikit'

import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { networkConfig } from 'config/internal/networkConfig'

import NextStepButton from './NextStepButton'

const InputWrap = styled.div`
  position: relative;
  max-width: 240px;
`

const Input = styled(UIKitInput)`
  padding-right: 40px;
`

const Indicator = styled(Flex)`
  align-items: center;
  height: 24px;
  justify-content: center;
  margin-top: -12px;
  position: absolute;
  right: 16px;
  top: 50%;
  width: 24px;
`

const GameName: React.FC<React.PropsWithChildren> = () => {
  const [isAcknowledged, setIsAcknowledged] = useState(false)

  const { actions, name, currentStep } = useGameContext()
  const { t } = useTranslation()

  const [isValid, setIsValid] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  //   const { balance: cakeBalance, fetchStatus } = useGetCakeBalance()
  //   const hasMinimumCakeRequired = fetchStatus === FetchStatus.Fetched && cakeBalance.gte(REGISTRATION_AMOUNT_DEFAULT)

  const { chain, chainId } = useActiveWeb3React()

  const { gameConfig } = networkConfig[chainId]
  if (!gameConfig) throw new Error('No game config found for chain id', chainId)

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const errorMessage = 'Game name must be at least 3 and at max 32 standard letters and numbers long. '
    setIsLoading(true)
    if (value.length < gameConfig.NAME_MIN_LENGTH || value.length > gameConfig.NAME_MAX_LENGTH) {
      setIsValid(false)
      setMessage(errorMessage)
    } else {
      setIsValid(true)
      setMessage('')
    }

    actions.setGameName(currentStep, value)
    setIsLoading(false)
  }

  const handleAcknowledge = () => setIsAcknowledged(!isAcknowledged)

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 1 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Game Name')}
      </Heading>
      <Text as="p" mb="24px">
        {t('This name will be shown in LFG games list and search results.')}
      </Text>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            {t('Game Name')}
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            {t(
              'Game name must be at least 3 and at max 32 standard letters and numbers long. You could update it later if needed.',
            )}
          </Text>
          <InputWrap>
            <Input
              onChange={handleChange}
              isWarning={name && !isValid}
              isSuccess={name && isValid}
              minLength={gameConfig.NAME_MIN_LENGTH}
              maxLength={gameConfig.NAME_MAX_LENGTH}
              placeholder={t('Game name...')}
              value={name}
            />
            <Indicator>
              {isLoading && <AutoRenewIcon spin />}
              {!isLoading && isValid && name && <CheckmarkIcon color="success" />}
              {!isLoading && !isValid && name && <WarningIcon color="failure" />}
            </Indicator>
          </InputWrap>
          <Text color="failure" fontSize="14px" py="4px" mb="16px" style={{ minHeight: '30px' }}>
            {message}
          </Text>
          <label htmlFor="checkbox" style={{ display: 'block', cursor: 'pointer', marginBottom: '24px' }}>
            <Flex alignItems="center">
              <div style={{ flex: 'none' }}>
                <Checkbox id="checkbox" scale="sm" checked={isAcknowledged} onChange={handleAcknowledge} />
              </div>
              <Text ml="8px">
                {t('I understand that i will need to pay %num% %symbol% to create game and cover keeper costs.', {
                  num: formatUnits(gameConfig.GAME_CREATION_AMOUNT),
                  symbol: chainSymbol,
                })}
              </Text>
            </Flex>
          </label>
        </CardBody>
      </Card>
      <Flex justifyContent="end" alignItems="center" pr={[null, null, '4px']} pl={['4px', null, '0']} mt="24px">
        <NextStepButton onClick={() => actions.nextStep(currentStep + 1)} disabled={!isValid || !isAcknowledged}>
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default GameName
