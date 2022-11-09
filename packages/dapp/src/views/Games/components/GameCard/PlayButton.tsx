import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { usePlayRound } from 'views/Games/hooks/usePlayRound'

interface PlayButtonProps {
  gameAddress: string
}

const PlayButton: React.FC<React.PropsWithChildren<PlayButtonProps>> = ({ gameAddress }) => {
  const { t } = useTranslation()
  const { isPending, handlePlay } = usePlayRound(gameAddress)

  const isDisabledButton = useMemo(() => !gameAddress || isPending, [gameAddress, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handlePlay}
    >
      {t('Play Round')}
    </Button>
  )
}

export default PlayButton
