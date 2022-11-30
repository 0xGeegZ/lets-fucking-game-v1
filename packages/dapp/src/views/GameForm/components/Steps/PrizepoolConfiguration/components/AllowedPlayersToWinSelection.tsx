import { Card, CardBody, CommunityIcon, Heading, Text } from '@pancakeswap/uikit'
import { RowBetween } from 'components/Layout/Row'
import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import { range } from 'utils'
import SelectionCard from 'views/GameForm/components/SelectionCard'
import { useState } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import imageTest from '../../../../../../../public/images/chains/1.png'

const AllowedPlayersToWinSelection = () => {
  const { chain } = useActiveWeb3React()
  const { t } = useTranslation()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const [isUpdated, setIsUpdated] = useState(false)

  const { game, numberPlayersAllowedToWin, prizeType, currentStep, actions, maxPlayers, freeGamePrizepoolAmount } =
    useGameContext()

  const halfNumberPlayers = Math.floor(maxPlayers * 0.5)

  //    const halfNumberPlayers = Math.floor(maxPlayers * 0.5)
  //    const maxWinnersLimit = isGamePrizeLength
  //      ? halfNumberPlayers - game.prizes.length > 0
  //        ? halfNumberPlayers - game.prizes.length
  //        : 1
  //      : halfNumberPlayers

  const listOfAllowedWinners = [...range(1, halfNumberPlayers)]

  const selectedAllowedWinners = numberPlayersAllowedToWin > listOfAllowedWinners.length ? 1 : numberPlayersAllowedToWin

  const isGamePrizeLength = game && !isUpdated && game.prizes && game.prizes.length
  const defaultSelectedWinners = isGamePrizeLength ? game.prizes.length : selectedAllowedWinners

  const handleAllowedWinners = (value) => {
    setIsUpdated(true)
    actions.setPrizeConfiguration(+value, prizeType, currentStep)
  }

  if (isGamePrizeLength) handleAllowedWinners(listOfAllowedWinners[defaultSelectedWinners - 1])

  return (
    <>
      <Card mb="24px">
        <CardBody>
          <Heading as="h4" scale="lg" mb="8px">
            {t('Number of players allowed to win')}
          </Heading>

          {game ? (
            <>
              {game.prizepool !== freeGamePrizepoolAmount || (game && defaultSelectedWinners !== game.prizes.length) ? (
                <Text as="p" color="warning" mb="24px">
                  This will add {defaultSelectedWinners} winner(s) to current {game.prizes.length} winner(s) and share
                  the prizepool {freeGamePrizepoolAmount} {chainSymbol} between those new winner(s)
                </Text>
              ) : (
                <Text as="p" color="textSubtle" mb="24px">
                  {t('Number of players that will win, based on current configuration.')}
                </Text>
              )}
            </>
          ) : (
            <Text as="p" color="textSubtle" mb="24px">
              {t('Each player will win a proportional share of the prize pool.')}
            </Text>
          )}

          {listOfAllowedWinners &&
            listOfAllowedWinners.map((winner, index) => {
              return (
                // TODO Remove filter but generate error on prizepool verification in smart contract if winners are odd (except 1)
                (index === 0 || index % 2 !== 0 || index + 1 === defaultSelectedWinners) && (
                  // (game ? index >= game?.prizes?.length - 1 : true) &&
                  <SelectionCard
                    name={winner.toString()}
                    value={winner}
                    image={imageTest}
                    onChange={handleAllowedWinners}
                    isChecked={defaultSelectedWinners === winner}
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

export default AllowedPlayersToWinSelection
