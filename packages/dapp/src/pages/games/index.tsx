import { useContext } from 'react'
import { SUPPORT_GAMES_TEST } from 'config/constants/supportChains'
import { GamesPageLayout, GamesContext } from 'views/Games'
import GameCard from 'views/Games/components/GameCard/GameCard'
import { useWeb3React } from '@pancakeswap/wagmi'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const GamesPage = () => {
  const { account } = useWeb3React()
  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const { chosenGamesMemoized } = useContext(GamesContext)
  return (
    <>
      {chosenGamesMemoized.map((game) => (
        // <GameCard key={`${chainSymbol}${game.id}`} game={game} account={account} />
        <GameCard key={game.id} game={game} account={account} />
      ))}
    </>
  )
}

GamesPage.Layout = GamesPageLayout

GamesPage.chains = SUPPORT_GAMES_TEST

export default GamesPage
