import styled from 'styled-components'
import PageSection from 'components/PageSection'
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

const StyledGameSection = styled(PageSection)`
  padding: 0;
`

const Home: React.FC<React.PropsWithChildren> = () => {
  return (
    <>
      <PageMeta />
      <style jsx global>{`
        #hero .page-bg {
          background: linear-gradient(139.73deg, #e6fdff 0%, #f3efff 100%);
        }
        [data-theme='dark'] #hero .page-bg {
          background: radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%);
        }
        #metrics .page-bg {
          background: linear-gradient(180deg, #ffffff 22%, #d7caec 100%);
        }
        [data-theme='dark'] #metrics .page-bg {
          background: linear-gradient(180deg, #09070c 22%, #201335 100%);
        }
        #home-3 .page-bg {
          background: linear-gradient(180deg, #6fb6f1 0%, #eaf2f6 100%);
        }
        [data-theme='dark'] #home-3 .page-bg {
          background: linear-gradient(180deg, #0b4576 0%, #091115 100%);
        }
        #why .inner-wedge svg {
          fill: #d8cbed;
        }
        [data-theme='dark'] #why .inner-wedge svg {
          fill: #201335;
        }
      `}</style>
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'hero',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <Hero />
      </StyledHeroSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'metrics',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <MetricsSection />
      </PageSection>

      <PageSection
        index={2}
        dividerPosition="top"
        containerProps={{
          id: 'how-to-play',
        }}
      >
        <HowToPlay />
      </PageSection>

      <StyledGameSection
        innerProps={{ style: { padding: '24px 0 0', width: '100%' } }}
        index={2}
        hasCurvedDivider={false}
      >
        <Games />
      </StyledGameSection>

      <PageSection index={2} dividerPosition="bottom">
        <Rules />
        <FAQ />
      </PageSection>

      <PageSection
        background={CHECK_PRIZES_BG}
        hasCurvedDivider={false}
        index={2}
        containerProps={{
          id: 'prizes',
        }}
      >
        <CheckPrizesSection />
      </PageSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'why',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <Why />
      </PageSection>
    </>
  )
}

export default Home
