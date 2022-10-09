import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'
import saveContractData from '../helpers/saveContractData'
// import { autoFundCheck } from '../utils'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  // TODO fund links to keeper
  // TODO instantiate Game for MVP
}

func.tags = ['all']

export default func
