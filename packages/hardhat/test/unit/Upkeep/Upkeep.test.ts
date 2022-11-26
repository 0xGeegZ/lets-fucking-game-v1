import { expect } from 'chai'

import { initialiseTestData } from '../../factories/setup'
import { ONE_DAY_IN_SECONDS, registerPlayer } from '../../helpers'

describe('Upkeep - Initialisation', function () {
  beforeEach(initialiseTestData)

  context('Contract Initialisation', function () {
    describe('when keeper is deployed', async function () {
      it('should upkeepNeeded return false', async function () {
        const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))
        const [upkeepNeeded] = await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)
        expect(upkeepNeeded).to.be.false
      })

      it('should checkUpkeep been executed', async function () {
        const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))

        await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS + 1])
        await ethers.provider.send('evm_mine')

        const [upkeepNeeded, performData] = await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        expect(upkeepNeeded).to.be.true

        await expect(
          this.cronUpkeep.connect(this.owner).performUpkeep(performData)
        ).to.emit(this.cronUpkeep, 'CronJobExecuted')
      })

      it('should checkUpkeep been executed when needed', async function () {
        const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))

        await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        for (let i = 0; i < 10; i++) {
          await registerPlayer({
            player: this.players[i],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })
        }

        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS + 1])
        await ethers.provider.send('evm_mine')

        const [upkeepNeeded, performData] = await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        expect(upkeepNeeded).to.be.true

        await expect(
          this.cronUpkeep.connect(this.owner).performUpkeep(performData)
        ).to.emit(this.cronUpkeep, 'CronJobExecuted')
        await ethers.provider.send('evm_mine')

        const [upkeepNeededAfter, performDataAfter] = await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        expect(upkeepNeededAfter).to.be.true

        await expect(
          this.cronUpkeep.connect(this.owner).performUpkeep(performDataAfter)
        ).to.emit(this.cronUpkeep, 'CronJobExecuted')
        await ethers.provider.send('evm_mine')

        const isStartedDeployableGame =
          await this.deployedPayableGame.isInProgress()

        const isStartedFreeGame = await this.deployedFreeGame.isInProgress()

        expect(isStartedDeployableGame).to.be.true
        expect(isStartedFreeGame).to.be.false

        const [shouldNotNeedUpdateAnymore] = await this.cronUpkeep
          .connect(this.owner)
          .callStatic.checkUpkeep(checkData)

        expect(shouldNotNeedUpdateAnymore).to.be.false
      })

      it('should checkUpkeep been executed and game data updated', async function () {
        const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(''))

        const initialRemainingPlayersCount =
          await this.deployedPayableGame.getRemainingPlayersCount()
        expect(initialRemainingPlayersCount.eq(0)).to.be.true

        for (let i = 0; i < 10; i++) {
          await registerPlayer({
            player: this.players[i],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })
        }

        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS + 1])
        await ethers.provider.send('evm_mine')

        let isNeedRecheckupkeep = true
        while (isNeedRecheckupkeep) {
          const [upkeepNeeded, performData] = await this.cronUpkeep
            .connect(this.owner)
            .callStatic.checkUpkeep(checkData)

          if (upkeepNeeded)
            await this.cronUpkeep.connect(this.owner).performUpkeep(performData)

          isNeedRecheckupkeep = upkeepNeeded
        }

        const isGameInProgress = await this.deployedPayableGame.isInProgress()
        expect(isGameInProgress).to.be.true

        const remainingPlayersCount =
          await this.deployedPayableGame.getRemainingPlayersCount()
        expect(remainingPlayersCount.eq(10)).to.be.true

        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS + 1])
        await ethers.provider.send('evm_mine')

        isNeedRecheckupkeep = true
        while (isNeedRecheckupkeep) {
          const [upkeepNeeded, performData] = await this.cronUpkeep
            .connect(this.owner)
            .callStatic.checkUpkeep(checkData)

          if (upkeepNeeded)
            await this.cronUpkeep.connect(this.owner).performUpkeep(performData)

          isNeedRecheckupkeep = upkeepNeeded
        }

        const updatingRemainingPlayersCount =
          await this.deployedPayableGame.getRemainingPlayersCount()

        expect(updatingRemainingPlayersCount.eq(0)).to.be.true

        const isGameInProgressUpdated =
          await this.deployedPayableGame.isInProgress()
        expect(isGameInProgressUpdated).to.be.false
      })
    })
  })
})
