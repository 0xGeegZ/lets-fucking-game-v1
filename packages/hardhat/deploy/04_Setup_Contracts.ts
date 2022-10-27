// import { autoFundCheck } from '../utils'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction, DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  // TODO fund links to keeper
  // npx hardhat fund-link --contract  0x524Bf15C1d63581Fcf27bC34105542F53AA378Bb
  // https://blog.chain.link/using-chainlink-with-hardhat/
  log('Run the following command to fund contract with LINK:')
  log(
    'npx hardhat fund-link --contract ' +
      lottery.address +
      ' --network ' +
      config[chainId].name +
      additionalMessage
  )
  log('----------------------------------------------------')
  // TODO instantiate Game for MVP
}

func.tags = ['all']

export default func
