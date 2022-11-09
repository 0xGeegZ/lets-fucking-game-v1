import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useCreateGame } from 'views/GameCreation/hooks/useCreateGame'

// TODO USE TYPECHAIN INTERFACE ??
// TODO GUIGUI MOOVE IT TO TYPES
interface CreateGameButtonProps {
  currentStep: number
  houseEdge: number
  creatorEdge: number
  registrationAmount: number
  maxPlayers: number
  playTimeRange: number
  encodedCron: string
  numberPlayersAllowedToWin: number
  prizeType: NFT | BNB | 'STANDARD'
}

const CreateGameButton: React.FC<React.PropsWithChildren<CreateGameButtonProps>> = ({ game }) => {
  const { t } = useTranslation()
  const { isPending, handleCreateGame } = useCreateGame(game)

  const isDisabledButton = useMemo(() => !game || isPending, [game, isPending])

  return (
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
  )
}

export default CreateGameButton
