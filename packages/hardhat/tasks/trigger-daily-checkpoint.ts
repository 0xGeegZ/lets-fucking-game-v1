import { task } from 'hardhat/config'

task(
  'trigger-daily-checkpoint',
  'Trigger daily Checkpoint for given contract address'
)
  .addParam('contract', 'The address of the contract')
  .setAction(async (taskArgs, hre) => {
    const contractAddr: string = taskArgs.contract

    console.log('Trying to trigger Daily Checkpoint for contract', contractAddr)

    // await deployments.fixture()

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

    const { interface: gameInterface } = await hre.ethers.getContractFactory(
      'GameV1',
      libraries
    )

    try {
      const game = new hre.ethers.Contract(
        contractAddr,
        gameInterface,
        deployer
      )

      await game.triggerDailyCheckpoint()
      console.log('✅ Trigger Daily Checkpoint for contract', contractAddr)
    } catch (error) {
      console.error(error)
    }
  })
