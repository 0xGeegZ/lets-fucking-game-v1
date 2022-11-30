import { useWeb3React } from '@pancakeswap/wagmi'
import Page from 'components/Layout/Page'
import PageLoader from 'components/Loader/PageLoader'
import Header from 'views/GameForm/components/Header'
import GameCreationProvider from 'views/GameForm/contexts/GameCreationProvider'
import Steps from 'views/GameForm/components/Steps'

const GameForm = () => {
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

export default GameForm
