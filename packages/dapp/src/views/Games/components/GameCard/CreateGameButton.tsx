import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useCreateGame } from 'views/Games/hooks/useCreateGame'

interface RegisterButtonProps {
  gameAddress: string
}

const RegisterButton: React.FC<React.PropsWithChildren<RegisterButtonProps>> = ({ gameAddress }) => {
  const { t } = useTranslation()
  const { isPending, handleCreateGame } = useCreateGame(gameAddress)

  const isDisabledButton = useMemo(() => !gameAddress || isPending, [gameAddress, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleCreateGame}
    >
      {t('Create Game')}
    </Button>
  )
}

export default RegisterButton
