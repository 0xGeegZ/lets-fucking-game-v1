import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useRegisterForGame } from 'views/Games/hooks/useRegisterForGame'
import BigNumber from 'bignumber.js'

interface RegisterButtonProps {
  address: string
  registrationAmount: BigNumber
  isDisabled: boolean
}

const RegisterButton: React.FC<React.PropsWithChildren<RegisterButtonProps>> = ({
  address,
  registrationAmount,
  isDisabled,
}) => {
  const { t } = useTranslation()

  const { isPending, handleRegister } = useRegisterForGame(address, registrationAmount)

  const isDisabledButton = useMemo(() => !address || isPending || isDisabled, [address, isPending, isDisabled])

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
