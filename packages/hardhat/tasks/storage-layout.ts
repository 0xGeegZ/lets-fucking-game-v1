import { task } from 'hardhat/config'

task('storage-layout', 'Prints the storage layout', async (_, hre) => {
  await hre.storageLayout.export()
})
