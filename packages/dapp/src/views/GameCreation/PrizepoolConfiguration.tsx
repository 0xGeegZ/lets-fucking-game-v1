/* eslint-disable */
import { Card, CardBody, CommunityIcon, Flex, Heading, Text } from '@pancakeswap/uikit'
import { useContext } from 'react'

import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { GameCreationContext } from './contexts/GameCreationProvider'
import NextStepButton from './NextStepButton'
import SelectionCard from './SelectionCard'
import imageTest from '../../../public/images/chains/1.png'
import useGameCreation from 'views/GameCreation/contexts/hook'
import BackStepButton from './BackStepButton'

// TODO: Refacto by split components
const AllowedPlayersToWinSelection = () => {
  const { numberPlayersAllowedToWin: selectedAllowedNumber, prizeType, currentStep, actions } = useGameCreation()

  const handleAllowedWinners = (value) => {
    actions.setPrizeConfiguration(value, prizeType, currentStep)
  }

  const numberPlayers = 6
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
                  value={iteration.toString()}
                  image={imageTest}
                  onChange={handleAllowedWinners}
                  isChecked={selectedAllowedNumber.toString() === iteration.toString()}
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
  const { prizeType: selectedPrizeType, numberPlayersAllowedToWin, currentStep, actions } = useGameCreation()

  const handlePrizeType = (value) => {
    actions.setPrizeConfiguration(numberPlayersAllowedToWin, value, currentStep)
  }

  const prizeTypeSelection = ['Standart', 'ERC20', 'ERC721', 'ERC1155']

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Prize type
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            Make a choice !
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
                  disabled={prizeType === 'ERC1155' || prizeType === 'ERC721'}
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
  const { actions } = useContext(GameCreationContext)
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 2 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Prizepool  configuration')}
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
        <BackStepButton
          onClick={actions.previousStep} /* disabled={selectedNft.tokenId === null || !isApproved || isApproving} */
        >
          {t('Previous Step')}
        </BackStepButton>
        <NextStepButton
          onClick={actions.nextStep} /* disabled={selectedNft.tokenId === null || !isApproved || isApproving} */
        >
          {t('Next Step')}
        </NextStepButton>
      </Flex>
    </>
  )
}

export default PrizepoolConfiguration
