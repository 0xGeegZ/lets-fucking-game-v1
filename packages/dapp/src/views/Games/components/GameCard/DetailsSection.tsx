import styled from 'styled-components'
import { LinkExternal, Skeleton } from '@pancakeswap/uikit'
import ActionButton from 'views/Games/components/YieldBooster/components/ActionButton'
import { useTranslation } from '@pancakeswap/localization'

export interface ExpandableSectionProps {
  bscScanAddress?: string
  isReady: boolean
}

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

const DetailsSection: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({ bscScanAddress, isReady }) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      {isReady ? (
        <StyledLinkExternal href={bscScanAddress}>{t('View Contract')}</StyledLinkExternal>
      ) : (
        <Skeleton ml="4px" width={42} height={28} />
      )}
      <ActionContainer style={{ paddingTop: 16 }}>
        <ActionButton title={`${t('Game Rules')}`} description={t("More info about Let's Fucking Game")} />
      </ActionContainer>
    </Wrapper>
  )
}

export default DetailsSection
