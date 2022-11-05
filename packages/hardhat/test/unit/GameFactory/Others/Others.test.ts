import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)
  context('GameFactory transferOwnership', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .transferAdminOwnership(this.alice.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should transfer the administration to given address', async function () {
        await this.gameFactory
          .connect(this.owner)
          .transferAdminOwnership(this.alice.address)
        const newAdmin = await this.gameFactory.owner()

        expect(newAdmin).to.be.equal(this.alice.address)
      })
    })
  })

  context('GameFactory withdrawFunds', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactory.connect(this.alice).withdrawFunds(),
          'Caller is not the admin'
        )
      })
    })
  })

  context('GameFactory setNewGameV1', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactory.connect(this.alice).setNewGameV1(this.game.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should add the new implementation version to games', async function () {
        await this.gameFactory
          .connect(this.owner)
          .setNewGameV1(this.secondGameV1.address)
        const responseGameV1s1 = await this.gameFactory.games('0')
        const responseGameV1s2 = await this.gameFactory.games('1')

        expect(responseGameV1s1.id).to.be.equal('0')
        expect(responseGameV1s1.deployedAddress).to.be.equal(this.game.address)
        expect(responseGameV1s2.id).to.be.equal('1')
        expect(responseGameV1s2.deployedAddress).to.be.equal(
          this.secondGameV1.address
        )
      })
    })
  })

  context('GameFactory addAuthorizedAmounts', function () {
    describe('when admin update authorizedAmounts', function () {
      it('should be updated with correct amounts', async function () {
        const toUpdateAuthorizedAmounts = [ethers.utils.parseEther('999')]

        const responseAuthorizedAmountsBefore = await this.gameFactory
          .connect(this.owner)
          .getAuthorizedAmounts()

        await this.gameFactory
          .connect(this.owner)
          .addAuthorizedAmounts(toUpdateAuthorizedAmounts)

        const responseAuthorizedAmountsAfter = await this.gameFactory
          .connect(this.owner)
          .getAuthorizedAmounts()

        expect(responseAuthorizedAmountsBefore.length + 1).to.be.equal(
          responseAuthorizedAmountsAfter.length
        )
      })

      it('should be updated with no duplicates amounts', async function () {
        const toUpdateAuthorizedAmounts = [
          ...this.authorizedAmounts,
          ethers.utils.parseEther('999'),
          ethers.utils.parseEther('999'),
        ]

        const responseAuthorizedAmountsBefore = await this.gameFactory
          .connect(this.owner)
          .getAuthorizedAmounts()

        await this.gameFactory
          .connect(this.owner)
          .addAuthorizedAmounts(toUpdateAuthorizedAmounts)

        const responseAuthorizedAmountsAfter = await this.gameFactory
          .connect(this.owner)
          .getAuthorizedAmounts()

        expect(responseAuthorizedAmountsBefore.length + 1).to.be.equal(
          responseAuthorizedAmountsAfter.length
        )
      })
    })
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        const toUpdateAuthorizedAmounts = [ethers.utils.parseEther('999')]

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .addAuthorizedAmounts(toUpdateAuthorizedAmounts),
          'Caller is not the admin'
        )
      })
    })
  })

  context('GameFactory updateCronUpkeep', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .updateCronUpkeep(this.owner.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should update keeper address for the factory and all games and associated keeper job', async function () {
        // TODO deploy a new keeper to update keeper data
        // this.gameFactory.connect(this.owner).updateCronUpkeep(this.owner.address)
        expect(true).to.be.false
      })

      it('should revert if keeper address is not a contract address', async function () {
        await expectRevert(
          this.gameFactory
            .connect(this.owner)
            .updateCronUpkeep(this.bob.address),
          'Transaction reverted: function call to a non-contract account'
        )
      })
      it('should revert if keeper address is not initialized', async function () {
        await expectRevert(
          this.gameFactory.connect(this.owner).updateCronUpkeep(''),
          'resolver or addr is not configured for ENS name'
        )
      })
    })
  })

  context(
    'GameFactory pauseAllGamesAndFactory & resumeAllGamesAndFactory',
    function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.gameFactory.connect(this.bob).pauseAllGamesAndFactory(),
            'Caller is not the admin'
          )
          await expectRevert(
            this.gameFactory.connect(this.bob).resumeAllGamesAndFactory(),
            'Caller is not the admin'
          )
        })
      })

      describe('when called by admin', function () {
        it('should pause the factory and all games and associated keeper job', async function () {
          await this.gameFactory.connect(this.owner).pauseAllGamesAndFactory()

          await expectRevert(
            this.gameFactory
              .connect(this.owner)
              .createNewGame(
                this.gameName,
                this.gameImage,
                this.maxPlayers,
                this.playTimeRange,
                this.correctRegistrationAmount,
                this.treasuryFee,
                this.creatorFee,
                this.encodedCron,
                this.prizes,
                { value: this.gameCreationAmount }
              ),
            'Pausable: paused'
          )
        })

        it('should resume the factory and all games and associated keeper job', async function () {
          await this.gameFactory.connect(this.owner).pauseAllGamesAndFactory()
          await this.gameFactory.connect(this.owner).resumeAllGamesAndFactory()

          const registrationAmount =
            this.authorizedAmounts[this.authorizedAmounts.length - 1]

          const updatedPrizes = this.prizes
          updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers)

          await this.gameFactory
            .connect(this.owner)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            )
        })

        it('should revert if call resumeAllGamesAndFactory before pauseAllGamesAndFactory', async function () {
          await expectRevert(
            this.gameFactory.connect(this.owner).resumeAllGamesAndFactory(),
            'Pausable: not paused'
          )
          await this.gameFactory.connect(this.owner).pauseAllGamesAndFactory()

          await expectRevert(
            this.gameFactory.connect(this.owner).pauseAllGamesAndFactory(),
            'Pausable: paused'
          )
        })
      })
    }
  )
})
