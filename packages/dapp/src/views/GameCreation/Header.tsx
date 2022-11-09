import { useContext } from 'react'
import styled from 'styled-components'
import { Breadcrumbs, Heading, Text, Link, Button } from '@pancakeswap/uikit'
import { useTranslation, TranslateFunction } from '@pancakeswap/localization'
import { GameCreationContext } from './contexts/GameCreationProvider'

const Wrapper = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.colors.textSubtle};
  margin-top: 32px;
  margin-bottom: 24px;
  padding-bottom: 24px;
`

const steps = (t: TranslateFunction) => [
  t('Game creation'),
  t('Prizepool configuration'),
  t('Game confirmation and contract creation'),
  t('Success or error message'),
]

const Header: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { currentStep } = useContext(GameCreationContext)

  return (
    <Wrapper>
      <Heading as="h1" scale="xxl" color="secondary" mb="8px" id="profile-setup-title">
        {t('Create Game')}
      </Heading>

      <Link href="/profile">
        <Button mb="24px" scale="sm" variant="secondary">
          {t('Back to profile')}
        </Button>
      </Link>
      <Breadcrumbs>
        {steps(t).map((translationKey, index) => {
          return (
            <Text key={t(translationKey)} color={index <= currentStep ? 'text' : 'textDisabled'}>
              {translationKey}
            </Text>
          )
        })}
      </Breadcrumbs>
    </Wrapper>
  )
}

export default Header
