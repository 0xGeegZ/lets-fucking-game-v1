import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { CoreTag } from 'components/Tags'
import BoostedTag from 'views/Games/components/GameTags/BoostedTag'
import FreeTag from 'views/Games/components/GameTags/FreeTag'
import BigNumber from 'bignumber.js'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/Logo'
import Dots from 'components/Loader/Dots'
import Logo from 'components/Logo/Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`

export interface ExpandableSectionProps {
  id: BigNumber
  name?: string
  chainId: number
  prizepool: BigNumber
  multiplier: BigNumber
  isReady: boolean
  isFree: boolean
  boosted?: boolean
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
`

const CardHeadingSection: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({
  id,
  name,
  chainId,
  prizepool,
  multiplier,
  isReady,
  isFree,
  boosted,
}) => {
  // TODO GUIGUI DISPLAY gameCreationAmount
  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      {isReady ? (
        <>
          {/* <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={quoteToken} width={64} height={64} /> */}
          {/* <CurrencyLogo currency={token} size="48px" /> */}
          <StyledLogo size="40px" srcs={[`/images/chains/${chainId}.png`]} width="48px" />
          {/* <DoubleCurrencyLogo currency0={token} currency1={token} size={20} />
          <Text bold ml="8px">
            {!token ? <Dots>{t('Loading')}</Dots> : `${token.symbol}`}
          </Text> */}
        </>
      ) : (
        <Skeleton mr="8px" width={63} height={63} variant="circle" />
      )}
      <Flex flexDirection="column" alignItems="flex-end">
        {isReady ? <Heading mb="4px">{name}</Heading> : <Skeleton mb="4px" width={60} height={18} />}
        <Flex justifyContent="center" mt="4px">
          {isReady ? <CoreTag mr="4px" /> : <Skeleton ml="4px" width={42} height={28} />}
          {isReady ? <>{boosted && <BoostedTag ml="4px" />}</> : <Skeleton ml="4px" width={42} height={28} />}
          {isReady ? <>{isFree && <FreeTag ml="4px" />}</> : <Skeleton ml="4px" width={42} height={28} />}
          {isReady ? (
            <>{multiplier && <MultiplierTag variant="secondary">{`x${multiplier.toNumber()}`}</MultiplierTag>}</>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeadingSection
