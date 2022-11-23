import { useCallback } from 'react'
import { MaxUint256 } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { useCallWithMarketGasPrice } from 'hooks/useCallWithMarketGasPrice'

const useApproveGame = (contract: Contract, chainId: number) => {
  // TODO GUIGUI LOAD CONTRACT ADDRESS
  // const isBscNetwork = verifyBscNetwork(chainId)
  // const contractAddress = isBscNetwork ? getMasterChefAddress(chainId) : getNonBscVaultAddress(chainId)
  const contractAddress = contract.address

  const { callWithMarketGasPrice } = useCallWithMarketGasPrice()
  const handleApprove = useCallback(async () => {
    return callWithMarketGasPrice(contract, 'approve', [contractAddress, MaxUint256])
  }, [contract, contractAddress, callWithMarketGasPrice])

  return { onApprove: handleApprove }
}

export default useApproveGame
