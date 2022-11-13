import styled from 'styled-components'
import PageSection from 'components/PageSection'
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import { PageMeta } from 'components/Layout/Page'
import Hero from './components/Hero'
import MetricsSection from './components/MetricsSection'
import HowToPlay from './components/HowToPlay/HowToPlay'
import Rules from './components/Rules/Rules'
import FAQ from './components/FAQ/FAQ'
import CheckPrizesSection from './components/CheckPrizesSection/CheckPrizesSection'
import Games from './components/Games'

import { CHECK_PRIZES_BG } from './pageSectionStyles'
import Why from './components/Why/Why'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 48px;
  }
`

const UserBannerWrapper = styled(Container)`
  z-index: 1;
  position: absolute;
  width: 100%;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding-left: 0px;
  padding-right: 0px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-left: 24px;
    padding-right: 24px;
  }
`

const Home: React.FC<React.PropsWithChildren> = () => {
  const { theme } = useTheme()

  return (
    <>
      <PageMeta />
      <style jsx global>{`
        #home-1 .page-bg {
          background: linear-gradient(139.73deg, #e6fdff 0%, #f3efff 100%);
        }
        [data-theme='dark'] #home-1 .page-bg {
          background: radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%);
        }
        #home-2 .page-bg {
          background: linear-gradient(180deg, #ffffff 22%, #d7caec 100%);
        }
        [data-theme='dark'] #home-2 .page-bg {
          background: linear-gradient(180deg, #09070c 22%, #201335 100%);
        }
        #home-3 .page-bg {
          background: linear-gradient(180deg, #6fb6f1 0%, #eaf2f6 100%);
        }
        [data-theme='dark'] #home-3 .page-bg {
          background: linear-gradient(180deg, #0b4576 0%, #091115 100%);
        }
        #home-4 .inner-wedge svg {
          fill: #d8cbed;
        }
        [data-theme='dark'] #home-4 .inner-wedge svg {
          fill: #201335;
        }
      `}</style>
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'home-1',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <Hero />
      </StyledHeroSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'home-2',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <MetricsSection />
      </PageSection>

      <PageSection
        // dividerPosition="top"
        // dividerFill={{ light: theme.colors.background }}
        // clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
      >
        <HowToPlay />
      </PageSection>

      <PageSection index={2}>
        <Games />
      </PageSection>

      <PageSection
        dividerPosition="top"
        dividerFill={{ light: theme.colors.background }}
        clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
      >
        <Rules />
      </PageSection>
      {/* <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background={theme.colors.background}
        index={2}
        hasCurvedDivider={false}
      > */}
      <FAQ />
      {/* </PageSection> */}
      <PageSection background={CHECK_PRIZES_BG} hasCurvedDivider={false} index={2}>
        <CheckPrizesSection />
      </PageSection>
      <PageSection
        dividerPosition="top"
        dividerFill={{ light: theme.colors.background }}
        clipFill={{ light: '#9A9FD0', dark: '#66578D' }}
        index={2}
      >
        <Why />
      </PageSection>
    </>
  )
}

export default Home
