import { Flex, Text } from '@pancakeswap/uikit'

import EncodedCronSelection from 'views/GameForm/components/Steps/GameConfiguration/components/EncodedCronSelection'
import FreeGameAmountSelection from 'views/GameForm/components/Steps/GameConfiguration/components/FreeGameAmountSelection'
import MaximumPlayersSelection from 'views/GameForm/components/Steps/GameConfiguration/components/MaximumPlayersSelection'
import PlayTimeRangeSelection from 'views/GameForm/components/Steps/GameConfiguration/components/PlayTimeRangeSelection'
import RegistrationAmountSelection from 'views/GameForm/components/Steps/GameConfiguration/components/RegistrationAmountSelection'

const MainOptionsSelection = () => {
  return (
    <>
      <Text as="h2" mb="8px">
        Main game configuration
      </Text>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="24px"
      >
        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <PlayTimeRangeSelection />
        </Flex>

        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <EncodedCronSelection />
        </Flex>
      </Flex>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        pr={[null, null, '4px']}
        pl={['4px', null, '0']}
        mb="24px"
      >
        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <RegistrationAmountSelection />
          <FreeGameAmountSelection />
        </Flex>

        <Flex width="45%" style={{ gap: '4px' }} flexDirection="column">
          <MaximumPlayersSelection />
        </Flex>
      </Flex>
    </>
  )
}

export default MainOptionsSelection
