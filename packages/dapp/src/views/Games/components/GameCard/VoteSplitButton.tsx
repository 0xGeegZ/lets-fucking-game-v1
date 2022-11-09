import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useVoteToSplitPot } from 'views/Games/hooks/useVoteToSplitPot'

interface VoteSplitButtonProps {
  gameAddress: string
}

const VoteSplitButton: React.FC<React.PropsWithChildren<VoteSplitButtonProps>> = ({ gameAddress }) => {
  const { t } = useTranslation()
  const { isPending, handleVote } = useVoteToSplitPot(gameAddress)

  // TODO add check if remaining player count is less than 50%
  const isDisabledButton = useMemo(() => !gameAddress || isPending, [gameAddress, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleVote}
    >
      {t('Vote To Split Pot')}
    </Button>
  )
}

export default VoteSplitButton
