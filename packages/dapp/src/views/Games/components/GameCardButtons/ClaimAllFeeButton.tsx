import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimAllFee } from 'views/Games/hooks/useClaimAllFee'
import { formatEther } from '@ethersproject/units'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

interface ClaimAllFeeButtonProps {
  address: string
  treasuryAmount: string
  creatorAmount: string
}

const ClaimAllFeeButton: React.FC<React.PropsWithChildren<ClaimAllFeeButtonProps>> = ({
  address,
  treasuryAmount,
  creatorAmount,
}) => {
  const { t } = useTranslation()
  const { chain } = useActiveWeb3React()
  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const { isPending, handleClaimAllFee } = useClaimAllFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])

  const claimAmount = parseFloat(formatEther(Number(treasuryAmount) + Number(creatorAmount)))
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
      {`${t('Claim creator and treasury fee')} : ${claimAmount} ${chainSymbol}`}
    </Button>
  )
}

export default ClaimAllFeeButton
