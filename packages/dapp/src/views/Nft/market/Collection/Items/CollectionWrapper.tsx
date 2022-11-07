import { createPortal } from 'react-dom'
import { Box } from '@pancakeswap/uikit'
import { Collection } from 'state/nftMarket/types'
import Container from 'components/Layout/Container'
import ScrollToTopButton from 'components/ScrollToTopButton/ScrollToTopButtonV2'
import Filters from './Filters'
import CollectionNfts from './CollectionNfts'

interface CollectionWrapperProps {
  collection: Collection
}

const CollectionWrapper: React.FC<React.PropsWithChildren<CollectionWrapperProps>> = ({ collection }) => {
  return (
    <Box py="32px">
      <Container px={[0, null, '24px']}>
        <Filters address={collection?.address || ''} attributes={collection?.attributes} />
      </Container>
      <Container>
        <CollectionNfts collection={collection} />
      </Container>
      {createPortal(<ScrollToTopButton />, document.body)}
    </Box>
  )
}

export default CollectionWrapper
