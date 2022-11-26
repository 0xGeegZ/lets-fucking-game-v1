import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimTreasuryFee } from 'views/Games/hooks/useClaimTreasuryFee'

interface ClaimTreasuryFeeButtonProps {
  address: string
}

const ClaimTreasuryFeeButton: React.FC<React.PropsWithChildren<ClaimTreasuryFeeButtonProps>> = ({ address }) => {
  const { t } = useTranslation()
  const { isPending, handleClaimTreasuryFee } = useClaimTreasuryFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      variant="tertiary"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleClaimTreasuryFee}
    >
      {t('Claim treasury fee')}
    </Button>
  )
}

export default ClaimTreasuryFeeButton
