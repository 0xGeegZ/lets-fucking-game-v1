import { useTranslation } from '@pancakeswap/localization'
import { Flex, Skeleton, Text, Button } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useContext } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import BoostedAction from 'views/Farms/components/YieldBooster/components/BoostedAction'
import { YieldBoosterStateContext } from 'views/Farms/components/YieldBooster/components/ProxyFarmContainer'
import { getMasterChefAddress } from 'utils/addressHelpers'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { ChainId, WBNB } from '@pancakeswap/sdk'
import ClaimButton from './ClaimButton'
import PlayButton from './PlayButton'
import RegisterButton from './RegisterButton'
import VoteSplitButton from './VoteSplitButton'
import { HarvestActionContainer, ProxyHarvestActionContainer } from '../GameTable/Actions/HarvestAction'
import { ProxyStakedContainer, StakedContainer } from '../GameTable/Actions/StakedAction'
import { GameWithStakedValue } from '../types'
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

interface GameCardActionsProps {
  game: GameWithStakedValue
  account?: string
  addLiquidityUrl?: string
  lpLabel?: string
  displayApr?: string
}

const CardActions: React.FC<React.PropsWithChildren<GameCardActionsProps>> = ({
  game,
  account,
  addLiquidityUrl,
  lpLabel,
  displayApr,
}) => {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  // const { pid, token, quoteToken, vaultPid, lpSymbol, lpAddress } = game

  const pid = 2
  const token = WBNB[chainId]
  const quoteToken = WBNB[chainId]
  const vaultPid = 5
  const lpSymbol = 'lpSymbol'
  const lpAddress = getMasterChefAddress(chainId)

  const { address, roundId } = game || {}
  const { earnings } = game.userData || {}
  const { shouldUseProxyFarm } = useContext(YieldBoosterStateContext)
  const isReady = false
  const { stakedBalance, tokenBalance, proxy } = game.userData

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
      {/* // TODO BoostedAction will make componant crash */}
      {!game.contractPaused && (
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
          farmPid={2}
          lpTotalSupply={new BigNumber(1000000)}
          userBalanceInFarm={new BigNumber(500)}
        />
      )}
      {isReady ? (
        <Flex>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
            {t('Staked')}
          </Text>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('Staked')}
          </Text>
        </Flex>
      ) : (
        <Skeleton width={80} height={18} mb="4px" />
      )}
      {/* TODO Remove after integration phase */}
      {/* <Link href="/games/1" passHref>
        <Button as="a" id="showGameDetails" mt="8px" width="100%">
          {t('Show Game Details')}
        </Button>
      </Link> */}
      {/* TODO REACTIVATE after integration phase */}
      {!account ? (
        <>
          <ConnectWalletButton mt="8px" width="100%" />
        </>
      ) : shouldUseProxyFarm ? (
        <>
          <ProxyStakedContainer {...game} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
            {(props) => <StakeAction {...props} />}
          </ProxyStakedContainer>
        </>
      ) : (
        // <StakedContainer {...game} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
        //   {(props) => <StakeAction {...props} />}
        // </StakedContainer>
        <>
          <PlayButton gameAddress="0x86f13647f5b308e915a48b7e9dc15a216e3d8dbe" />
          <ClaimButton gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE" roundId={EthersBigNumber.from(1)} />
          <RegisterButton
            gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE"
            registrationAmount={EthersBigNumber.from(1)}
            gameCreationAmount={EthersBigNumber.from(1)}
          />
          <VoteSplitButton gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE" roundId={EthersBigNumber.from(1)} />
        </>
      )}

      {/* {!account ? (
        <ConnectWalletButton mt="8px" width="100%" />
      ) : shouldUseProxyFarm ? (
        <ProxyStakedContainer {...game} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
          {(props) => <StakeAction {...props} />}
        </ProxyStakedContainer>
      ) : (
        <StakedContainer {...game} lpLabel={lpLabel} addLiquidityUrl={addLiquidityUrl} displayApr={displayApr}>
          {(props) => <StakeAction {...props} />}
        </StakedContainer>
      )} */}
    </Action>
  )
}

export default CardActions
