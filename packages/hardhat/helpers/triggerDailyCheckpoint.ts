import { ethers } from 'hardhat'

export const triggerDailyCheckpoint = async (contractAddr: string) => {
  console.log('Trying to trigger Daily Checkpoint for contract', contractAddr)
  const accounts = await ethers.getSigners()
  const signer = accounts[0]

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

  const game = new ethers.Contract(contractAddr, gameInterface, signer)

  await game.triggerDailyCheckpoint()
}
