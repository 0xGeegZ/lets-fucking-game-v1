import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)
  context('GameImplementation deployed', function () {
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
            prizeDetails: this.prizeDetails,
          }),
          "The implementation contract can't be initialized"
        )
      })
    })
    describe('when the creator tries to initialize a game already initialized', function () {
      it('should revert with the correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizeDetails = this.prizeDetails
        updatedPrizeDetails[0].amount = registrationAmount.mul(this.maxPlayers)

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
            updatedPrizeDetails,
            { value: this.gameCreationAmount }
          )

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const clonedContract = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
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
            prizeDetails: this.prizeDetails,
          }),
          'Contract already initialized'
        )
      })
    })
  })
  context('GameFactory constructor', function () {
    describe('when GameFactory gets deployed', function () {
      it('should set the correct values to state variables', async function () {
        const responseLatestGameImplementationVersionId =
          await this.gameFactory.latestGameImplementationVersionId()
        const responseGameImplementation =
          await this.gameFactory.gameImplementations(
            responseLatestGameImplementationVersionId
          )
        const responseOwner = await this.gameFactory.owner()

        const responseAuthorizedAmounts =
          await this.gameFactory.getAuthorizedAmounts()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseLatestGameImplementationVersionId).to.be.equal('0')
        expect(responseGameImplementation.deployedAddress).to.be.equal(
          this.gameImplementation.address
        )
        expect(responseAuthorizedAmounts.toString()).to.be.equal(
          this.authorizedAmounts.toString()
        )
      })
    })
  })
  context('GameFactory create game', function () {
    describe('when amount authorized is available', function () {
      it('should create a game', async function () {
        const gameFactoryContract = await this.GameFactoryContract.connect(
          this.owner
        ).deploy(
          this.gameImplementation.address,
          this.cronUpkeep.address,
          this.gameCreationAmount,
          this.authorizedAmounts
        )
        await gameFactoryContract.deployed()
      })
      it('should revert create game with no authorizedAmounts', async function () {
        const emptyauthorizedAmounts = []
        await expectRevert(
          this.GameFactoryContract.connect(this.owner).deploy(
            this.gameImplementation.address,
            this.cronUpkeep.address,
            this.gameCreationAmount,
            emptyauthorizedAmounts
          ),
          'authorizedAmounts should be greather or equal to 1'
        )
      })
      it('should revert create game with already used amount', async function () {
        const sameRegistrationAmount = this.authorizedAmounts[1]

        const updatedPrizeDetails = this.prizeDetails
        updatedPrizeDetails[0].amount = sameRegistrationAmount.mul(
          this.maxPlayers
        )

        await this.gameFactory
          .connect(this.bob)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            sameRegistrationAmount,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizeDetails,
            { value: this.gameCreationAmount }
          )

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              sameRegistrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizeDetails,
              { value: this.gameCreationAmount }
            ),
          'registrationAmout is already used'
        )
      })
    })
  })
})
