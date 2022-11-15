import styled from 'styled-components'
import { Card, CardBody, CardHeader, Heading, Text, Flex, Link, Image } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import FoldableText from 'components/FoldableSection/FoldableText'

const MustachioedMan = () => {
  return <Image src="/images/Saly-11.png" alt="drawing of a mustachioed man" width={367} height={367} />
}

const Wrapper = styled(Flex)`
  width: 100%;
  margin: auto;
  padding: 0 24px 72px 24px;
  flex-direction: column-reverse;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.xl} {
    flex-direction: row;
    max-width: 1140px;
  }
`

const StyledCardbody = styled(CardBody)`
  div:first-child {
    margin-top: 0px;
  }
`

const InlineLink = styled(Link)`
  display: inline-block;
  margin: 0 4px;
`

const FAQ = () => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <MustachioedMan />
      <Card>
        <CardHeader>
          <Heading color="secondary" scale="lg">
            {t('FAQ')}
          </Heading>
        </CardHeader>
        <StyledCardbody>
          <FoldableText title={t('How is calculated the time range to play ?')} mt="24px">
            <Text fontSize="14px" color="textSubtle">
              {t('SOON')}
            </Text>
          </FoldableText>
          <FoldableText title={t('How many time is a game during in average ?')} mt="24px">
            <Text fontSize="14px" color="textSubtle">
              {t('SOON')}
            </Text>
          </FoldableText>
          <FoldableText title={t("Can i stop the game if i don't want to play anymore ?")} mt="24px">
            <Text fontSize="14px" color="textSubtle">
              {t('SOON')}
            </Text>
          </FoldableText>
          <FoldableText title={t('Can i contact you for partnership ?')} mt="24px">
            <Text>
              {t('For sur! Please feel free to reach out to us on')}
              <InlineLink fontSize="14px" external href="https://twitter.com/0xGeegZ">
                {t('Twitter')}
              </InlineLink>
              {/* {t('or')}
              <InlineLink fontSize="14px" external href="https://discord.gg/pancakeswap">
                {t('Telegram')}
              </InlineLink> */}
            </Text>
          </FoldableText>
        </StyledCardbody>
      </Card>
    </Wrapper>
  )
}

export default FAQ
