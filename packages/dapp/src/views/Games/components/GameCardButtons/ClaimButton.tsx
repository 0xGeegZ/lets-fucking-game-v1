import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimPrize } from 'views/Games/hooks/useClaimPrize'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

interface ClaimButtonProps {
  address: string
  roundId: BigNumber
}

const ClaimButton: React.FC<React.PropsWithChildren<ClaimButtonProps>> = ({ address, roundId }) => {
  const { t } = useTranslation()
  const { isPending, handleClaim } = useClaimPrize(address, EthersBigNumber.from(roundId))
  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  return (
    <Button
      ml="4px"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleClaim}
    >
      {t('Claim Prize')}
    </Button>
  )
}

export default ClaimButton
