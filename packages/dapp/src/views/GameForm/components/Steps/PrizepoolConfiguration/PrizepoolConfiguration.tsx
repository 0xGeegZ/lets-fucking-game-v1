import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import NextStepButton from 'views/GameForm/components/Buttons/NextStepButton'
import BackStepButton from 'views/GameForm/components/Buttons/BackStepButton'

import AllowedPlayersToWinSelection from 'views/GameForm/components/Steps/PrizepoolConfiguration/components/AllowedPlayersToWinSelection'
import PrizeTypeSelection from 'views/GameForm/components/Steps/PrizepoolConfiguration/components/PrizeTypeSelection'

const PrizepoolConfiguration: React.FC = () => {
  const { actions, game, currentStep, numberPlayersAllowedToWin, prizeType } = useGameContext()
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 3 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Prizepool configuration')}
      </Heading>
      <AllowedPlayersToWinSelection />
      <PrizeTypeSelection />
      {/* //TODO: implement validation */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)} disabled={!!game}>
          {t('Previous Step')}
        </BackStepButton>
        <NextStepButton
          onClick={() => actions.nextStep(currentStep + 1)}
          disabled={!numberPlayersAllowedToWin || !prizeType}
        >
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default PrizepoolConfiguration
