import { ButtonProps, HelpIcon, Flex, TooltipText, useTooltip, useMatchBreakpoints } from '@pancakeswap/uikit'
import _isEmpty from 'lodash/isEmpty'
import { ReactNode } from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'

const Container = styled.div`
  margin-left: 4px;
`

interface TooltipPropsType extends ButtonProps {
  content: ReactNode
  additionalStyle?: any
}

const TooltipElement = ({ content }) => {
  const { t } = useTranslation()

  return <>{t(content)}</>
}

const Tooltip: React.FC<TooltipPropsType> = ({ content, additionalStyle }) => {
  const { isMobile } = useMatchBreakpoints()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipElement content={content} />, {
    placement: 'top',
    ...(isMobile && { hideTimeout: 1500 }),
  })

  return (
    <Container>
      <Flex>
        <TooltipText ref={targetRef}>
          <HelpIcon {...additionalStyle} width="20px" height="20px" />
        </TooltipText>
        {tooltipVisible && tooltip}
      </Flex>
    </Container>
  )
}

export default Tooltip
