import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useUnpauseGame } from 'views/Games/hooks/useUnpauseGame'

interface UnpauseButtonProps {
  address: string
}

const UnpauseButton: React.FC<React.PropsWithChildren<UnpauseButtonProps>> = ({ address }) => {
  const { t } = useTranslation()
  const { isPending, handleUnpause } = useUnpauseGame(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

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
      {t('Unpause game')}
    </Button>
  )
}

export default UnpauseButton
