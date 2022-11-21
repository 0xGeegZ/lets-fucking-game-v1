import { useContext } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import GameConfirmationAndContractCreation from './GameConfirmationAndContractCreation'
import GameCreation from './GameCreation'
import NoWalletConnected from './WalletNotConnected'
import PrizepoolConfiguration from './PrizepoolConfiguration'
import Confirmation from './Confirmation'
import GameName from './GameName'

const Steps = () => {
  const { t } = useTranslation()
  const { isInitialized, currentStep } = useGameContext()
  const { account } = useWeb3React()

  if (!account) {
    return <NoWalletConnected />
  }

  if (!isInitialized) {
    return <div>{t('Loading...')}</div>
  }

  if (currentStep === 0) {
    return <GameName />
  }

  if (currentStep === 1) {
    return <GameCreation />
  }

  if (currentStep === 2) {
    return <PrizepoolConfiguration />
  }

  if (currentStep === 3) {
    return <GameConfirmationAndContractCreation />
  }

  if (currentStep === 4) {
    return <Confirmation />
  }

  return null
}

export default Steps
