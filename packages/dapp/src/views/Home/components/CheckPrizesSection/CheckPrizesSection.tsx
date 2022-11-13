import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button, Heading, Flex, useModal, AutoRenewIcon, Image } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { FetchStatus, LotteryStatus } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import { useGetUserLotteriesGraphData, useLottery } from 'state/lottery/hooks'
import ConnectWalletButton from 'components/ConnectWalletButton'
import ClaimPrizesModal from '../ClaimPrizesModal'
import useGetUnclaimedRewards from '../../hooks/useGetUnclaimedRewards'

const MoneyImage = styled.img`
  height: 80px;
  ${({ theme }) => theme.mediaQueries.sm} {
    height: 120px;
  }
`

const DiamondImage = styled.img`
  height: 70px;
  ${({ theme }) => theme.mediaQueries.sm} {
    height: 80px;
  }
`

const CheckPrizesSection = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const {
    isTransitioning,
    currentRound: { status },
  } = useLottery()
  const { fetchAllRewards, unclaimedRewards, fetchStatus } = useGetUnclaimedRewards()
  const userLotteryData = useGetUserLotteriesGraphData()
  const [hasCheckedForRewards, setHasCheckedForRewards] = useState(false)
  const [hasRewardsToClaim, setHasRewardsToClaim] = useState(false)
  const [onPresentClaimModal] = useModal(<ClaimPrizesModal roundsToClaim={unclaimedRewards} />, false)
  const isFetchingRewards = fetchStatus === FetchStatus.Fetching
  const lotteryIsNotClaimable = status === LotteryStatus.CLOSE
  const isCheckNowDisabled = !userLotteryData.account || lotteryIsNotClaimable

  useEffect(() => {
    if (fetchStatus === FetchStatus.Fetched) {
      // Manage showing unclaimed rewards modal once per page load / once per lottery state change
      if (unclaimedRewards.length > 0 && !hasCheckedForRewards) {
        setHasRewardsToClaim(true)
        setHasCheckedForRewards(true)
        onPresentClaimModal()
      }

      if (unclaimedRewards.length === 0 && !hasCheckedForRewards) {
        setHasRewardsToClaim(false)
        setHasCheckedForRewards(true)
      }
    }
  }, [unclaimedRewards, hasCheckedForRewards, fetchStatus, onPresentClaimModal])

  useEffect(() => {
    // Clear local state on account change, or when lottery isTransitioning state changes
    setHasRewardsToClaim(false)
    setHasCheckedForRewards(false)
  }, [account, isTransitioning])

  const getBody = () => {
    if (!account) {
      return (
        <Flex alignItems="center" justifyContent="center">
          <MoneyImage src="/images/Saly-45.png" alt="money drawing" />
          <Flex mx={['4px', null, '16px']} flexDirection="column" alignItems="center">
            <Heading textAlign="center" color="#F4EEFF">
              {t('Connect your wallet')}
            </Heading>
            <Heading textAlign="center" color="#F4EEFF" mb="24px">
              {t('to start a new game')}
            </Heading>
            <ConnectWalletButton width="190px" />
          </Flex>
          <DiamondImage src="/images/Saly-28.png" alt="diamond drawing" />
        </Flex>
      )
    }
    return (
      <Flex alignItems="center" justifyContent="center">
        <MoneyImage src="/images/Saly-45.png" alt="money drawing" />
        <Flex mx={['4px', null, '16px']} flexDirection="column">
          <Heading textAlign="center" color="#F4EEFF">
            {t('Connect your wallet')}
          </Heading>
          <Heading textAlign="center" color="#F4EEFF" mb="24px">
            {t('to start a new game')}
          </Heading>
          <ConnectWalletButton width="190px" />
        </Flex>
        <DiamondImage src="/images/Saly-28.png" alt="diamond drawing" />
      </Flex>
    )
  }

  return <Flex>{getBody()}</Flex>
}

export default CheckPrizesSection
