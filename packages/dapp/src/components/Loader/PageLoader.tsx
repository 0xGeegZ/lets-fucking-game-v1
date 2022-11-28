import styled from 'styled-components'
import Loading from 'components/Loading'
import Page from '../Layout/Page'

const Wrapper = styled(Page)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <Wrapper>
      <Loading />
    </Wrapper>
  )
}

export default PageLoader
