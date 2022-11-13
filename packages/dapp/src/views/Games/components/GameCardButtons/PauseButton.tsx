import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { usePauseGame } from 'views/Games/hooks/usePauseGame'

interface PauseButtonProps {
  address: string
}

const PauseButton: React.FC<React.PropsWithChildren<PauseButtonProps>> = ({ address }) => {
  const { t } = useTranslation()
  const { isPending, handlePause } = usePauseGame(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  return (
    <Button
      mt="8px"
      ml="auto"
      width="100%"
      variant="secondary"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handlePause}
    >
      {t('Pause game')}
    </Button>
  )
}

export default PauseButton
