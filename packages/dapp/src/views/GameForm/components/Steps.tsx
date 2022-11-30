import { useTranslation } from '@pancakeswap/localization'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import GameConfiguration from 'views/GameForm/components/Steps/GameConfiguration'
import NoWalletConnected from 'views/GameForm/components/Steps/WalletNotConnected'
import PrizepoolConfiguration from 'views/GameForm/components/Steps/PrizepoolConfiguration'
import Confirmation from 'views/GameForm/components/Steps/Confirmation'
import GameName from 'views/GameForm/components/Steps/GameName'
import GameAction from 'views/GameForm/components/Steps/GameAction'

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
    return <GameConfiguration />
  }

  if (currentStep === 2) {
    return <PrizepoolConfiguration />
  }

  if (currentStep === 3) {
    return <GameAction />
  }

  if (currentStep === 4) {
    return <Confirmation />
  }

  return null
}

export default Steps
