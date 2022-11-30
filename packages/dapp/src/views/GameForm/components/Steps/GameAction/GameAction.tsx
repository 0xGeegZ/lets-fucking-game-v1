import { Flex, Heading, Text } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'

import { useRouter } from 'next/router'

import BackStepButton from 'views/GameForm/components/Buttons/BackStepButton'
import CreateGameButton from 'views/GameForm/components/Buttons/CreateGameButton'
import UpdateGameButton from 'views/GameForm/components/Buttons/UpdateGameButton'
import RecapConfigGame from 'views/GameForm/components/Steps/GameAction/components/RecapConfigGame'

const GameAction: React.FC<React.PropsWithChildren> = () => {
  const { actions, currentStep, ...gameData } = useGameContext()
  const { t } = useTranslation()

  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 4 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {gameData?.game ? <>{t('Contract update')}</> : <>{t('Contract creation')}</>}
      </Heading>
      <RecapConfigGame />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)} disabled={!!gameData?.game}>
          {t('Previous Step')}
        </BackStepButton>
        {id ? <UpdateGameButton game={gameData} /> : <CreateGameButton game={gameData} />}
      </Flex>
    </>
  )
}

export default GameAction
