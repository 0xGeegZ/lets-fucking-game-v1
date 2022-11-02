import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)
  context('GameImplementationV1 deployed', function () {
    // TODO should only allow factoy to call initialize function ?

    describe('when an account tries to initialize the base contract', function () {
      it('should revert with the correct reason', async function () {
        await expectRevert(
          this.gameImplementation.initialize({
            creator: this.bob.address,
            owner: this.owner.address,
            cronUpkeep: this.cronUpkeep.address,
            gameName: this.gameName,
            gameImage: this.gameImage,
            gameImplementationVersion: '0',
            gameId: '0',
            playTimeRange: this.playTimeRange,
            maxPlayers: this.maxPlayers,
            registrationAmount: this.correctRegistrationAmount,
            treasuryFee: this.treasuryFee,
            creatorFee: this.creatorFee,
            encodedCron: this.encodedCron,
            prizes: this.prizes,
          }),
          "The implementation contract can't be initialized"
        )
      })
    })
    describe('when the creator tries to initialize a game already initialized', function () {
      it('should revert with the correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers)

        await this.gameFactory
          .connect(this.bob)
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

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const clonedContract = deployedGames[deployedGames.length - 1]
        const clonedGameContract =
          await this.GameImplementationV1Contract.attach(
            clonedContract.deployedAddress
          )
        await expectRevert(
          clonedGameContract.initialize({
            creator: this.bob.address,
            owner: this.owner.address,
            cronUpkeep: this.cronUpkeep.address,
            gameName: this.gameName,
            gameImage: this.gameImage,
            gameImplementationVersion: '0',
            gameId: '0',
            playTimeRange: this.playTimeRange,
            maxPlayers: this.maxPlayers,
            registrationAmount: this.correctRegistrationAmount,
            treasuryFee: this.treasuryFee,
            creatorFee: this.creatorFee,
            encodedCron: this.encodedCron,
            prizes: this.prizes,
          }),
          'Contract already initialized'
        )
      })
    })
  })
  context('GameFactory constructor', function () {
    describe('when GameFactory gets deployed', function () {
      it('should set the correct values to state variables', async function () {
        const responseLatestGameImplementationV1VersionId =
          await this.gameFactory.latestGameImplementationVersionId()
        const responseGameImplementationV1 =
          await this.gameFactory.gameImplementations(
            responseLatestGameImplementationV1VersionId
          )
        const responseOwner = await this.gameFactory.owner()

        const responseAuthorizedAmounts =
          await this.gameFactory.getAuthorizedAmounts()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseLatestGameImplementationV1VersionId).to.be.equal('0')
        expect(responseGameImplementationV1.deployedAddress).to.be.equal(
          this.gameImplementation.address
        )
        expect(responseAuthorizedAmounts.toString()).to.be.equal(
          this.authorizedAmounts.toString()
        )
      })
    })
  })
})
