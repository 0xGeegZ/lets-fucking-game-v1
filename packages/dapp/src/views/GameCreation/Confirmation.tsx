import { Heading, Text, Flex, Card, CardBody } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const Confirmation: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()

  const ConfirmationsCards = () => {
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
                  {t('Your game is ready')}
                </Heading>
                <Text as="p" color="textSubtle" mb="8px">
                  {t('Your game was successfully created and is waiting for players.')}
                </Text>
                <Text as="p" color="textSubtle" mb="16px">
                  {t('Let&lsquo;s find some player by publishing the new on Twitter :)')}
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
