import { useContext } from 'react'
import styled from 'styled-components'
import { Breadcrumbs, Heading, Text, Link, Button } from '@pancakeswap/uikit'
import { useTranslation, TranslateFunction } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameCreation/hooks/useGameContext'

const Wrapper = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.colors.textSubtle};
  margin-top: 32px;
  margin-bottom: 24px;
  padding-bottom: 24px;
`

const steps = (t: TranslateFunction) => [
  t('Game name'),
  t('Game configuration'),
  t('Prizepool configuration'),
  t('Contract creation'),
  t('Confirmation'),
]

const Header: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { currentStep } = useGameContext()

  return (
    <Wrapper>
      <Heading as="h1" scale="xxl" color="secondary" mb="8px" id="profile-setup-title">
        {t('Create Game')}
      </Heading>

      <Link href="/games">
        <Button mb="24px" scale="sm" variant="secondary">
          {t('Back to games')}
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
