import { ChainId } from '@pancakeswap/sdk'
import { getChainlinkOracleContract, getGameFactoryV1Contract, getGameV1Contract } from 'utils/contractHelpers'
import { useSWRContract } from 'hooks/useSWRContract'
import { useGameFactoryV1Contract } from 'hooks/useContract'

import { Zero } from '@ethersproject/constants'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { FetchStatus } from 'config/constants/types'

export const useCreateGame = ({ game }) => {
  // const { account, chainId } = useActiveWeb3React()

  const { name, image, maxPlayers, playTimeRange, registrationAmount, treasuryFee, creatorFee, encodedCron, prizes } =
    game

  // TODO make conversion for values

  const gameFactoryContract = useGameFactoryV1Contract()
  // const gameFactoryContract = getGameFactoryV1Contract(account, chainId)

  const { data, error, status, mutate } = useSWRContract({
    contract: gameFactoryContract,
    methodName: 'createNewGame',
    params: [name, image, maxPlayers, playTimeRange, registrationAmount, treasuryFee, creatorFee, encodedCron, prizes],
  })
  console.log('🚀 ~ file: useCreateGame.ts ~ line 32 ~ useCreateGame ~ mutate', mutate)
  console.log('🚀 ~ file: useCreateGame.ts ~ line 32 ~ useCreateGame ~ status', status)
  console.log('🚀 ~ file: useCreateGame.ts ~ line 32 ~ useCreateGame ~ error', error)
  console.log('🚀 ~ file: useCreateGame.ts ~ line 32 ~ useCreateGame ~ data', data)
  return {
    data,
    isFetching: status === FetchStatus.Fetching,
    error,
    refresh: mutate,
  }
  // TODO return useMemo ??
}
