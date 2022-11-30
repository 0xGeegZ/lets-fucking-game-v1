import { Text } from '@pancakeswap/uikit'
import momentTz from 'moment-timezone'
import parser from 'cron-parser'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import Select, { OptionProps } from 'components/Select/Select'

import Tooltip from 'views/Games/components/GameCardButtons/Tooltip'

const EncodedCronSelection = () => {
  const { t } = useTranslation()

  const {
    gameConfig,
    game,
    treasuryFee,
    creatorFee,
    registrationAmount,
    freeGamePrizepoolAmount,
    maxPlayers,
    playTimeRange,
    currentStep,
    actions,
  } = useGameContext()

  const { AUTHORIZED_CRONS } = gameConfig

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
      const interval = parser.parseExpression(cron, { tz: timezone })
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

  const defaultOptionIndex = game ? allowedValuesCron.findIndex((cron) => cron.value === game.encodedCron) + 1 : 18

  const handleCronOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      freeGamePrizepoolAmount,
      maxPlayers,
      playTimeRange,
      option.value,
    )
  }

  return (
    <>
      <>
        <Text bold style={{ display: 'flex', alignItems: 'center' }}>
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            Daily game draw
          </Text>
          <Tooltip content={<Text>{`${t('Based on your current timezone')} : ${timezone}`}</Text>} />
        </Text>
        <Select
          defaultOptionIndex={defaultOptionIndex}
          options={allowedValuesCron}
          onOptionChange={handleCronOptionChange}
        />
      </>
    </>
  )
}

export default EncodedCronSelection
