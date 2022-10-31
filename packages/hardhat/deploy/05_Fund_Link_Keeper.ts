import { ethers, run } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, DeployFunction } from 'hardhat-deploy/types'

import { networkConfig } from '../config/networkConfig'
import { autoFundCheck } from '../helpers/autoFundCheck'

const func: DeployFunction = async function ({
  deployments,
  getChainId,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { get } = deployments
  const chainId = await getChainId()
  let linkTokenAddress: string

  if (chainId === '31337' || chainId === '1337') {
    const linkToken = await get('LinkToken')
    linkTokenAddress = linkToken.address
  } else {
    linkTokenAddress = networkConfig[chainId].linkToken as string
  }

  const CronUpkeep = await deployments.get('CronUpkeep')
  const cronUpkeep = await ethers.getContractAt(
    'CronUpkeep',
    CronUpkeep.address
  )
  if (await autoFundCheck(cronUpkeep.address, chainId, linkTokenAddress)) {
    await run('fund-link', {
      contract: cronUpkeep.address,
      linkaddress: linkTokenAddress,
    })
  }
}

func.tags = ['all', 'lfg', 'main', 'fund-link']
module.exports.dependencies = ['keeper']

export default func
