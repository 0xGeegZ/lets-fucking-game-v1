import { Text } from '@pancakeswap/uikit'

import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import Select, { OptionProps } from 'components/Select/Select'

const PlayTimeRangeSelection = () => {
  const {
    gameConfig,
    game,
    treasuryFee,
    creatorFee,
    registrationAmount,
    freeGamePrizepoolAmount,
    maxPlayers,
    encodedCron,
    currentStep,
    actions,
  } = useGameContext()

  const { AUTHORIZED_PLAY_TIME_RANGE } = gameConfig

  const handlePlayTimeRangeOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      freeGamePrizepoolAmount,
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

  const defaultOptionIndex = game
    ? allowedValuesPlayTimeRange.findIndex((timeRange) => timeRange.value === game.playTimeRange)
    : 2

  return (
    <>
      {allowedValuesPlayTimeRange && (
        <>
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            Daily play time range
          </Text>
          <Select
            defaultOptionIndex={defaultOptionIndex}
            options={allowedValuesPlayTimeRange}
            onOptionChange={handlePlayTimeRangeOptionChange}
          />
        </>
      )}
    </>
  )
}

export default PlayTimeRangeSelection
