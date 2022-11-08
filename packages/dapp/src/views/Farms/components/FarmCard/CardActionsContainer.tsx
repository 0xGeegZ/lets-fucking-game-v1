import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text, Button } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useContext } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import BoostedAction from 'views/Farms/components/YieldBooster/components/BoostedAction'
import { YieldBoosterStateContext } from 'views/Farms/components/YieldBooster/components/ProxyFarmContainer'
import { HarvestActionContainer, ProxyHarvestActionContainer } from '../FarmTable/Actions/HarvestAction'
import { ProxyStakedContainer, StakedContainer } from '../FarmTable/Actions/StakedAction'
import { FarmWithStakedValue } from '../types'
import HarvestAction from './HarvestAction'
import StakeAction from './StakeAction'

const Action = styled.div`
  padding-top: 16px;
`

const ActionContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string
  addLiquidityUrl?: string
  lpLabel?: string
  displayApr?: string
}

const CardActions: React.FC<React.PropsWithChildren<FarmCardActionsProps>> = ({
  farm,
  account,
  addLiquidityUrl,
  lpLabel,
  displayApr,
}) => {
  const { t } = useTranslation()
  const { pid, token, quoteToken, vaultPid, lpSymbol, lpAddress } = farm
  const { earnings } = farm.userData || {}
  const { shouldUseProxyFarm } = useContext(YieldBoosterStateContext)
  const isReady = farm.multiplier !== undefined
  const { stakedBalance, tokenBalance, proxy } = farm.userData

  return (
    <Action>
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          CAKE
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Earned')}
        </Text>
      </Flex>
      {shouldUseProxyFarm ? (
        <ProxyHarvestActionContainer
          lpAddress={lpAddress}
          earnings={earnings}
          pid={pid}
          vaultPid={vaultPid}
          token={token}
          quoteToken={quoteToken}
          lpSymbol={lpSymbol}
        >
          {(props) => <HarvestAction {...props} />}
        </ProxyHarvestActionContainer>
      ) : (
        <HarvestActionContainer
          earnings={earnings}
          pid={pid}
          vaultPid={vaultPid}
          token={token}
          quoteToken={quoteToken}
          lpSymbol={lpSymbol}
        >
          {(props) => <HarvestAction {...props} />}
        </HarvestActionContainer>
      )}
      {farm.boosted && (
        <BoostedAction
          title={(status) => (
            <Flex>
              <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
                {t('Yield Booster')}
              </Text>
              <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
                {status}
              </Text>
            </Flex>
          )}
          desc={(actionBtn) => <ActionContainer>{actionBtn}</ActionContainer>}
          farmPid={farm.pid}
          lpTotalSupply={farm.lpTotalSupply}
          userBalanceInFarm={
            (stakedBalance.plus(tokenBalance).gt(0)
              ? stakedBalance.plus(tokenBalance)
              : proxy?.stakedBalance.plus(proxy?.tokenBalance)) ?? new BigNumber(0)
          }
        />
      )}
      {isReady ? (
        <Flex>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
            {farm.lpSymbol}
          </Text>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('Staked')}
          </Text>
        </Flex>
      ) : (
        <Skeleton width={80} height={18} mb="4px" />
      )}

      {/* TODO Remove after integration phase */}
      <Link href="/games/1" passHref>
        <Button as="a" id="showGameDetails" mt="8px" width="100%">
          {t('Show Game Details')}
        </Button>
      </Link>

      {/* TODO REACTIVATE after integration phase */}
      {/* {!account ? (
        <ConnectWalletButton mt="8px" width="100%" />
      ) : shouldUseProxyFarm ? (
        <ProxyStakedContainer {...farm} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
          {(props) => <StakeAction {...props} />}
        </ProxyStakedContainer>
      ) : (
        <StakedContainer {...farm} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
          {(props) => <StakeAction {...props} />}
        </StakedContainer>
      )} */}
    </Action>
  )
}

export default CardActions
