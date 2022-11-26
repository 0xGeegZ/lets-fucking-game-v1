import { useTranslation } from '@pancakeswap/localization'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'
import GameCreation from 'views/GameCreation/components/Steps/GameCreation'
import NoWalletConnected from 'views/GameCreation/components/Steps/WalletNotConnected'
import PrizepoolConfiguration from 'views/GameCreation/components/Steps/PrizepoolConfiguration'
import Confirmation from 'views/GameCreation/components/Steps/Confirmation'
import GameName from 'views/GameCreation/components/Steps/GameName'
import GameConfirmationAndContractCreation from 'views/GameCreation/components/Steps/GameConfirmationAndContractCreation'

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
