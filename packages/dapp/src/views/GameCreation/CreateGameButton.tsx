import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon, Flex, Text, WarningIcon } from '@pancakeswap/uikit'
import { useCreateGame } from 'views/GameCreation/hooks/useCreateGame'
import Tooltip from 'views/Games/components/GameCardButtons/Tooltip'
import { BNB, NFT } from './contexts/types'

// TODO USE TYPECHAIN INTERFACE ??
// TODO GUIGUI MOOVE IT TO TYPES
interface CreateGameButtonProps {
  game: any
  // currentStep: number
  // treasuryFee: number
  // creatorFee: number
  // registrationAmount: number
  // maxPlayers: number
  // playTimeRange: number
  // encodedCron: string
  // numberPlayersAllowedToWin: number
  // prizeType: NFT | BNB | 'STANDARD'
}

const CreateGameButton: React.FC<React.PropsWithChildren<CreateGameButtonProps>> = ({ game }) => {
  const { t } = useTranslation()
  const { isPending, handleCreateGame } = useCreateGame(game)

  const {
    name,
    treasuryFee,
    registrationAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    numberPlayersAllowedToWin,
    prizeType,
  } = game

  const isGameFieldKO = useMemo(
    () =>
      !name ||
      !treasuryFee ||
      !registrationAmount ||
      !maxPlayers ||
      !playTimeRange ||
      !encodedCron ||
      !numberPlayersAllowedToWin ||
      !prizeType,
    [
      encodedCron,
      maxPlayers,
      name,
      numberPlayersAllowedToWin,
      playTimeRange,
      prizeType,
      registrationAmount,
      treasuryFee,
    ],
  )

  const isDisabledButton = useMemo(() => isGameFieldKO || isPending, [isGameFieldKO, isPending])

  return (
    <>
      <Button
        mt="8px"
        width="25%"
        ml="auto"
        disabled={isDisabledButton}
        endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
        onClick={handleCreateGame}
      >
        {t('Create Game')}
      </Button>

      {isGameFieldKO && (
        <>
          <Tooltip
            additionalStyle={{ color: 'failure' }}
            content={
              <Flex justifyContent="center" m="10px">
                <WarningIcon width="16px" color="failure" style={{ verticalAlign: 'middle' }} />
                <Text>{t('All fields are required')}</Text>
              </Flex>
            }
          />
        </>
      )}
    </>
  )
}

export default CreateGameButton
