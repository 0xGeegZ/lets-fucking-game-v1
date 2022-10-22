import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()

  let gameImplementationAddress: string
  let cronUpkeepAddress: string
  // if (chainId === '31337') {
  const GameImplementation = await deployments.get('GameImplementation')
  gameImplementationAddress = GameImplementation.address

  const Cron = await deployments.get('CronExternal')
  const CronUpkeep = await deployments.get('CronUpkeep', {
    libraries: {
      Cron: Cron.address,
    },
  })
  cronUpkeepAddress = CronUpkeep.address

  // } else {
  //   gameImplementationAddress = networkConfig[chainId]
  //     .gameImplementation as string
  // }

  // TODO Display Log
  if (!gameImplementationAddress) return
  if (!cronUpkeepAddress) return

  // TODO add interface for constructorArgs
  // const constructorArgs: Array<string | number | Array<string | number>> = [
  //   '100000000000000',
  // ];

  // const registrationAmount = ethers.utils.parseUnits('0.1', 'gwei');
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

  await deploy('GameFactory', {
    from: deployer,
    args: [
      gameImplementationAddress,
      cronUpkeepAddress,
      houseEdge,
      creatorEdge,
      authorizedAmounts,
    ],
    log: true,
  })
}

func.tags = ['all', 'lfg', 'main', 'game-factory']

export default func
