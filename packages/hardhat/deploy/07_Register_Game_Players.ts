import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { log } = deployments

  const { deployer: deployerAddress } = await getNamedAccounts()
  const [...players] = (await ethers.getSigners()).slice(1, 10)

  const deployer = await ethers.getSigner(deployerAddress)

  const registrationAmount = ethers.utils.parseEther('0.0001')

  const { address: cronExternalAddress } = await deployments.get('CronExternal')
  const libraries = {
    libraries: {
      Cron: cronExternalAddress,
    },
  }

  const { interface: gameInterface } = await ethers.getContractFactory(
    'GameV1',
    libraries
  )

  const { address: gameFactoryAddress } = await deployments.get('GameFactory')

  const { interface: gameFactoryInterface } = await ethers.getContractFactory(
    'GameFactory'
  )

  const gameFactory = new ethers.Contract(
    gameFactoryAddress,
    gameFactoryInterface,
    deployer
  )

  log('Register 9 players to payable game')

  const { deployedAddress: payableGameDeployedAddress } =
    await gameFactory.deployedGames('0')

  const payableGame = new ethers.Contract(
    payableGameDeployedAddress,
    gameInterface,
    deployer
  )

  await Promise.all(
    players.map((player) =>
      payableGame.connect(player).registerForGame({ value: registrationAmount })
    )
  )
  log(`✅ 9 players registered to payable game`)

  log('Register 9 players to free game')
  const { deployedAddress: freeGameDeployedAddress } =
    await gameFactory.deployedGames('1')

  const freeGame = new ethers.Contract(
    freeGameDeployedAddress,
    gameInterface,
    deployer
  )

  await Promise.all(
    players.map((player) => freeGame.connect(player).registerForGame())
  )
  log(`✅ 9 players registered to free game`)
}

func.tags = ['all', 'dev', 'staging', 'register-game-players']
func.dependencies = ['create-games']

export default func
