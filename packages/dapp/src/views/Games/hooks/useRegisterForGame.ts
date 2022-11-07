import { ChainId } from '@pancakeswap/sdk'
import {
  getChainlinkOracleContract,
  getGameFactoryV1Contract,
  getGameImplementationV1Contract,
} from 'utils/contractHelpers'
import { useSWRContract } from 'hooks/useSWRContract'
import { useGameImplementationV1Contract } from 'hooks/useContract'

import { Zero } from '@ethersproject/constants'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { FetchStatus } from 'config/constants/types'
import { BigNumber } from '@ethersproject/bignumber'

export const useRegisterForGame = (
  gameAddress: string,
  registrationAmount: BigNumber,
  gameCreationAmount: BigNumber,
) => {
  // const { account, chainId } = useActiveWeb3React()

  const gameImplementationV1Contract = useGameImplementationV1Contract(gameAddress)
  // const gameImplementationV1Contract = useGameImplementationV1Contract(account, chainId)

  const { data, error, status, mutate } = useSWRContract({
    contract: gameImplementationV1Contract,
    methodName: 'registerForGame',
    // TODO add value
    params: [
      {
        value: registrationAmount.add(gameCreationAmount),
      },
    ],
  })
  console.log('🚀 ~ file: useRegisterForGame.ts ~ line 32 ~ useRegisterForGame ~ mutate', mutate)
  console.log('🚀 ~ file: useRegisterForGame.ts ~ line 32 ~ useRegisterForGame ~ status', status)
  console.log('🚀 ~ file: useRegisterForGame.ts ~ line 32 ~ useRegisterForGame ~ error', error)
  console.log('🚀 ~ file: useRegisterForGame.ts ~ line 32 ~ useRegisterForGame ~ data', data)
  return {
    data,
    isFetching: status === FetchStatus.Fetching,
    error,
    refresh: mutate,
  }
  // TODO return useMemo ??
}
