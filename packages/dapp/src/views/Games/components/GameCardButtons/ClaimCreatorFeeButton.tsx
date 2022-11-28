import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button, AutoRenewIcon } from '@pancakeswap/uikit'
import { useClaimCreatorFee } from 'views/Games/hooks/useClaimCreatorFee'
import { formatEther } from '@ethersproject/units'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

interface ClaimCreatorFeeButtonProps {
  address: string
  creatorAmount: string
}

const ClaimCreatorFeeButton: React.FC<React.PropsWithChildren<ClaimCreatorFeeButtonProps>> = ({
  address,
  creatorAmount,
}) => {
  const { t } = useTranslation()
  const { chain } = useActiveWeb3React()
  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const { isPending, handleClaimCreatorFee } = useClaimCreatorFee(address)

  const isDisabledButton = useMemo(() => !address || isPending, [address, isPending])
  const claimAmount = parseFloat(formatEther(creatorAmount))

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
      {`${t('Claim creator fee')} : ${claimAmount} ${chainSymbol}`}
    </Button>
  )
}

export default ClaimCreatorFeeButton
