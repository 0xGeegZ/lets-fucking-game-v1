/* eslint-disable */
import { Card, CardBody, CommunityIcon, Flex, Heading, Text } from '@pancakeswap/uikit'
import { useContext } from 'react'

import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { GameCreationContext } from './contexts/GameCreationProvider'
import NextStepButton from './NextStepButton'
import SelectionCard from './SelectionCard'
import imageTest from '../../../public/images/chains/1.png'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import BackStepButton from './BackStepButton'

// TODO: Refacto by split components
const AllowedPlayersToWinSelection = () => {
  const { numberPlayersAllowedToWin: selectedAllowedNumber, prizeType, currentStep, actions } = useGameContext()

  const handleAllowedWinners = (value) => {
    actions.setPrizeConfiguration(+value, prizeType, currentStep)
  }

  // TODO get number of player dynamically
  const numberPlayers = 10
  let halfNumberPlayers
  const listOfAllowedNumber = []
  if (numberPlayers % 2 === 0) {
    halfNumberPlayers = numberPlayers / 2
  } else {
    halfNumberPlayers = numberPlayers / 2 - 0.5
  }
  for (let i = 0; i < halfNumberPlayers; i++) {
    listOfAllowedNumber.push(i + 1)
  }

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Number of players allowed to win
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            Make a choice !
          </Text>
          {listOfAllowedNumber &&
            listOfAllowedNumber.map((iteration) => {
              return (
                <SelectionCard
                  name={iteration.toString()}
                  value={iteration}
                  image={imageTest}
                  onChange={handleAllowedWinners}
                  isChecked={selectedAllowedNumber === iteration}
                >
                  <RowBetween>
                    <CommunityIcon mr="8px" />
                    <Text bold>{iteration.toString()}</Text>
                    <Text>{'  Players'}</Text>
                  </RowBetween>
                </SelectionCard>
              )
            })}
        </CardBody>
      </Card>
    </>
  )
}

// TODO: Refacto by split components
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
  const { actions, currentStep, numberPlayersAllowedToWin, prizeType } = useContext(GameCreationContext)
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
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
