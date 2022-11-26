import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimCreatorFee } from 'views/Games/hooks/useClaimCreatorFee'

interface ClaimCreatorFeeButtonProps {
  address: string
}

const ClaimCreatorFeeButton: React.FC<React.PropsWithChildren<ClaimCreatorFeeButtonProps>> = ({ address }) => {
  const { t } = useTranslation()
  const { isPending, handleClaimCreatorFee } = useClaimCreatorFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  return (
    <Button
      mt="8px"
      width="100%"
      ml="auto"
      variant="tertiary"
      disabled={isDisabledButton}
      endIcon={isPending ? <AutoRenewIcon spin color="currentColor" /> : null}
      onClick={handleClaimCreatorFee}
    >
      {t('Claim creator fee')}
    </Button>
  )
}

export default ClaimCreatorFeeButton
