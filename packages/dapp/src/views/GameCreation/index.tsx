import { useWeb3React } from '@pancakeswap/wagmi'
import Page from 'components/Layout/Page'
import PageLoader from 'components/Loader/PageLoader'
import Header from 'views/GameCreation/components//Header'
import GameCreationProvider from 'views/GameCreation/contexts/GameCreationProvider'
import Steps from 'views/GameCreation/Steps'

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
