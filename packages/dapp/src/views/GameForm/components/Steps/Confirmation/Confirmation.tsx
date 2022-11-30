import { Heading, Text, Flex, Card, CardBody, Button, Link } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import UnpauseButton from 'views/Games/components/GameCardButtons/UnpauseButton'

const Confirmation: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { game } = useGameContext()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 5 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {game ? <>{t('Game updated')}</> : <>{t('Game created')}</>}
      </Heading>
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
                {game ? <>{t('Game successfully updated')}</> : <>{t('Your game is ready')}</>}
              </Heading>
              <Text as="p" color="textSubtle" mb="8px">
                {t(`Your game was successfully ${game ? 'updated' : 'created'} and is waiting for players.`)}
              </Text>

              <Text as="p" color="textSubtle" mb="16px">
                {t('Let&lsquo;s find some player by publishing the new on Twitter :)')}
              </Text>
              {/* // TODO GUIGUI ADD A button to share a tweet */}
              <Link href="/games/my-games" style={{ width: '100%' }}>
                <Button width="100%" as="a" id="showGames" mt="8px">
                  {t('See your Games')}
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Flex>
      </Flex>
    </>
  )
}

export default Confirmation
