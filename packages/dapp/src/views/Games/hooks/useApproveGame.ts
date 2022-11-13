import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { useCallWithMarketGasPrice } from 'hooks/useCallWithMarketGasPrice'
import { verifyBscNetwork } from 'utils/verifyBscNetwork'

const useApproveGame = (lpContract: Contract, chainId: number) => {
  // TODO GUIGUI LOAD CONTRACT ADRESS
  // const isBscNetwork = verifyBscNetwork(chainId)
  // const contractAddress = isBscNetwork ? getMasterChefAddress(chainId) : getNonBscVaultAddress(chainId)
  const contractAddress = lpContract.address

  const { callWithMarketGasPrice } = useCallWithMarketGasPrice()
  const handleApprove = useCallback(async () => {
    return callWithMarketGasPrice(lpContract, 'approve', [contractAddress, MaxUint256])
  }, [lpContract, contractAddress, callWithMarketGasPrice])

  return { onApprove: handleApprove }
}

export default useApproveGame

export const useApproveBoostProxyGame = (lpContract: Contract, proxyAddress?: string) => {
  const { callWithMarketGasPrice } = useCallWithMarketGasPrice()
  const handleApprove = useCallback(async () => {
    return proxyAddress && callWithMarketGasPrice(lpContract, 'approve', [proxyAddress, MaxUint256])
  }, [lpContract, proxyAddress, callWithMarketGasPrice])

  return { onApprove: handleApprove }
}
