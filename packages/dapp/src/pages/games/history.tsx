import { useContext } from 'react'
import { SUPPORT_GAMES } from 'config/constants/supportChains'
import { GamesPageLayout, GamesContext } from 'views/Games'
import GameCard from 'views/Games/components/GameCard/GameCard'
import { getDisplayApr } from 'views/Games/components/getDisplayApr'
import { usePriceCakeBusd } from 'state/games/hooks'
import { useWeb3React } from '@pancakeswap/wagmi'

const GamesHistoryPage = () => {
  const { account } = useWeb3React()
  const { chosenGamesMemoized } = useContext(GamesContext)
  const cakePrice = usePriceCakeBusd()

  return (
    <>
      {chosenGamesMemoized.map((game) => (
        <GameCard
          key={game.pid}
          game={game}
          displayApr={getDisplayApr(game.apr, game.lpRewardsApr)}
          cakePrice={cakePrice}
          account={account}
          removed
        />
      ))}
    </>
  )
}

GamesHistoryPage.Layout = GamesPageLayout
GamesHistoryPage.chains = SUPPORT_GAMES

export default GamesHistoryPage
