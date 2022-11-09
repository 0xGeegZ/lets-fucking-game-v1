import { Heading, Text, Button, Flex, Card, CardBody } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import NextStepButton from './NextStepButton'
import BackStepButton from './BackStepButton'

const SuccesOrErrorMessage: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { actions } = useGameContext()

  const InformationsCards = () => {
    const {
      isInitialized,
      currentStep,
      houseEdge,
      creatorEdge,
      registrationAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
      numberPlayersAllowedToWin,
      prizeType,
      successMessage,
      errorMessage,
    } = useGameContext()

    const errorMessageFake = 'Status of errors'
    const successMessageFake = 'Status of success'

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
                <Heading as="h4" scale="lg" mb="8px">
                  Error status
                </Heading>
                <Text as="p" color="textSubtle" mb="24px">
                  {errorMessageFake}
                </Text>
              </CardBody>
            </Card>
          </Flex>
          <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
            <Card mb="24px">
              <CardBody>
                <Heading as="h4" scale="lg" mb="8px">
                  Success status
                </Heading>
                <Text as="p" color="textSubtle" mb="24px">
                  {successMessageFake}
                </Text>
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
        {t('Succes or error message')}
      </Heading>
      <InformationsCards />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="8px"
      >
        <BackStepButton
          onClick={actions.previousStep} /* disabled={selectedNft.tokenId === null || !isApproved || isApproving} */
        >
          {t('Previous Step')}
        </BackStepButton>
        <Button>{t('Start Game')}</Button>
      </Flex>
    </>
  )
}

export default SuccesOrErrorMessage
