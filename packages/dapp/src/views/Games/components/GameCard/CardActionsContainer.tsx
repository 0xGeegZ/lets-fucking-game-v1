import { useTranslation } from '@pancakeswap/localization'
import {
  Flex,
  Button,
  Heading,
  AutoRenewIcon,
  Skeleton,
  Text,
  HelpIcon,
  TooltipText,
  useToast,
  useTooltip,
  useModal,
} from '@pancakeswap/uikit'

import BigNumber from 'bignumber.js'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
import Balance from 'components/Balance'

import ConnectWalletButton from 'components/ConnectWalletButton'
import { useContext } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import BoostedAction from 'views/Farms/components/YieldBooster/components/BoostedAction'
import ActionButton from 'views/Farms/components/YieldBooster/components/ActionButton'

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

const Container = styled.div`
  margin-right: 4px;
`

const Action = styled.div`
  padding-top: 16px;
`

const ActionContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ActionTitles = styled.div`
  display: flex;
  margin-bottom: 8px;
`

export const ActionContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
interface GameCardActionsProps {
  game: GameWithStakedValue
  account?: string
}

const CardActions: React.FC<React.PropsWithChildren<GameCardActionsProps>> = ({ game, account }) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const {
    address,
    roundId,
    userData: { stakedBalance, tokenBalance },
  } = game

  const isReady = true
  const isWonLastGames = false
  const isPlaying = true

  return (
    <Action>
      {isWonLastGames && (
        <>
          {/* TODO DISPLAY ONLY IF PLAYER HAVE ONE ONE ONE LAST 5 ROUND */}
          <ActionContainer>
            <ActionTitles>
              <Text bold textTransform="uppercase" color="secondary" pr="4px">
                {t('Earned')}
              </Text>
            </ActionTitles>
            <ActionContent>
              {isReady ? (
                <Text bold textTransform="uppercase" pr="4px">
                  0.00 BNB
                </Text>
              ) : (
                <Skeleton width={80} height={18} mb="4px" />
              )}
              {/* <Heading>0.00 BNB</Heading> */}
              {/* <Balance fontSize="12px" color="textSubtle" decimals={2} value={0.0} unit=" USD" prefix="~" /> */}
            </ActionContent>
          </ActionContainer>
          {/* TODO DISPLAY ONLY IF PLAYER WON WITH CLAIM BUTTON */}
          {/* <ActionContainer style={{ minHeight: 124.5 }}> */}
          <ActionContainer>
            <ActionTitles />
            <ActionContent>
              {isReady ? (
                <ClaimButton
                  ml="4px"
                  gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE"
                  roundId={EthersBigNumber.from(1)}
                />
              ) : (
                <Skeleton width={80} height={36} mb="4px" />
              )}
            </ActionContent>
          </ActionContainer>
        </>
      )}
      {isPlaying && (
        <Container>
          <Flex>
            <Heading mr="4px">{t('Next play time')}: </Heading>
            {isReady ? (
              <Text>
                {new Date().toLocaleString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            ) : (
              <Skeleton width="100%" height={18} mb="4px" />
            )}
          </Flex>

          <Text color="textSubtle" fontSize="12px">
            {t('Started')} {' 5 '} {t('days ago')}
          </Text>
        </Container>
      )}
      {!isPlaying && (
        <Container>
          <Flex>
            <Heading mr="4px">
              {t('Started')} {' 5 '} {t('days ago')}
            </Heading>
          </Flex>
        </Container>
      )}
      {/* TODO REACTIVATE after integration phase */}
      {/* TODO ADD CONDITION IF ACCOUNT IS GAME CREATOR. If true, display play and pause button */}
      {!account ? (
        <>
          <ConnectWalletButton mt="8px" width="100%" />
        </>
      ) : (
        <>
          {/* TODO DISPLAY ONLY IF PLAYER IS REGISTERED TO THE GAME AND GAME IS IN PROGRESS. Add disabled field if not in time range */}
          {isPlaying && <PlayButton gameAddress="0x86f13647f5b308e915a48b7e9dc15a216e3d8dbe" />}

          {/* TODO DISPLAY ONLY IF PLAYER IS NOT REGISTERED TO THE GAME. Add disabled is game is full */}
          {!isPlaying && (
            <RegisterButton
              gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE"
              registrationAmount={EthersBigNumber.from(1)}
              gameCreationAmount={EthersBigNumber.from(1)}
            />
          )}

          {/* TODO ONLY DISPLAY IF PLAYER IS REGISTERED TO THE GAME. Add disabled if not less than 50% players remaining */}
          {isPlaying && (
            <VoteSplitButton
              gameAddress="0x86f13647f5B308E915A48b7E9Dc15a216E3d8dbE"
              roundId={EthersBigNumber.from(1)}
            />
          )}
        </>
      )}
      {/* TODO Remove after integration phase */}
      {/* <Link href="/games/1" passHref>
        <Button as="a" id="showGameDetails" mt="8px" width="100%">
          {t('Show Game Details')}
        </Button>
      </Link> */}
      <ActionContainer style={{ paddingTop: 16 }}>
        <ActionButton title={`${t('Game Rules')}`} description={t("More info about Let's Fucking Game")} />
      </ActionContainer>
    </Action>
  )
}

export default CardActions
