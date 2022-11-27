import styled from 'styled-components'
import { Flex, Skeleton, Text, LinkExternal } from '@pancakeswap/uikit'

import ActionButton from 'views/Games/components/GameTags/ActionButton'
import { useTranslation } from '@pancakeswap/localization'
import BigNumber from 'bignumber.js'

export interface ExpandableSectionProps {
  bscScanAddress?: string
  treasuryFee: BigNumber
  creatorFee: BigNumber
  creator: string
  isReady: boolean
}

const Container = styled.div`
  margin-right: 4px;
`

const Wrapper = styled.div`
  margin-top: 24px;
`

const StyledLinkExternal = styled(LinkExternal)`
  font-weight: 400;
`

const ActionContainer = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const DetailsSection: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({
  bscScanAddress,
  isReady,
  treasuryFee,
  creatorFee,
  creator,
}) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <ActionContainer>
        <ActionButton title={`${t('Game Rules')}`} description={t("More info about Let's Fucking Game")} />
      </ActionContainer>

      <Container style={{ paddingTop: 8 }}>
        <Flex>
          {isReady ? (
            <Text color="textSubtle" fontSize="12px">
              {t(`Treasury fee : ${treasuryFee.toNumber() / 100}%`)}
            </Text>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
        <Flex>
          {isReady ? (
            <Text color="textSubtle" fontSize="12px">
              {t(`Creator fee : ${creatorFee.toNumber() / 100}%`)}
            </Text>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>

        <Flex style={{ paddingTop: 10 }}>
          {isReady ? (
            <StyledLinkExternal href={creator}>{t('Creator')}</StyledLinkExternal>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
        <Flex style={{ paddingTop: 10 }}>
          {isReady ? (
            <StyledLinkExternal href={bscScanAddress}>{t('View Contract')}</StyledLinkExternal>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
      </Container>
    </Wrapper>
  )
}

export default DetailsSection
