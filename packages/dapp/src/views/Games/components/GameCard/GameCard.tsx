import { useTranslation } from '@pancakeswap/localization'
import { Card, Flex, Skeleton, Text } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { multiChainPaths } from 'state/info/constant'
import BoostedApr from 'views/Farms/components/YieldBooster/components/BoostedApr'
import { ChainId, WBNB } from '@pancakeswap/sdk'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { GameWithStakedValue } from '../types'
import ApyButton from './ApyButton'
import CardActionsContainer from './CardActionsContainer'
import CardHeading from './CardHeading'
import DetailsSection from './DetailsSection'

const StyledCard = styled(Card)`
  align-self: baseline;
  max-width: 100%;
  margin: 0 0 24px 0;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 350px;
    margin: 0 12px 46px;
  }
`

const GameCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface GameCardProps {
  game: GameWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
  originalLiquidity?: BigNumber
}

const GameCard: React.FC<React.PropsWithChildren<GameCardProps>> = ({
  game,
  displayApr,
  removed,
  cakePrice,
  account,
  originalLiquidity,
}) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const liquidity =
    game?.liquidity && originalLiquidity?.gt(0) ? game.liquidity.plus(originalLiquidity) : game.liquidity

  const totalValueFormatted =
    liquidity && liquidity.gt(0)
      ? `$${liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''

  const lpLabel = 'lpLabel' // game.lpSymbol && game.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const earnLabel = t('CAKE + Fees') // game.dual ? game.dual.earnLabel : t('CAKE + Fees')

  const liquidityUrlPathParts = 'getLiquidityUrlPathParts({'
  // const liquidityUrlPathParts = getLiquidityUrlPathParts({
  //   quoteTokenAddress: game.quoteToken.address,
  //   tokenAddress: game.token.address,
  //   chainId,
  // })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  // const { lpAddress } = game
  const lpAddress = getMasterChefAddress(chainId)
  // const isPromotedGame = game.token.symbol === 'CAKE'
  const isPromotedGame = true
  const { stakedBalance, proxy, tokenBalance } = game.userData

  const toggleExpandableSection = useCallback(() => {
    setShowExpandableSection((prev) => !prev)
  }, [])

  return (
    <StyledCard isActive={isPromotedGame}>
      <GameCardInnerContainer>
        <CardHeading
          lpLabel={lpLabel}
          multiplier="40"
          token={WBNB[chainId]}
          quoteToken={WBNB[chainId]}
          isCommunityGame={false}
          boosted
          isStable={false}
        />
        {!removed && (
          <Flex justifyContent="space-between" alignItems="center">
            <Text>{t('APR')}:</Text>
            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              {game.apr ? (
                <>
                  {!game.contractPaused ? (
                    <BoostedApr
                      mr="4px"
                      lpRewardsApr={game.lpRewardsApr}
                      apr={game.apr}
                      pid={1}
                      lpTotalSupply={new BigNumber(0)}
                      userBalanceInFarm={new BigNumber(0)}
                    />
                  ) : null}
                  <ApyButton
                    variant="text-and-button"
                    pid={1}
                    lpTokenPrice={new BigNumber(0)}
                    lpSymbol="LFG"
                    multiplier="40"
                    lpLabel="lpLabel"
                    addLiquidityUrl="addLiquidityUrl"
                    cakePrice={new BigNumber(5)}
                    apr={15}
                    displayApr={displayApr}
                    lpRewardsApr={game.lpRewardsApr}
                    strikethrough
                    useTooltipText
                    boosted
                  />
                </>
              ) : (
                <Skeleton height={24} width={80} />
              )}
            </Text>
          </Flex>
        )}
        <Flex justifyContent="space-between">
          <Text>{t('Earn')}:</Text>
          <Text bold>{earnLabel}</Text>
        </Flex>
        <CardActionsContainer
          game={game}
          lpLabel={lpLabel}
          account={account}
          addLiquidityUrl={addLiquidityUrl}
          displayApr={displayApr}
        />
      </GameCardInnerContainer>

      <ExpandingWrapper>
        <ExpandableSectionButton onClick={toggleExpandableSection} expanded={showExpandableSection} />
        {showExpandableSection && (
          <DetailsSection
            removed={removed}
            bscScanAddress={getBlockExploreLink(lpAddress, 'address', chainId)}
            infoAddress={`/info${multiChainPaths[chainId]}/pools/${lpAddress}`}
            totalValueFormatted={totalValueFormatted}
            lpLabel={lpLabel}
            addLiquidityUrl={addLiquidityUrl}
            isCommunity
            auctionHostingEndDate="tomorrow"
          />
        )}
      </ExpandingWrapper>
    </StyledCard>
  )
}

export default GameCard
