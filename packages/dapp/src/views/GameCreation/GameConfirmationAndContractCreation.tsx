import { Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'

import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import NextStepButton from './NextStepButton'

import BackStepButton from './BackStepButton'
import CreateGameButton from './CreateGameButton'

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
    treasuryFee,
    creatorFee,
    registrationAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    numberPlayersAllowedToWin,
    prizeType,
  } = useGameContext()

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            Confirm your game configuration
          </Heading>
          <Text as="p" color="textSubtle" mb="24px">
            You could update configuration later if game is not in progress
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
                  <Text textAlign="center" color="textSubtle" display="inline">
                    Registration amount : {registrationAmount.toString()} BNB
                  </Text>
                </li>
                <li>
                  <Text textAlign="center" color="textSubtle" display="inline">
                    Maximum players : {maxPlayers}
                  </Text>
                </li>
              </BulletList>
            </Flex>
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text textAlign="center" color="textSubtle" display="inline">
                    Daily play time range : {playTimeRange}H
                  </Text>
                </li>
                <li>
                  <Text textAlign="center" color="textSubtle" display="inline">
                    {/* // TODO GUIGUI HANDLE CRON TO HUMAN READABLE */}
                    Selected Cron : {encodedCron}
                  </Text>
                </li>
              </BulletList>
            </Flex>
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text textAlign="center" color="textSubtle" display="inline">
                    Winners : {numberPlayersAllowedToWin}
                  </Text>
                </li>
                <li>
                  <Text textAlign="center" color="textSubtle" display="inline">
                    Prize type : {prizeType}
                  </Text>
                </li>
              </BulletList>
            </Flex>
            <Flex width="max-content" style={{ gap: '4px' }} flexDirection="column">
              <BulletList>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline" lineHeight={2.5}>
                    Treasury fee : {treasuryFee / 100} %
                  </Text>
                </li>
                <li>
                  <Text fontSize="12px" textAlign="center" color="textSubtle" display="inline">
                    Creator fee: {creatorFee / 100} %
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
  const { actions, ...game } = useGameContext()
  const { t } = useTranslation()

  return (
    <>
      <Text fontSize="20px" color="textSubtle" bold>
        {t('Step %num%', { num: 3 })}
      </Text>
      <Heading as="h3" scale="xl" mb="24px">
        {t('Contract creation')}
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
        <CreateGameButton game={game} />
      </Flex>
    </>
  )
}

export default GameConfirmationAndContractCreation
