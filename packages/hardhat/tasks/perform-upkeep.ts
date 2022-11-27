import { task } from 'hardhat/config'

task('perform-upkeep', 'Perform upkeep for given upkeep address')
  .addParam('upkeep', 'The address of the upkeep')
  .setAction(async (taskArgs, hre) => {
    const upkeepAddr: string = taskArgs.upkeep

    console.log('Trying to call perform upkeep for contract', upkeepAddr)

    const accounts = await hre.ethers.getSigners()
    const deployer = accounts[0]

    const { address: cronExternalAddress } = await hre.deployments.get(
      'CronExternal'
    )
    const libraries = {
      libraries: {
        Cron: cronExternalAddress,
      },
    }

    const { interface: cronUpkeepInterface } = await ethers.getContractFactory(
      'CronUpkeep',
      libraries
    )

    try {
      const cronUpkeep = new hre.ethers.Contract(
        upkeepAddr,
        cronUpkeepInterface,
        deployer
      )

      const checkData = hre.ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))

      const [upkeepNeeded, performData] = await cronUpkeep
        .connect(deployer)
        .callStatic.checkUpkeep(checkData)

      if (upkeepNeeded) {
        console.log(
          'upkeepNeeded, calling performUpkeep with performData',
          performData
        )
        await cronUpkeep.connect(deployer).performUpkeep(performData)
        console.log('✅ Perform Upkeep done contract', upkeepAddr)
      } else console.log('upkeepNeeded is not needed')
    } catch (error) {
      console.error(error)
    }
  })
