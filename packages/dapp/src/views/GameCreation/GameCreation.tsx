/* eslint-disable */
import { Flex, Heading, Text, Input } from '@pancakeswap/uikit'
import { ChangeEvent, useCallback, useContext, useState } from 'react'

import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { GameCreationContext } from './contexts/GameCreationProvider'
import NextStepButton from './NextStepButton'
import SelectionCard from './SelectionCard'
import imageTest from '../../../public/images/chains/1.png'
import useGameCreation from 'views/GameCreation/contexts/hook'
import Select, { OptionProps } from 'components/Select/Select'
import { ethers } from 'ethers'
import BackStepButton from './BackStepButton'

// TODO: Refacto by split components
// TODO: Fix persist selection -> step 3 is wrong...
const EdgeSelection = () => {
  const { houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameCreation()

  const handleHouseEdgeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      option.value,
      creatorEdge,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const handleCreatorEdgeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      houseEdge,
      option.value,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const allowedValuesHouseEdge = [
    {
      label: '0%',
      value: 0,
    },
    {
      label: '1%',
      value: 0.01,
    },
    {
      label: '2%',
      value: 0.02,
    },
    {
      label: '3%',
      value: 0.03,
    },
    {
      label: '4%',
      value: 0.04,
    },
    {
      label: '5%',
      value: 0.05,
    },
    {
      label: '6%',
      value: 0.06,
    },
    {
      label: '7%',
      value: 0.07,
    },
    {
      label: '8%',
      value: 0.08,
    },
    {
      label: '9%',
      value: 0.09,
    },
    {
      label: '10%',
      value: 0.1,
    },
  ]

  const allowedValuesCreatorEdge = [
    {
      label: '0%',
      value: 0,
    },
    {
      label: '1%',
      value: 0.01,
    },
    {
      label: '2%',
      value: 0.02,
    },
    {
      label: '3%',
      value: 0.03,
    },
    {
      label: '4%',
      value: 0.04,
    },
    {
      label: '5%',
      value: 0.05,
    },
  ]

  return (
    <>
      <Text as="h2" color="textSubtle" mb="8px">
        Edge selection
      </Text>
      <Text as="p" color="textSubtle" mb="24px">
        Make a choice !
      </Text>
      {allowedValuesHouseEdge && (
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
                {'House scale selection'}
              </Text>
              <Select options={allowedValuesHouseEdge} onOptionChange={handleHouseEdgeOptionChange}></Select>
            </Flex>

            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                {'Creator scale selection'}
              </Text>
              <Select options={allowedValuesCreatorEdge} onOptionChange={handleCreatorEdgeOptionChange}></Select>
            </Flex>
          </Flex>
        </>
      )}
    </>
  )
}

const RegistrationAmountSelection = () => {
  const { houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameCreation()

  const handleRegistrationAmountOptionChange = (option: OptionProps) => {
    actions.setGameCreation(currentStep, houseEdge, creatorEdge, option.value, maxPlayers, playTimeRange, encodedCron)
  }

  const AUTHORIZED_AMOUNTS = [0, 0.0001, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 5, 10]
  const authorizedAmounts = AUTHORIZED_AMOUNTS.map((amount) => {
    return {
      label: amount + ' BNB',
      value: ethers.utils.parseEther(`${amount}`),
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
  const { houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameCreation()

  const handleMaximumPlayersOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      houseEdge,
      creatorEdge,
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
  const { houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, encodedCron, currentStep, actions } =
    useGameCreation()

  const handlePlayTimeRangeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      houseEdge,
      creatorEdge,
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
  const [encodedCron, setEncodedCron] = useState('')

  const { houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, currentStep, actions } =
    useGameCreation()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setEncodedCron(value)
    actions.setGameCreation(currentStep, houseEdge, creatorEdge, registrationAmount, maxPlayers, playTimeRange, value)
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

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Prizepool  configuration')}
      </Heading>
      <EdgeSelection />
      <OtherOptionsSelection />
      {/* //TODO: implement validation */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
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
