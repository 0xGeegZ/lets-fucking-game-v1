import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem, NotificationDot } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import { NextLinkFromReactRouter } from 'components/NextLink'

interface GameTabButtonsProps {
  hasStakeInFinishedGames: boolean
}

const GameTabButtons: React.FC<React.PropsWithChildren<GameTabButtonsProps>> = ({ hasStakeInFinishedGames }) => {
  const router = useRouter()
  const { t } = useTranslation()

  let activeIndex
  switch (router.pathname) {
    case '/games':
      activeIndex = 0
      break
    case '/games/history':
      activeIndex = 1
      break
    default:
      activeIndex = 0
      break
  }

  return (
    <Wrapper>
      <ButtonMenu activeIndex={activeIndex} scale="sm" variant="subtle">
        <ButtonMenuItem as={NextLinkFromReactRouter} to="/games">
          {t('Live')}
        </ButtonMenuItem>
        <NotificationDot show={hasStakeInFinishedGames}>
          <ButtonMenuItem as={NextLinkFromReactRouter} to="/games/history" id="finished-games-button">
            {t('History')}
          </ButtonMenuItem>
        </NotificationDot>
      </ButtonMenu>
    </Wrapper>
  )
}

export default GameTabButtons

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    padding-left: 12px;
    padding-right: 12px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`
