import { useEffect } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import Page from 'components/Layout/Page'
import { useProfile } from 'state/profile/hooks'
import PageLoader from 'components/Loader/PageLoader'
import { useRouter } from 'next/router'
import { SUPPORT_GAMES } from 'config/constants/supportChains'
import Header from './Header'
import GameCreationProvider from './contexts/GameCreationProvider'
import Steps from './Steps'

const GameCreation = () => {
  const { account } = useWeb3React()
  const { isInitialized, isLoading, hasProfile } = useProfile()
  const router = useRouter()

  //   useEffect(() => {
  //     if (account && hasProfile) {
  //       router.push(`/profile/${account.toLowerCase()}`)
  //     }
  //   }, [account, hasProfile, router])

  if (!isInitialized || isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <GameCreationProvider>
        <Page>
          <Header />
          <Steps />
        </Page>
      </GameCreationProvider>
    </>
  )
}

GameCreation.chains = SUPPORT_GAMES

export default GameCreation
