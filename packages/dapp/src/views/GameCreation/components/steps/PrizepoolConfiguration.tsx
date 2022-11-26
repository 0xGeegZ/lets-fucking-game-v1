import { Card, CardBody, CommunityIcon, Flex, Heading, Text } from '@pancakeswap/uikit'
import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import { range } from 'utils'
import NextStepButton from 'views/GameCreation/components/Buttons/NextStepButton'
import SelectionCard from 'views/GameCreation/components/SelectionCard'
import BackStepButton from 'views/GameCreation/components/Buttons/BackStepButton'
import imageTest from '../../../../../public/images/chains/1.png'

const AllowedPlayersToWinSelection = () => {
  const { numberPlayersAllowedToWin, prizeType, currentStep, actions, maxPlayers } = useGameContext()

  const halfNumberPlayers = Math.floor(maxPlayers * 0.5)
  const listOfAllowedWinners = [...range(1, halfNumberPlayers)]
  const selectedAllowedWinners = numberPlayersAllowedToWin > listOfAllowedWinners.length ? 1 : numberPlayersAllowedToWin

  const handleAllowedWinners = (value) => actions.setPrizeConfiguration(+value, prizeType, currentStep)

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Number of players allowed to win
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            Each player will win a proportional share of the prize pool
          </Text>
          {listOfAllowedWinners &&
            listOfAllowedWinners.map((winner, index) => {
              return (
                // TODO Remove filter but generate error on prizepool verification in smart contract if winners are odd (except 1)
                (index === 0 || index % 2 !== 0) && (
                  <SelectionCard
                    name={winner.toString()}
                    value={winner}
                    image={imageTest}
                    onChange={handleAllowedWinners}
                    isChecked={selectedAllowedWinners === winner}
                  >
                    <RowBetween>
                      <CommunityIcon mr="8px" />
                      <Text bold>{winner.toString()}</Text>
                      <Text>{'  Players'}</Text>
                    </RowBetween>
                  </SelectionCard>
                )
              )
            })}
        </CardBody>
      </Card>
    </>
  )
}

const PrizeTypeSelection = () => {
  const { prizeType: selectedPrizeType, numberPlayersAllowedToWin, currentStep, actions } = useGameContext()

  const handlePrizeType = (value) => {
    actions.setPrizeConfiguration(numberPlayersAllowedToWin, value, currentStep)
  }

  const prizeTypeSelection = ['STANDARD', 'ERC20', 'ERC721', 'ERC1155']

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Prize type
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            More choices soon !
          </Text>
          {prizeTypeSelection &&
            prizeTypeSelection.map((prizeType) => {
              return (
                <SelectionCard
                  name={prizeType}
                  value={prizeType}
                  image={imageTest}
                  onChange={handlePrizeType}
                  isChecked={selectedPrizeType === prizeType}
                  disabled={prizeType !== 'STANDARD'}
                >
                  <RowBetween>
                    <CommunityIcon mr="8px" />
                    <Text bold>{prizeType}</Text>
                  </RowBetween>
                </SelectionCard>
              )
            })}
        </CardBody>
      </Card>
    </>
  )
}

const PrizepoolConfiguration: React.FC = () => {
  const { actions, currentStep, numberPlayersAllowedToWin, prizeType } = useGameContext()
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
        <BackStepButton onClick={() => actions.previousStep(currentStep - 1)}>{t('Previous Step')}</BackStepButton>
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
