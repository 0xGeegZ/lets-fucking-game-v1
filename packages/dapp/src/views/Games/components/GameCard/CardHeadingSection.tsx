import styled from 'styled-components'
import { Tag, Flex, Heading, Skeleton, Text } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { CoreTag } from 'components/Tags'
import RegistrationTag from 'views/Games/components/GameTags/RegistrationTag'
import ProgressTag from 'views/Games/components/GameTags/ProgressTag'
import StartingTag from 'views/Games/components/GameTags/StartingTag'

import FreeTag from 'views/Games/components/GameTags/FreeTag'
import PausedTag from 'views/Games/components/GameTags/PausedTag'
import LostTag from 'views/Games/components/GameTags/LostTag'
import VersionTag from 'views/Games/components/GameTags/VersionTag'

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
  roundId: BigNumber
  versionId: BigNumber
  chainId: number
  prizepool: BigNumber
  multiplier: BigNumber
  isPaused: boolean
  isReady: boolean
  isFree: boolean
  isInProgress: boolean
  isRegistering: boolean
  hasLost: boolean
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
  roundId,
  versionId,
  chainId,
  prizepool,
  multiplier,
  isPaused,
  isReady,
  isFree,
  isInProgress,
  isRegistering,
  hasLost,
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
        {isReady ? (
          <Heading mb="4px">
            {name} - #{roundId.toNumber()}
          </Heading>
        ) : (
          <Skeleton mb="4px" width={60} height={18} />
        )}
        <Flex justifyContent="center" mt="4px">
          {isReady && hasLost && <LostTag mr="4px" />}

          {isReady ? <>{isInProgress && <ProgressTag mr="4px" />}</> : <Skeleton ml="4px" width={42} height={28} />}
          {isReady ? (
            <>{!isRegistering && !isInProgress && !isPaused && <StartingTag ml="4px" />}</>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
          {isReady ? (
            <>{isRegistering && !isPaused && <RegistrationTag ml="4px" />}</>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
          {isReady && isPaused && <PausedTag ml="4px" />}

          {isReady ? <>{isFree && <FreeTag ml="4px" />}</> : <Skeleton ml="4px" width={42} height={28} />}
          {isReady ? (
            <>
              {multiplier && <MultiplierTag ml="4px" variant="secondary">{`x${multiplier.toNumber()}`}</MultiplierTag>}
            </>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
          {isReady && versionId && <VersionTag versionId={versionId} ml="4px" />}
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeadingSection
