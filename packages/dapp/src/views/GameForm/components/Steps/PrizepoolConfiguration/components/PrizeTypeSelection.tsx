import { Card, CardBody, CommunityIcon, Flex, Heading, Text } from '@pancakeswap/uikit'
import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import SelectionCard from 'views/GameForm/components/SelectionCard'
import imageTest from '../../../../../../../public/images/chains/1.png'

const PrizeTypeSelection = () => {
  const { t } = useTranslation()

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
            {t('Prize type')}
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            {t('More choices soon !')}
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

export default PrizeTypeSelection
