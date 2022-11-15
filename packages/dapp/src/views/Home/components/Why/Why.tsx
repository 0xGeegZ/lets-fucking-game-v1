import styled from 'styled-components'
import { Box, Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const GappedFlex = styled(Flex)`
  gap: 24px;
`

const Why: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()

  return (
    <Box width="100%">
      <Flex mb="40px" alignItems="center" flexDirection="column">
        <Heading mb="24px" scale="xl" color="secondary">
          {t('Why do we create this project')}
        </Heading>
      </Flex>
      <GappedFlex flexDirection={['column', 'column', 'column', 'row']}>
        <Flex flex="2" flexDirection="column">
          <Heading mt="24px" scale="md">
            {t('Have fun')}
          </Heading>
          <Text mb="16px" color="textSubtle">
            {t('This project was created to have fun and help people starting to interact with web3 easily.')}
          </Text>
          <Heading mt="24px" scale="md">
            {t('Discover Web3')}
          </Heading>
          <Text mb="16px" color="textSubtle">
            {t('As a developper team, we want to learn web3 and ttry new technologies like keepers or EPNS.')}
          </Text>
          <Heading mt="24px" scale="md">
            {t('Bring a new way to activate community')}
          </Heading>
          <Text mb="16px" color="textSubtle">
            {t(
              'As many people offer giveway to their community especially on Twitter or Discord, we want to offer a new way to engage their community with simple and funny games.',
            )}
          </Text>
        </Flex>
      </GappedFlex>
    </Box>
  )
}

export default Why
