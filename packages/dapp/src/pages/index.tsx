import { SWRConfig } from 'swr'

import Home from '../views/Home'

const IndexPage = () => {
  return (
    <SWRConfig
      value={{
        fallback: {},
      }}
    >
      <Home />
    </SWRConfig>
  )
}

IndexPage.chains = []

export default IndexPage
