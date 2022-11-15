import { useContext } from 'react'
import { SUPPORT_GAMES_TEST } from 'config/constants/supportChains'
import { GamesPageLayout, GamesContext } from 'views/Games'
import GameCard from 'views/Games/components/GameCard/GameCard'
import { useWeb3React } from '@pancakeswap/wagmi'

const GamesHistoryPage = () => {
  const { account } = useWeb3React()
  const { chosenGamesMemoized } = useContext(GamesContext)

  return (
    <>
      {chosenGamesMemoized.map((game) => (
        <GameCard key={game.id} game={game} account={account} />
      ))}
    </>
  )
}

GamesHistoryPage.Layout = GamesPageLayout
GamesHistoryPage.chains = SUPPORT_GAMES_TEST

export default GamesHistoryPage
