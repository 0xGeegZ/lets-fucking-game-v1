import useSWR from 'swr'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { getCrossFarmingSenderContract } from 'utils/contractHelpers'

export const useFirstTimeCrossGaming = (vaultPid: number) => {
  const { account, chainId } = useActiveWeb3React()
  const crossGamingAddress = getCrossFarmingSenderContract(null, chainId)

  const { data } = useSWR(account && vaultPid && chainId && ['isFirstTimeCrossGaming'], async () => {
    const firstTimeDeposit = await crossGamingAddress.is1st(account)
    return !firstTimeDeposit
  })

  return { isFirstTime: data }
}
