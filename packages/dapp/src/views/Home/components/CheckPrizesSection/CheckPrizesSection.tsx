import styled from 'styled-components'
import { Heading, Flex } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import ConnectWalletButton from 'components/ConnectWalletButton'

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
