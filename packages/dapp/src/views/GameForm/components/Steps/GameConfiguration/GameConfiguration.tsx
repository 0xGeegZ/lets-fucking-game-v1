import { Flex, Heading, Text, useToast } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'

import { isValidCron } from 'cron-validator'
import NextStepButton from 'views/GameForm/components/Buttons/NextStepButton'
import BackStepButton from 'views/GameForm/components/Buttons/BackStepButton'

import FeeSelection from 'views/GameForm/components/Steps/GameConfiguration/components/FeeSelection'
import MainOptionsSelection from 'views/GameForm/components/Steps/GameConfiguration/components/MainOptionsSelection'

const GameConfiguration: React.FC = () => {
  const {
    actions,
    game,
    gameConfig,
    currentStep,
    treasuryFee,
    registrationAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
  } = useGameContext()
  const { toastError } = useToast()

  const { PLAYERS_MIN_LENGTH, PLAYERS_MAX_LENGTH } = gameConfig

  const checkFieldsAndValidate = () => {
    if (!isValidCron(encodedCron)) return toastError(t('Error'), t('Wrong entered Cron'))

    if (maxPlayers < PLAYERS_MIN_LENGTH || maxPlayers > PLAYERS_MAX_LENGTH)
      return toastError(t('Error'), t('Number of players should be between 2 and 100'))

    return actions.nextStep(currentStep + 1)
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
      <MainOptionsSelection />
      <FeeSelection />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
        mt="24px"
      >
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)} disabled={!!game}>
          {t('Previous Step')}
        </BackStepButton>
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

export default GameConfiguration
