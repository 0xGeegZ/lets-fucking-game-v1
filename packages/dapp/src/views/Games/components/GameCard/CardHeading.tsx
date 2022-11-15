import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { CoreTag } from 'components/Tags'
import BoostedTag from 'views/Games/components/YieldBooster/components/BoostedTag'
import FreeTag from 'views/Games/components/YieldBooster/components/FreeTag'
import BigNumber from 'bignumber.js'
import { CurrencyLogo } from 'components/Logo'

export interface ExpandableSectionProps {
  id: BigNumber
  name?: string
  token: Token
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

const CardHeading: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({
  id,
  name,
  token,
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
        // <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={quoteToken} width={64} height={64} />
        <CurrencyLogo currency={token} size="24px" />
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

export default CardHeading
