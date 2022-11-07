import styled from 'styled-components'
import { useGameUser } from 'state/games/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Text, Skeleton, Flex } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from 'utils/formatBalance'
import { TokenPairImage } from 'components/TokenImage'
import { StableFarmTag } from 'components/Tags'

export interface GameProps {
  label: string
  pid: number
  token: Token
  quoteToken: Token
  isReady: boolean
  isStable?: boolean
}

const Container = styled.div`
  padding-left: 16px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-left: 32px;
  }
`

const TokenWrapper = styled.div`
  padding-right: 8px;
  width: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 40px;
  }
`

const Game: React.FunctionComponent<React.PropsWithChildren<GameProps>> = ({
  token,
  quoteToken,
  label,
  pid,
  isReady,
  isStable,
}) => {
  const { stakedBalance } = useGameUser(pid)
  const { t } = useTranslation()
  const rawStakedBalance = getBalanceNumber(stakedBalance)

  const handleRenderGaming = (): JSX.Element => {
    if (rawStakedBalance) {
      return (
        <Text color="secondary" fontSize="12px" bold textTransform="uppercase">
          {t('Gaming')}
        </Text>
      )
    }

    return null
  }

  if (!isReady) {
    return (
      <Container>
        <Skeleton mr="8px" width={32} height={32} variant="circle" />
        <div>
          <Skeleton width={40} height={10} mb="4px" />
          <Skeleton width={60} height={24} />
        </div>
      </Container>
    )
  }

  const pairContainer = (
    <Container>
      <TokenWrapper>
        <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={quoteToken} width={40} height={40} />
      </TokenWrapper>
      <div>
        {handleRenderGaming()}
        <Text bold>{label}</Text>
      </div>
    </Container>
  )

  return isStable ? (
    <Flex flexDirection="column">
      {pairContainer}
      <StableFarmTag mt="4px" />
    </Flex>
  ) : (
    pairContainer
  )
}

export default Game
