import { Heading, Text, Button, Flex, Card, CardBody } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import NextStepButton from './NextStepButton'
import BackStepButton from './BackStepButton'

const Confirmation: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { actions } = useGameContext()

  const ConfirmationsCards = () => {
    const {
      isInitialized,
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
      numberPlayersAllowedToWin,
      prizeType,
      successMessage,
      errorMessage,
    } = useGameContext()

    // TODO: improve style
    // TODO: add validation form
    // TODO: add state redux verification & handle status to update & display them
    return (
      <>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          pr={[null, null, '4px']}
          pl={['4px', null, '0']}
          mb="8px"
        >
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Card mb="24px">
              <CardBody>
                <Heading as="h4" scale="lg" mb="16px">
                  Your game is ready
                </Heading>
                <Text as="p" color="textSubtle" mb="8px">
                  Your game was successfully created.
                </Text>
                <Text as="p" color="textSubtle" mb="16px">
                  Let&lsquo;s find some player to start the game :)
                </Text>
                {/* // TODO GUIGUI ADD A LINK TO CREATED SMART CONTRACT on explorer */}
                {/* // TODO GUIGUI ADD A button to share a tweet */}
              </CardBody>
            </Card>
          </Flex>
        </Flex>
      </>
    )
  }

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 4 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Game created')}
      </Heading>
      <ConfirmationsCards />
    </>
  )
}

export default Confirmation
