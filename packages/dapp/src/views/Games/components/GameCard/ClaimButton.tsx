import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimPrize } from 'views/Games/hooks/useClaimPrize'
import { BigNumber } from '@ethersproject/bignumber'

interface ClaimButtonProps {
  gameAddress: string
  roundId: BigNumber
}

const ClaimButton: React.FC<React.PropsWithChildren<ClaimButtonProps>> = ({ gameAddress, roundId }) => {
  const { t } = useTranslation()
  const { isPending, handleClaim } = useClaimPrize(gameAddress, roundId)
  const isDisabledButton = useMemo(() => !gameAddress || isPending, [gameAddress, isPending])

  return (
    <Button
      //   mt="8px"
      //   ml="4px"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleClaim}
    >
      {t('Claim Prize')}
    </Button>
  )
}

export default ClaimButton
