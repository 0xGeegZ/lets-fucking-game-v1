import { useEffect } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import Page from 'components/Layout/Page'
import PageLoader from 'components/Loader/PageLoader'
import { useRouter } from 'next/router'
import { SUPPORT_GAMES } from 'config/constants/supportChains'
import Header from './Header'
import GameCreationProvider from './contexts/GameCreationProvider'
import Steps from './Steps'

const GameCreation = () => {
  const { account } = useWeb3React()

  if (!account) return <PageLoader />

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

export default GameCreation
