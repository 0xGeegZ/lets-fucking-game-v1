import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  HelpIcon,
  RocketIcon,
  Text,
  useTooltip,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from '@pancakeswap/localization'
import Image from 'next/image'
import NextLink from 'next/link'
import styled, { useTheme } from 'styled-components'
import boosterCardImage from '../images/boosterCardImage.png'
import createGameCardImage from '../images/createGameCardImage.png'

export const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-top: 10px;
  ${({ theme }) => theme.mediaQueries.sm} {
    width: 296px;
    margin-left: 50px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 0px;
  }
`
export const ImageWrapper = styled.div`
  position: absolute;
  top: -50px;
  transform: translateY(-50%) scale(75%);
  right: 10px;
  ${({ theme }) => theme.mediaQueries.sm} {
    right: auto;
    top: 50%;
    left: -90px;
    transform: translateY(-45%);
  }
  z-index: 2;
`
const StyledCardBody = styled(CardBody)`
  border-bottom: none;
`
const StyledCardFooter = styled(CardFooter)`
  border-top: none;
  position: relative;
  padding: 8px 24px 16px;
  &::before {
    content: '';
    position: absolute;
    height: 1px;
    width: calc(100% - 48px);
    top: 0px;
    left: 24px;
    background-color: ${({ theme }) => theme.colors.cardBorder};
  }
`
export const useBCakeTooltipContent = () => {
  const { t } = useTranslation()
  const tooltipContent = (
    <>
      <Box>{t('More infos on game creation soon')}</Box>
      {/* TODO GUIGUI WRITE GAME CREATION RULES */}
      {/* <Box mb="20px">{t('More infos on game creation soon')}</Box> */}
      {/* <Box>
        {t('To learn more, check out the')}
        <Link target="_blank" href="https://medium.com/pancakeswap/introducing-bcake-game-yield-boosters-b27b7a6f0f84">
          {t('Medium Article')}
        </Link>
      </Box> */}
    </>
  )
  return tooltipContent
}

export const BCakeBoosterCard = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { isMobile } = useMatchBreakpoints()

  const tooltipContent = useBCakeTooltipContent()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipContent, {
    placement: 'bottom-start',
    ...(isMobile && { hideTimeout: 1500 }),
  })
  return (
    <CardWrapper>
      <ImageWrapper>
        <Image src={createGameCardImage} alt="createGameCardImage" width={150} height={150} placeholder="blur" />
      </ImageWrapper>
      <Card p="0px" style={{ zIndex: 1 }}>
        <StyledCardBody style={{ padding: '15px 24px' }}>
          <RocketIcon />
          <Text fontSize={22} bold color="text" marginBottom="-12px" display="inline-block" ml="7px">
            {t('Create Game')}
          </Text>
          {tooltipVisible && tooltip}
          <Box ref={targetRef} style={{ float: 'right', position: 'relative', top: '6px' }}>
            <HelpIcon color={theme.colors.textSubtle} />
          </Box>
        </StyledCardBody>
        <StyledCardFooter>
          <CardContent />
        </StyledCardFooter>
      </Card>
    </CardWrapper>
  )
}

const CardContent: React.FC = () => {
  const { t } = useTranslation()
  const { account } = useActiveWeb3React()

  const theme = useTheme()

  if (!account)
    return (
      <Box>
        <Text color="textSubtle" fontSize={12} bold>
          {t('Connect wallet to create a new game')}
        </Text>
        <Text color="textSubtle" fontSize={12} mb="16px">
          {t('Game will be associated to your address as you can win some fee')}
        </Text>
        <ConnectWalletButton width="100%" style={{ backgroundColor: theme.colors.textSubtle }} />
      </Box>
    )

  return (
    <Box width="100%">
      <Text color="textSubtle" fontSize={12} bold>
        {t('Create a new game')}
      </Text>
      <Text color="textSubtle" fontSize={12} mb="16px">
        {t('An active fixed-term CAKE staking position is required for activating game yield boosters.')}
      </Text>
      <NextLink href="/create-game" passHref>
        <Button as="a" width="100%" style={{ backgroundColor: theme.colors.textSubtle }}>
          {t('Create Game')}
        </Button>
      </NextLink>
    </Box>
  )
}
