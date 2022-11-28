import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimTreasuryFee } from 'views/Games/hooks/useClaimTreasuryFee'
import { formatEther } from '@ethersproject/units'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

interface ClaimTreasuryFeeButtonProps {
  address: string
  treasuryAmount: string
}

const ClaimTreasuryFeeButton: React.FC<React.PropsWithChildren<ClaimTreasuryFeeButtonProps>> = ({
  address,
  treasuryAmount,
}) => {
  const { t } = useTranslation()
  const { chain } = useActiveWeb3React()
  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const { isPending, handleClaimTreasuryFee } = useClaimTreasuryFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  const claimAmount = parseFloat(formatEther(treasuryAmount))

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
      {`${t('Claim treasury fee')} : ${claimAmount} ${chainSymbol}`}
    </Button>
  )
}

export default ClaimTreasuryFeeButton
