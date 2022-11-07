import { useContext } from 'react'
import { SUPPORT_GAMES } from 'config/constants/supportChains'
import { GamesPageLayout, GamesContext } from 'views/Games'
import GameCard from 'views/Games/components/GameCard/GameCard'
import { getDisplayApr } from 'views/Games/components/getDisplayApr'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useWeb3React } from '@pancakeswap/wagmi'
import ProxyFarmContainer, {
  YieldBoosterStateContext,
} from 'views/Farms/components/YieldBooster/components/ProxyFarmContainer'

const ProxyGameCardContainer = ({ farm }) => {
  const { account } = useWeb3React()
  const cakePrice = usePriceCakeBusd()

  const { proxyFarm, shouldUseProxyFarm } = useContext(YieldBoosterStateContext)
  const finalGame = shouldUseProxyFarm ? proxyFarm : farm

  return (
    <GameCard
      key={finalGame.pid}
      game={finalGame}
      displayApr={getDisplayApr(finalGame.apr, finalGame.lpRewardsApr)}
      cakePrice={cakePrice}
      account={account}
      removed={false}
    />
  )
}

const GamesPage = () => {
  const { account } = useWeb3React()
  const { chosenGamesMemoized } = useContext(GamesContext)
  const cakePrice = usePriceCakeBusd()
  return (
    <>
      {chosenGamesMemoized.map((farm) =>
        farm.boosted ? (
          <ProxyFarmContainer farm={farm} key={farm.pid}>
            <ProxyGameCardContainer farm={farm} />
          </ProxyFarmContainer>
        ) : (
          <GameCard
            key={farm.pid}
            game={farm}
            displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
            cakePrice={cakePrice}
            account={account}
            removed={false}
          />
        ),
      )}
    </>
  )
}

GamesPage.Layout = GamesPageLayout

GamesPage.chains = SUPPORT_GAMES

export default GamesPage
