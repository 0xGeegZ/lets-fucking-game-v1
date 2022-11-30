import { Flex, Text } from '@pancakeswap/uikit'
import { useState } from 'react'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import Select, { OptionProps } from 'components/Select/Select'

const FeeSelection = () => {
  const {
    gameConfig,
    game,
    treasuryFee,
    creatorFee,
    registrationAmount,
    freeGamePrizepoolAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    currentStep,
    actions,
  } = useGameContext()

  const { AUTHORIZED_TREASURY_FEE, AUTHORIZED_CREATOR_FEE } = gameConfig

  const [isTreasuryFeeUpdated, setIsTreasuryFeeUpdated] = useState(false)
  const [isCreatorFeeUpdated, setIsCreatorFeeUpdated] = useState(false)

  const handleTreasuryFeeOptionChange = (option: OptionProps) => {
    setIsTreasuryFeeUpdated(true)
    actions.setGameCreation(
      currentStep,
      option.value,
      creatorFee,
      registrationAmount,
      freeGamePrizepoolAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const handleCreatorFeeOptionChange = (option: OptionProps) => {
    setIsCreatorFeeUpdated(true)
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      option.value,
      registrationAmount,
      freeGamePrizepoolAmount,
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

  let defaultTreasuryOptionIndex = game
    ? allowedValuesTreasuryFee.findIndex((treasury) => treasury.value === Number(game.treasuryFee))
    : 0

  if (defaultTreasuryOptionIndex < 0) defaultTreasuryOptionIndex = 0

  const allowedValuesCreatorFee = AUTHORIZED_CREATOR_FEE.map((fee) => {
    return {
      label: `${fee}%`,
      value: fee * 100,
    }
  })

  let defaultCreatorOptionIndex = game
    ? allowedValuesCreatorFee.findIndex((creator) => creator.value === Number(game.creatorFee)) + 1
    : 2

  if (defaultCreatorOptionIndex < 0) defaultCreatorOptionIndex = 0

  return (
    <>
      <Text as="h2" mb="8px" mt="16px">
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
                Treasury fee (for us)
              </Text>
              <Select
                defaultOptionIndex={defaultTreasuryOptionIndex}
                options={allowedValuesTreasuryFee}
                onOptionChange={handleTreasuryFeeOptionChange}
              />
            </Flex>
            <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
              <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
                Creator fee (for you)
              </Text>
              <Select
                defaultOptionIndex={defaultCreatorOptionIndex}
                options={allowedValuesCreatorFee}
                onOptionChange={handleCreatorFeeOptionChange}
              />
            </Flex>
          </Flex>
        </>
      )}
    </>
  )
}

export default FeeSelection
