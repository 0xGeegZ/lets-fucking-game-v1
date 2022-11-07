import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'
import { Button, Modal, AutoRenewIcon, Message, MessageText, Box, ModalBody } from '@pancakeswap/uikit'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from '@pancakeswap/localization'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { ChainId } from '@pancakeswap/sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

interface WithdrawModalProps {
  max: BigNumber
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
  showActiveBooster?: boolean
}

const WithdrawModal: React.FC<React.PropsWithChildren<WithdrawModalProps>> = ({
  onConfirm,
  onDismiss,
  max,
  tokenName = '',
  showActiveBooster,
}) => {
  const [val, setVal] = useState('')
  const { chainId } = useActiveWeb3React()
  const [pendingTx, setPendingTx] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const valNumber = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  return (
    <Modal title={t('Unstake LP tokens')} onDismiss={onDismiss}>
      <ModalBody width={['100%', '100%', '100%', '420px']}>
        <ModalInput
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          value={val}
          max={fullBalance}
          symbol={tokenName}
          inputTitle={t('Unstake')}
        />
        {showActiveBooster ? (
          <Message variant="warning" mt="8px">
            <MessageText>
              {t('The yield booster multiplier will be updated based on the latest staking conditions.')}
            </MessageText>
          </Message>
        ) : null}
        {chainId !== ChainId.BSC && chainId !== ChainId.BSC_TESTNET && (
          <Box mt="15px">
            <Message variant="warning">
              <MessageText>
                {t('For safety, cross-chain transactions will take around 30 minutes to confirm.')}
              </MessageText>
            </Message>
          </Box>
        )}
        <ModalActions>
          <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
            {t('Cancel')}
          </Button>
          {pendingTx ? (
            <Button width="100%" isLoading={pendingTx} endIcon={<AutoRenewIcon spin color="currentColor" />}>
              {t('Confirming')}
            </Button>
          ) : (
            <Button
              width="100%"
              disabled={!valNumber.isFinite() || valNumber.eq(0) || valNumber.gt(fullBalanceNumber)}
              onClick={async () => {
                setPendingTx(true)
                await onConfirm(val)
                onDismiss?.()
                setPendingTx(false)
              }}
            >
              {t('Confirm')}
            </Button>
          )}
        </ModalActions>
      </ModalBody>
    </Modal>
  )
}

export default WithdrawModal
