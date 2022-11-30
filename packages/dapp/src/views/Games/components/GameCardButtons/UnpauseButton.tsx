import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useUnpauseGame } from 'views/Games/hooks/useUnpauseGame'

interface UnpauseButtonProps {
  address: string
  isInProgress: boolean
}

const UnpauseButton: React.FC<React.PropsWithChildren<UnpauseButtonProps>> = ({ address, isInProgress }) => {
  const { t } = useTranslation()
  const { isPending, handleUnpause } = useUnpauseGame(address)

  const isDisabledButton = useMemo(() => !address || isPending || isInProgress, [address, isInProgress, isPending])

  return (
    <Button
      mt="8px"
      ml="auto"
      width="100%"
      variant="secondary"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleUnpause}
    >
      {t('Resume game')}
    </Button>
  )
}

export default UnpauseButton
