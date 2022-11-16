/* eslint-disable */
import { Flex, Heading, Text, Input, useToast } from '@pancakeswap/uikit'
import { ChangeEvent, useCallback, useContext, useState } from 'react'

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

import BackStepButton from './BackStepButton'

// TODO: Refacto by split components
// TODO: Fix persist -> step 3 is wrong...
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

  const allowedValuesTreasuryFee = [
    {
      label: '3%',
      value: 300,
    },
    {
      label: '4%',
      value: 400,
    },
    {
      label: '5%',
      value: 500,
    },
    {
      label: '6%',
      value: 600,
    },
    {
      label: '7%',
      value: 700,
    },
    {
      label: '8%',
      value: 800,
    },
    {
      label: '9%',
      value: 900,
    },
    {
      label: '10%',
      value: 1000,
    },
  ]

  const allowedValuesCreatorFee = [
    {
      label: '0%',
      value: 0,
    },
    {
      label: '1%',
      value: 100,
    },
    {
      label: '2%',
      value: 200,
    },
    {
      label: '3%',
      value: 300,
    },
    {
      label: '4%',
      value: 400,
    },
    {
      label: '5%',
      value: 500,
    },
  ]

  return (
    <>
      <Text as="h2" mb="8px" mt="24px">
        Creator & Treasury fee
      </Text>

      {allowedValuesTreasuryFee && (
        <>
          {/* //TODO: implement dynamic height to dropdown */}
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

  // TODO GUIGUI HANDLE FREE GAMES AND LOAD AUTHORIZED AMOUNTS FROM CONFIG
  // const AUTHORIZED_AMOUNTS = [0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
  const AUTHORIZED_AMOUNTS = [0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
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
          {/* //TODO: implement dynamic height to dropdown */}
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

  const handleMaximumPlayersOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      option.value,
      playTimeRange,
      encodedCron,
    )
  }

  const allowedValuesMaximumPlayers = [
    {
      label: '2 players',
      value: 2,
    },
    {
      label: '3 players',
      value: 3,
    },
    {
      label: '4 players',
      value: 4,
    },
    {
      label: '5 players',
      value: 5,
    },
    {
      label: '6 players',
      value: 6,
    },
    {
      label: '7 players',
      value: 7,
    },
    {
      label: '8 players',
      value: 8,
    },
    {
      label: '9 players',
      value: 9,
    },
    {
      label: '10 players',
      value: 10,
    },
  ]

  return (
    <>
      {allowedValuesMaximumPlayers && (
        <>
          {/* //TODO: implement dynamic height to dropdown */}
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            {'Maximum players'}
          </Text>
          <Select
            defaultOptionIndex={4}
            options={allowedValuesMaximumPlayers}
            onOptionChange={handleMaximumPlayersOptionChange}
          ></Select>
        </>
      )}
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

  const allowedValuesPlayTimeRange = [
    {
      label: '1 hour',
      value: 1,
    },
    {
      label: '2 hours',
      value: 2,
    },
    {
      label: '3 hours',
      value: 3,
    },
    {
      label: '4 hours',
      value: 4,
    },
    {
      label: '5 hours',
      value: 5,
    },
  ]

  return (
    <>
      {allowedValuesPlayTimeRange && (
        <>
          {/* //TODO: implement dynamic height to dropdown */}
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            {'Play time range'}
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

  const [encodedCron, setEncodedCron] = useState('0 18 * * *')

  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, currentStep, actions } =
    useGameContext()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target

    if (isValidCron(value)) setEncodedCron(value)
    else toastError(t('Error'), t('This is not a cron string'))

    actions.setGameCreation(currentStep, treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, value)
  }

  return (
    <>
      {
        <>
          {/* //TODO: implement dynamic height to dropdown */}
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            {'Encoded cron'}
          </Text>
          <Input onChange={handleChange} placeholder={'0 18 * * *'} value={encodedCron} />
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
      {/* //TODO: implement fields validation */}
      <Flex justifyContent="end" alignItems="center" pr={[null, null, '4px']} pl={['4px', null, '0']} mt="24px">
        <NextStepButton
          onClick={() => actions.nextStep(currentStep + 1)}
          disabled={!treasuryFee || !registrationAmount || !maxPlayers || !playTimeRange || !encodedCron}
        >
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default GameCreation
