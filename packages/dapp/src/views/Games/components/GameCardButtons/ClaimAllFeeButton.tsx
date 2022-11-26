import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimAllFee } from 'views/Games/hooks/useClaimAllFee'

interface ClaimAllFeeButtonProps {
  address: string
}

const ClaimAllFeeButton: React.FC<React.PropsWithChildren<ClaimAllFeeButtonProps>> = ({ address }) => {
  const { t } = useTranslation()
  const { isPending, handleClaimAllFee } = useClaimAllFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      variant="tertiary"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleClaimAllFee}
    >
      {t('Claim creator and treasury fee')}
    </Button>
  )
}

export default ClaimAllFeeButton
