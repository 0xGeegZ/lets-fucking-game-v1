import { Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import NextStepButton from './NextStepButton'
import useGameCreation from './contexts/hook'
import BackStepButton from './BackStepButton'

const BulletList = styled.ul`
  list-style-type: none;
  margin-top: 16px;
  padding: 0;
  li {
    margin: 0;
    padding: 0;
  }
  li::before {
    content: '•';
    margin-right: 4px;
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  li::marker {
    font-size: 12px;
  }
`

const RecapConfigGame = () => {
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
  } = useGameCreation()

  console.log('check state redux : ', useGameCreation())

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Game confirmation & contract creation
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            Almost complete !
          </Text>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            pr={[null, null, '4px']}
            pl={['4px', null, '0']}
            mb="8px"
          >
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    House edge: {houseEdge * 100} %
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    Creator edge: {creatorEdge * 100} %
                  </Text>
                </li>
              </BulletList>
            </Flex>

            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {registrationAmount.toString()} BNB
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {maxPlayers} players max
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {playTimeRange} for play time range
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {encodedCron} is the selected encodedCron
                  </Text>
                </li>
              </BulletList>
            </Flex>

            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {numberPlayersAllowedToWin} players allowed to win
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={1.1}>
                    {prizeType} is the type of prize to upload
                  </Text>
                </li>
              </BulletList>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </>
  )
}

const GameConfirmationAndContractCreation: React.FC<React.PropsWithChildren> = () => {
  const { actions } = useGameCreation()
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 3 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Game confirmation and contract creation')}
      </Heading>
      <RecapConfigGame />
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

export default GameConfirmationAndContractCreation
