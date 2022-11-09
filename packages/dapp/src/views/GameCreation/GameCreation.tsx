/* eslint-disable */
import { Flex, Heading, Text, Input } from '@pancakeswap/uikit'
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

import BackStepButton from './BackStepButton'

// TODO: Refacto by split components
// TODO: Fix persist selection -> step 3 is wrong...
const EdgeSelection = () => {
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
      <Text as="h2" color="textSubtle" mb="8px">
        Creator & Treasury fee
      </Text>
      <Text as="p" color="textSubtle" mb="24px">
        Make a choice !
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
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                {'Treasury fee (for us)'}
              </Text>
              <Select options={allowedValuesTreasuryFee} onOptionChange={handleTreasuryFeeOptionChange}></Select>
            </Flex>
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                {'Creator fee (for you)'}
              </Text>
              <Select options={allowedValuesCreatorFee} onOptionChange={handleCreatorFeeOptionChange}></Select>
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

  // TODO GUIGUI HANDLE FREE GAMES AND LOAD AUTHORIZED AMOUNTS FROM CONFIG
  // const AUTHORIZED_AMOUNTS = [0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
  const AUTHORIZED_AMOUNTS = [0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
  const authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) => {
    return {
      label: amount + ' BNB',
      value: parseEther(`${amount}`),
    }
  })

  return (
    <>
      {authorizedAmounts && (
        <>
          {/* //TODO: implement dynamic height to dropdown */}
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {'Registration amount selection'}
            </Text>
            <Select options={authorizedAmounts} onOptionChange={handleRegistrationAmountOptionChange}></Select>
          </Flex>
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
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {'Maximum players selection'}
            </Text>
            <Select options={allowedValuesMaximumPlayers} onOptionChange={handleMaximumPlayersOptionChange}></Select>
          </Flex>
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
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {'Play time range selection'}
            </Text>
            <Select options={allowedValuesPlayTimeRange} onOptionChange={handlePlayTimeRangeOptionChange}></Select>
          </Flex>
        </>
      )}
    </>
  )
}

const EncodedCronSelection = () => {
  const [encodedCron, setEncodedCron] = useState('0 8 * * *')

  const { treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, currentStep, actions } =
    useGameContext()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEncodedCron(value)
    actions.setGameCreation(currentStep, treasuryFee, creatorFee, registrationAmount, maxPlayers, playTimeRange, value)
  }

  return (
    <>
      {
        <>
          {/* //TODO: implement dynamic height to dropdown */}
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {'Encoded cron selection'}
            </Text>
            <Input onChange={handleChange} placeholder={'0 8 * * *'} value={encodedCron} />
          </Flex>
        </>
      }
    </>
  )
}

const OtherOptionsSelection = () => {
  return (
    <>
      <Text as="h2" color="textSubtle" mb="8px">
        Other options selection
      </Text>
      <Text as="p" color="textSubtle" mb="24px">
        Make a choice !
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
          <RegistrationAmountSelection />
        </Flex>

        <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
          <MaximumPlayersSelection />
        </Flex>

        <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
          <PlayTimeRangeSelection />
        </Flex>

        <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
          <EncodedCronSelection />
        </Flex>
      </Flex>
    </>
  )
}

const GameCreation: React.FC = () => {
  const { actions } = useContext(GameCreationContext)

  const { t } = useTranslation()

  const { currentStep } = useGameContext()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Game configuration')}
      </Heading>
      <EdgeSelection />
      <OtherOptionsSelection />
      {/* //TODO: implement fields validation */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        {/* TODO disable button if all fields are not populated */}
        <NextStepButton
          onClick={actions.nextStep} /* disabled={selectedNft.tokenId === null || !isApproved || isApproving} */
        >
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default GameCreation
