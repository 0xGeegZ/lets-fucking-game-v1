import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const cronExternal = await deployments.get('CronExternal')

  const gameImplementation = await deployments.get('GameImplementation', {
    libraries: {
      Cron: cronExternal.address,
    },
  })

  const cronUpkeep = await deployments.get('CronUpkeep', {
    libraries: {
      Cron: cronExternal.address,
    },
  })

  // TODO add interface for constructorArgs
  // const constructorArgs: Array<string | number | Array<string | number>> = [
  //   '100000000000000',
  // ];

  const houseEdge = ethers.utils.parseUnits('0.01', 'gwei')
  const creatorEdge = ethers.utils.parseUnits('0.005', 'gwei')

  const authorizedAmounts = [
    ethers.utils.parseEther('0.0001'),
    ethers.utils.parseEther('0.05'),
    ethers.utils.parseEther('0.1'),
    ethers.utils.parseEther('0.25'),
    ethers.utils.parseEther('0.50'),
    ethers.utils.parseEther('0.75'),
    ethers.utils.parseEther('1'),
    ethers.utils.parseEther('1.5'),
    ethers.utils.parseEther('2'),
    ethers.utils.parseEther('5'),
    ethers.utils.parseEther('10'),
  ]

  log('Deploying GameFactory contract')
  const gameFactory = await await deploy('GameFactory', {
    from: deployer,
    args: [
      gameImplementation.address,
      cronUpkeep.address,
      houseEdge,
      creatorEdge,
      authorizedAmounts,
    ],
    log: true,
  })
  log('Adding GameFactory to Keeper delegators')
  cronUpkeep.connect(deployer).addDelegator(gameFactory.address)
}

func.tags = ['all', 'lfg', 'main', 'game-factory']

export default func
