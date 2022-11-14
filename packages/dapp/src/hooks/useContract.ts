import { Cake, Erc20, Erc20Bytes32, Erc721collection, Multicall, Weth } from 'config/abi/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useProviderOrSigner } from 'hooks/useProviderOrSigner'
import { useMemo } from 'react'
import { getMulticallAddress } from 'utils/addressHelpers'
import {
  getGameFactoryV1Contract,
  getGameV1Contract,
  getBep20Contract,
  getErc721Contract,
  getErc721CollectionContract,
  getCakeContract,
} from 'utils/contractHelpers'
import internal from 'config/internal/internal.json'

import { useSigner } from 'wagmi'

// Imports below migrated from Exchange useContract.ts
import { Contract } from '@ethersproject/contracts'
import { WNATIVE } from '@pancakeswap/sdk'
import { ERC20_BYTES32_ABI } from '../config/abi/erc20'
import ERC20_ABI from '../config/abi/erc20.json'
import IPancakePairABI from '../config/abi/IPancakePair.json'
import multiCallAbi from '../config/abi/Multicall.json'
import WETH_ABI from '../config/abi/weth.json'
import { getContract } from '../utils'

import { IPancakePair } from '../config/abi/types/IPancakePair'
import { useActiveChainId } from './useActiveChainId'

/**
 * Helper hooks to get specific contracts (by ABI)
 */
// TODO GUIGUI useGameFactoryV1Contract
export const useGameFactoryV1Contract = () => {
  // const { data: signer } = useSigner()
  const providerOrSigner = useProviderOrSigner(true)
  const { chainId } = useActiveChainId()
  return useMemo(() => getGameFactoryV1Contract(chainId, providerOrSigner), [chainId, providerOrSigner])
}

// TODO GUIGUI getGameV1Contract
export const useGameV1Contract = (address: string) => {
  // const { data: signer } = useSigner()
  const providerOrSigner = useProviderOrSigner(true)
  const { chainId } = useActiveChainId()
  return useMemo(() => getGameV1Contract(address, chainId, providerOrSigner), [address, chainId, providerOrSigner])
}

export const useERC20 = (address: string, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getBep20Contract(address, providerOrSigner), [address, providerOrSigner])
}

/**
 * @see https://docs.openzeppelin.com/contracts/3.x/api/token/erc721
 */
export const useERC721 = (address: string, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getErc721Contract(address, providerOrSigner), [address, providerOrSigner])
}

export const useCake = (): { reader: Cake; signer: Cake } => {
  const providerOrSigner = useProviderOrSigner()
  return useMemo(
    () => ({
      reader: getCakeContract(null),
      signer: getCakeContract(providerOrSigner),
    }),
    [providerOrSigner],
  )
}

export const useErc721CollectionContract = (
  collectionAddress: string,
): { reader: Erc721collection; signer: Erc721collection } => {
  const { data: signer } = useSigner()
  return useMemo(
    () => ({
      reader: getErc721CollectionContract(null, collectionAddress),
      signer: getErc721CollectionContract(signer, collectionAddress),
    }),
    [signer, collectionAddress],
  )
}

// Code below migrated from Exchange useContract.ts

// returns null on errors
export function useContract<T extends Contract = Contract>(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
): T | null {
  const { provider } = useActiveWeb3React()

  const providerOrSigner = useProviderOrSigner(withSignerIfPossible) ?? provider

  const canReturnContract = useMemo(() => address && ABI && providerOrSigner, [address, ABI, providerOrSigner])

  return useMemo(() => {
    if (!canReturnContract) return null
    try {
      return getContract(address, ABI, providerOrSigner)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, providerOrSigner, canReturnContract]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWNativeContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract<Weth>(chainId ? WNATIVE[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract<Erc20Bytes32>(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): IPancakePair | null {
  return useContract(pairAddress, IPancakePairABI, withSignerIfPossible)
}

export function useMulticallContract() {
  // TODO Guigui load multicall contract adress and ABIs directly from internal
  const { chainId } = useActiveWeb3React()

  const address = internal[chainId] ? internal[chainId].MultiCall3.address : getMulticallAddress(chainId)
  const abi = internal[chainId] ? internal[chainId].MultiCall3.abi : multiCallAbi
  // if (internal[chainId])
  //   return useContract<Multicall>(internal[chainId].MultiCall3.address, internal[chainId].MultiCall3.abi, false)

  return useContract<Multicall>(address, abi, false)
}
