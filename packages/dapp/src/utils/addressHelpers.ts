import { ChainId } from '@pancakeswap/sdk'
import addresses from 'config/constants/contracts'
import { Address } from 'config/constants/types'
import internal from 'config/internal/internal.json'

export const getAddress = (address: Address, chainId?: number): string => {
  return address[chainId] ? address[chainId] : address[ChainId.BSC]
}

// TODO GUIGUI getGameFactoryV1Address
export const getGameFactoryV1Address = (chainId?: number) => {
  return internal[chainId || ChainId.BSC].GameFactory.address
}

// export const getMulticallAddress = (chainId?: number) => {
//   return getAddress(addresses.multiCall, chainId)
// }
// TODO Guigui load multicall contract adress and ABIs directly from internal
export const getMulticallAddress = (chainId: number) => {
  if (internal[chainId]) return internal[chainId].MultiCall3.address
  return getAddress(addresses.multiCall, chainId)
}
