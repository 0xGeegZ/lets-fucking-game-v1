import { useState } from 'react'
import { Modal, Box } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useBUSDCakeAmount } from 'hooks/useBUSDPrice'
import { useTranslation } from '@pancakeswap/localization'
import _toNumber from 'lodash/toNumber'
import BigNumber from 'bignumber.js'
import { GenericModalProps } from '../types'
import BalanceField from '../Common/BalanceField'
import LockedBodyModal from '../Common/LockedModalBody'
import RoiCalculatorModalProvider from './RoiCalculatorModalProvider'

const LockedStakeModal: React.FC<React.PropsWithChildren<GenericModalProps>> = ({
  onDismiss,
  currentBalance,
  stakingToken,
  stakingTokenBalance,
}) => {
  const { theme } = useTheme()
  const [lockedAmount, setLockedAmount] = useState('')
  const { t } = useTranslation()

  const usdValueStaked = useBUSDCakeAmount(_toNumber(lockedAmount))

  return (
    <RoiCalculatorModalProvider lockedAmount={lockedAmount}>
      <Modal title={t('Lock CAKE')} onDismiss={onDismiss} headerBackground={theme.colors.gradientCardHeader}>
        <Box mb="16px">
          <BalanceField
            stakingAddress={stakingToken.address}
            stakingSymbol={stakingToken.symbol}
            stakingDecimals={stakingToken.decimals}
            lockedAmount={lockedAmount}
            usedValueStaked={usdValueStaked}
            stakingMax={currentBalance}
            setLockedAmount={setLockedAmount}
            stakingTokenBalance={stakingTokenBalance}
          />
        </Box>
        <LockedBodyModal
          currentBalance={currentBalance}
          stakingToken={stakingToken}
          onDismiss={onDismiss}
          lockedAmount={new BigNumber(lockedAmount)}
        />
      </Modal>
    </RoiCalculatorModalProvider>
  )
}

export default LockedStakeModal
