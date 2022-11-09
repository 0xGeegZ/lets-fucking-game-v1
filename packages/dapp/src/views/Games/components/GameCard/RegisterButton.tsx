import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useRegisterForGame } from 'views/Games/hooks/useRegisterForGame'

interface RegisterButtonProps {
  gameAddress: string
  registrationAmount: BigNumber
  gameCreationAmount: BigNumber
}

const RegisterButton: React.FC<React.PropsWithChildren<RegisterButtonProps>> = ({
  gameAddress,
  registrationAmount,
  gameCreationAmount,
}) => {
  const { t } = useTranslation()
  const { isPending, handleRegister } = useRegisterForGame(gameAddress, registrationAmount, gameCreationAmount)

  const isDisabledButton = useMemo(() => !gameAddress || isPending, [gameAddress, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleRegister}
    >
      {t('Register')}
    </Button>
  )
}

export default RegisterButton
