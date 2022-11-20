/* eslint-disable */
import { Flex, Heading, Text, Input, useToast, CheckmarkIcon, WarningIcon } from '@pancakeswap/uikit'
import { ChangeEvent, useCallback, useContext, useState } from 'react'
import styled, { css } from 'styled-components'
import cronstrue from 'cronstrue'
import momentTz from 'moment-timezone'
import parser from 'cron-parser'
import {
  PLAYERS_MAX_LENGTH,
  PLAYERS_MIN_LENGTH,
  AUTHORIZED_CRONS,
  AUTHORIZED_PLAY_TIME_RANGE,
  AUTHORIZED_CREATOR_FEE,
  AUTHORIZED_TREASURY_FEE,
  AUTHORIZED_AMOUNTS,
} from './config'

import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { GameCreationContext } from './contexts/GameCreationProvider'
import NextStepButton from './NextStepButton'
import SelectionCard from './SelectionCard'
import imageTest from '../../../public/images/chains/1.png'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import Select, { OptionProps } from 'components/Select/Select'
import { parseEther } from '@ethersproject/units'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { TREASURY_FEE_DEFAULT, CREATOR_FEE_DEFAULT } from './config'
import { isValidCron } from 'cron-validator'
import { Input as NumericalInput } from 'components/NumericalInput'
import Tooltip from 'views/Games/components/GameCardButtons/Tooltip'

import BackStepButton from './BackStepButton'

