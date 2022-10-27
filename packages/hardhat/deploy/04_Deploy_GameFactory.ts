import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()

  const deployer = await ethers.getSigner(deployerAddress)

  const options = {
    from: deployerAddress,
    log: true,
  }

  const { address: cronExternalAddress } = await deployments.get('CronExternal')
  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  const { address: gameImplementationAddress } = await deployments.get(
    'GameImplementation',
    libraries
  )

  const { address: cronUpkeepAddress } = await deployments.get(
    'CronUpkeep',
    libraries
  )
  // TODO add interface for constructorArgs
  // const constructorArgs: Array<string | number | Array<string | number>> = [
  //   '100000000000000',
  // ];

  const houseEdge = ethers.utils.parseUnits('0.00005')
  const creatorEdge = ethers.utils.parseUnits('0.00005')

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
  const {
    address: gameFactoryAddress,
    newlyDeployed: gameFactoryNewlyDeployed,
    receipt: { gasUsed: gameFactoryGasUsed },
  } = await deploy('GameFactory', {
    ...options,
    args: [
      gameImplementationAddress,
      cronUpkeepAddress,
      houseEdge,
      creatorEdge,
      authorizedAmounts,
    ],
  })

  if (gameFactoryNewlyDeployed) {
    log(
      `Contract GameFactory deployed at ${gameFactoryAddress} using ${gameFactoryGasUsed} gas`
    )
  }

  log('Adding GameFactory to Keeper delegators')
  const { interface: cronUpkeepInterface } = await ethers.getContractFactory(
    'CronUpkeep',
    libraries
  )

  const cronUpkeep = new ethers.Contract(
    cronUpkeepAddress,
    cronUpkeepInterface,
    deployer
  )
  cronUpkeep.addDelegator(gameFactoryAddress)
}

func.tags = ['all', 'lfg', 'main', 'game-factory']
module.exports.dependencies = ['game-implementation', 'keeper']

export default func
