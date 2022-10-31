import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)

  context('GameFactory createNewGame', function () {
    describe('when contract is paused', function () {
      it('should revert with correct message', async function () {
        await this.gameFactory.connect(this.owner).pause()

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              this.correctRegistrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizeDetails,
              { value: this.gameCreationAmount }
            ),
          'Pausable: paused'
        )
      })
    })

    describe('when the given this.maxPlayers is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const outOfRangeMaxPlayers1 = 101
        const outOfRangeMaxPlayers2 = 1

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              outOfRangeMaxPlayers1,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizeDetails,
              { value: this.gameCreationAmount }
            ),
          'maxPlayers should not be bigger than 100'
        )

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              outOfRangeMaxPlayers2,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizeDetails,
              { value: this.gameCreationAmount }
            ),
          'maxPlayers should be bigger than or equal to 2'
        )
      })
    })

    describe('when the given this.playTimeRange is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const outOfRangePlayTimeRange1 = 9
        const outOfRangePlayTimeRange2 = 0

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              outOfRangePlayTimeRange1,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizeDetails,
              { value: this.gameCreationAmount }
            ),
          'playTimeRange should not be bigger than 8'
        )

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              outOfRangePlayTimeRange2,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizeDetails,
              { value: this.gameCreationAmount }
            ),
          'playTimeRange should be bigger than 0'
        )
      })
    })

    describe('when new game gets created', function () {
      it('should create a new game with the correct data', async function () {
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

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseOwner = await clonedGameContract.owner()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseTreasuryFee = await clonedGameContract.treasuryFee()
        const responseCreatorFee = await clonedGameContract.creatorFee()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactory.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseTreasuryFee).to.be.equal(this.treasuryFee)
        expect(responseCreatorFee).to.be.equal(this.creatorFee)
      })

      it('should add the new game in deployedGames', async function () {
        const currentId = await this.gameFactory
          .connect(this.owner)
          .nextGameId()

        const currentGameImplementationVersionId = await this.gameFactory
          .connect(this.owner)
          .latestGameImplementationVersionId()

        const registrationAmountFirst =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizeDetailsFirst = this.prizeDetails
        updatedPrizeDetailsFirst[0].amount = registrationAmountFirst.mul(
          this.maxPlayers
        )

        await this.gameFactory
          .connect(this.bob)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            registrationAmountFirst,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizeDetailsFirst,
            { value: this.gameCreationAmount }
          )

        const registrationAmountSecond =
          this.authorizedAmounts[this.authorizedAmounts.length - 2]

        const updatedPrizeDetailsSecond = this.prizeDetails
        updatedPrizeDetailsSecond[0].amount = registrationAmountSecond.mul(
          this.maxPlayers
        )

        await this.gameFactory
          .connect(this.alice)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            registrationAmountSecond,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizeDetailsSecond,
            { value: this.gameCreationAmount }
          )

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const firstGame = deployedGames[deployedGames.length - 2]
        const secondGame = deployedGames[deployedGames.length - 1]

        expect(firstGame.id).to.be.equal(currentId)
        expect(firstGame.versionId).to.be.equal(
          currentGameImplementationVersionId
        )
        expect(firstGame.creator).to.be.equal(this.bob.address)

        expect(secondGame.id).to.be.equal(+currentId + 1)
        expect(secondGame.versionId).to.be.equal(
          currentGameImplementationVersionId
        )
        expect(secondGame.creator).to.be.equal(this.alice.address)
      })

      it('should emit the GameCreated event with the correct data', async function () {
        const currentId = await this.gameFactory
          .connect(this.owner)
          .nextGameId()

        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizeDetails = this.prizeDetails
        updatedPrizeDetails[0].amount = registrationAmount.mul(this.maxPlayers)

        await expect(
          this.gameFactory
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
        )
          .to.emit(this.gameFactory, 'GameCreated')
          .withArgs(currentId, anyValue, '0', this.bob.address)
      })
    })
  })

  context('GameFactory getDeployedGames', function () {
    it('should return all the deployed game lines', async function () {
      const deployedGamesBefore = await this.gameFactory
        .connect(this.owner)
        .getDeployedGames()

      const registrationAmountFirst = this.authorizedAmounts[1]

      const updatedPrizeDetailsFirst = this.prizeDetails
      updatedPrizeDetailsFirst[0].amount = registrationAmountFirst.mul(
        this.maxPlayers
      )

      await this.gameFactory
        .connect(this.bob)
        .createNewGame(
          this.gameName,
          this.gameImage,
          this.maxPlayers,
          this.playTimeRange,
          registrationAmountFirst,
          this.treasuryFee,
          this.creatorFee,
          this.encodedCron,
          updatedPrizeDetailsFirst,
          { value: this.gameCreationAmount }
        )

      const registrationAmountSecond = this.authorizedAmounts[2]

      const updatedPrizeDetailsSecond = this.prizeDetails
      updatedPrizeDetailsSecond[0].amount = registrationAmountSecond.mul(
        this.maxPlayers
      )

      await this.gameFactory
        .connect(this.alice)
        .createNewGame(
          this.gameName,
          this.gameImage,
          this.maxPlayers,
          this.playTimeRange,
          registrationAmountSecond,
          this.treasuryFee,
          this.creatorFee,
          this.encodedCron,
          updatedPrizeDetailsSecond,
          { value: this.gameCreationAmount }
        )

      const deployedGamesAfter = await this.gameFactory
        .connect(this.owner)
        .getDeployedGames()

      expect(deployedGamesAfter.length).to.be.equal(
        deployedGamesBefore.length + 2
      )
    })
  })
})
