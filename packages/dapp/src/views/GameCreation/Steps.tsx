import { useContext } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useWeb3React } from '@pancakeswap/wagmi'
import GameConfirmationAndContractCreation from './GameConfirmationAndContractCreation'
import GameCreation from './GameCreation'
import { GameCreationContext } from './contexts/GameCreationProvider'
import NoWalletConnected from './WalletNotConnected'
import PrizepoolConfiguration from './PrizepoolConfiguration'
import Confirmation from './Confirmation'

const Steps = () => {
  const { t } = useTranslation()
  const { isInitialized, currentStep } = useContext(GameCreationContext)
  const { account } = useWeb3React()

  if (!account) {
    return <NoWalletConnected />
  }

  if (!isInitialized) {
    return <div>{t('Loading...')}</div>
  }

  if (currentStep === 0) {
    return <GameCreation />
  }

  if (currentStep === 1) {
    return <PrizepoolConfiguration />
  }

  if (currentStep === 2) {
    return <GameConfirmationAndContractCreation />
  }

  if (currentStep === 3) {
    return <Confirmation />
  }

  return null
}

export default Steps