const InputWrap = styled.div`
  position: relative;
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

const FeeSelection = () => {
  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameContext()

  const handleTreasuryFeeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      option.value,
      creatorFee,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const handleCreatorFeeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      option.value,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const allowedValuesTreasuryFee = AUTHORIZED_TREASURY_FEE.map((fee) => {
    return {
      label: `${fee}%`,
      value: fee * 100,
    }
  })

  const allowedValuesCreatorFee = AUTHORIZED_CREATOR_FEE.map((fee) => {
    return {
      label: `${fee}%`,
      value: fee * 100,
    }
  })

  return (
    <>
      <Text as="h2" mb="8px" mt="24px">
        Creator & Treasury fee
      </Text>

      {allowedValuesTreasuryFee && (
        <>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            pr={[null, null, '4px']}
            pl={['4px', null, '0']}
            mb="8px"
          >
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                {'Treasury fee (for us)'}
              </Text>
              <Select
                defaultOptionIndex={0}
                options={allowedValuesTreasuryFee}
                onOptionChange={handleTreasuryFeeOptionChange}
              ></Select>
            </Flex>
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                {'Creator fee (for you)'}
              </Text>
              <Select
                defaultOptionIndex={2}
                options={allowedValuesCreatorFee}
                onOptionChange={handleCreatorFeeOptionChange}
              ></Select>
            </Flex>
          </Flex>
        </>
      )}
    </>
  )
}

const RegistrationAmountSelection = () => {
  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameContext()

  const handleRegistrationAmountOptionChange = (option: OptionProps) => {
    actions.setGameCreation(currentStep, treasuryFee, creatorFee, option.value, maxPlayers, playTimeRange, encodedCron)
  }

  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) => {
    return {
      label: `${amount} ${chainSymbol}`,
      value: parseEther(`${amount}`).toString(),
    }
  })

  return (
    <>
      {authorizedAmounts && (
        <>
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            {'Registration amount'}
          </Text>
          <Select
            defaultOptionIndex={2}
            options={authorizedAmounts}
            onOptionChange={handleRegistrationAmountOptionChange}
          ></Select>
        </>
      )}
    </>
  )
}

const MaximumPlayersSelection = () => {
  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameContext()

  const [isValid, setIsValid] = useState(true)
  const [message, setMessage] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const errorMessage = 'Number of players should be between 2 and 100.'

    if (value < PLAYERS_MIN_LENGTH || value > PLAYERS_MAX_LENGTH) {
      setIsValid(false)
      setMessage(errorMessage)
    } else {
      setIsValid(true)
      setMessage('')
    }

    actions.setGameCreation(currentStep, treasuryFee, creatorFee, registrationAmount, value, playTimeRange, encodedCron)
  }

  return (
    <>
      <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
        {'Number of players'}
      </Text>
      <InputWrap>
        <Input
          onChange={handleChange}
          isWarning={maxPlayers && !isValid}
          isSuccess={maxPlayers && isValid}
          pattern="^[1-9][0-9]?$|^100$"
          min="1"
          max="100"
          value={maxPlayers}
        />
        <Indicator>
          {isValid && maxPlayers && <CheckmarkIcon color="success" />}
          {!isValid && maxPlayers && <WarningIcon color="failure" />}
        </Indicator>
      </InputWrap>
      <Text color="failure" fontSize="14px" py="4px" mb="16px" style={{ minHeight: '30px' }}>
        {message}
      </Text>
    </>
  )
}

const PlayTimeRangeSelection = () => {
  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameContext()

  const handlePlayTimeRangeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      maxPlayers,
      option.value,
      encodedCron,
    )
  }

  const allowedValuesPlayTimeRange = AUTHORIZED_PLAY_TIME_RANGE.map((time) => {
    return {
      label: `${time} hour${time > 1 ? 's' : ''}`,
      value: time,
    }
  })

  return (
    <>
      {allowedValuesPlayTimeRange && (
        <>
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            {'Daily play time range'}
          </Text>
          <Select
            defaultOptionIndex={2}
            options={allowedValuesPlayTimeRange}
            onOptionChange={handlePlayTimeRangeOptionChange}
          ></Select>
        </>
      )}
    </>
  )
}

const EncodedCronSelection = () => {
  const { toastError, toastSuccess } = useToast()
  const { t } = useTranslation()

  const defaultTimezone = 'Etc/UTC'
  let timezone
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    timezone = defaultTimezone
  }

  const allowedValuesCron = AUTHORIZED_CRONS.map((cronHour) => {
    const cron = `0 ${cronHour} * * *`
    let label = ''
    try {
      //   const transform = cronstrue.toString(cron, {
      //     use24HourTimeFormat: false,
      //   })
      //   label = `${transform} ${timezone}`

      const interval = parser.parseExpression(cron, { tz: timezone })
      //   const transform = moment(interval.next().toString()).format('hh:mm A')
      const transform = momentTz.tz(interval.next().toString(), timezone).format('hh:mm A')

      label = `${transform} ${timezone}`
    } catch (e) {
      label = `${cronHour}H ${timezone}`
    }
    return {
      label,
      value: cron,
    }
  })

  const [encodedCron, setEncodedCron] = useState(allowedValuesCron[17].value)

  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, currentStep, actions } =
    useGameContext()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEncodedCron(value)

    actions.setGameCreation(currentStep, treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, value)
  }

  const handleCronOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      option.value,
    )
  }

  return (
    <>
      {
        <>
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {'Daily game draw'}
            </Text>
            <Tooltip content={<Text>{`${t('Based on your current timezone')} : ${timezone}`}</Text>} />
          </Text>
          <Select defaultOptionIndex={17} options={allowedValuesCron} onOptionChange={handleCronOptionChange}></Select>
        </>
      }
    </>
  )
}

const OtherOptionsSelection = () => {
  return (
    <>
      <Text as="h2" mb="8px">
        Main game configuration
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="16px"
      >
        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <RegistrationAmountSelection />
        </Flex>

        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <MaximumPlayersSelection />
        </Flex>
      </Flex>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <PlayTimeRangeSelection />
        </Flex>

        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <EncodedCronSelection />
        </Flex>
      </Flex>
    </>
  )
}

const GameCreation: React.FC = () => {
  const { actions, currentStep, treasuryFee, registrationAmount, maxPlayers, playTimeRange, encodedCron } =
    useGameContext()
  const { toastError, toastSuccess } = useToast()

  const checkFieldsAndValidate = () => {
    if (!isValidCron(encodedCron)) return toastError(t('Error'), t('Wrong entered Cron'))

    if (maxPlayers < PLAYERS_MIN_LENGTH || maxPlayers > PLAYERS_MAX_LENGTH)
      return toastError(t('Error'), t('Number of players should be between 2 and 100'))

    actions.nextStep(currentStep + 1)
  }

  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Game configuration')}
      </Heading>
      <OtherOptionsSelection />
      <FeeSelection />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
        mt="24px"
      >
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)}>{t('Previous Step')}</BackStepButton>
        <NextStepButton
          onClick={checkFieldsAndValidate}
          disabled={!treasuryFee || !registrationAmount || !maxPlayers || !playTimeRange || !encodedCron}
        >
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default GameCreation
