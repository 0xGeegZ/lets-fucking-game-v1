import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { beforeEachGameFactory } from '../../../helpers/helpers'

describe('GameFactoryContract', function () {
  beforeEach(beforeEachGameFactory)

  context('GameFactory createNewGame', function () {
    describe('when contract is paused', function () {
      it('should revert with correct message', async function () {
        await this.gameFactoryContract.connect(this.owner).pause()

        await expectRevert(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              this.maxPlayers,
              this.playTimeRange,
              this.correctRegistrationAmount,
              this.encodedCron
            ),
          'Pausable: paused'
        )
      })
    })

    describe('when the given this.maxPlayers is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const outOfRangeMaxPlayers1 = 21
        const outOfRangeMaxPlayers2 = 1

        await expectRevert(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              outOfRangeMaxPlayers1,
              this.playTimeRange,
              this.correctRegistrationAmount,
              this.encodedCron
            ),
          'maxPlayers should not be bigger than 20'
        )

        await expectRevert(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              outOfRangeMaxPlayers2,
              this.playTimeRange,
              this.correctRegistrationAmount,
              this.encodedCron
            ),
          'maxPlayers should be bigger than or equal to 2'
        )
      })
    })

    describe('when the given this.playTimeRange is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const outOfRangePlayTimeRange1 = 9
        const outOfRangePlayTimeRange2 = 0

        await expectRevert(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              this.maxPlayers,
              outOfRangePlayTimeRange1,
              this.correctRegistrationAmount,
              this.encodedCron
            ),
          'playTimeRange should not be bigger than 8'
        )

        await expectRevert(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              this.maxPlayers,
              outOfRangePlayTimeRange2,
              this.correctRegistrationAmount,
              this.encodedCron
            ),
          'playTimeRange should be bigger than 0'
        )
      })
    })

    describe('when new game gets created', function () {
      it('should create a new game with the correct data', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]
        await this.gameFactoryContract
          .connect(this.bob)
          .createNewGame(
            this.maxPlayers,
            this.playTimeRange,
            registrationAmount,
            this.encodedCron
          )

        const deployedGames = await this.gameFactoryContract
          .connect(this.owner)
          .getDeployedGames()

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseGeneralAdmin = await clonedGameContract.generalAdmin()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseHouseEdge = await clonedGameContract.houseEdge()
        const responseCreatorEdge = await clonedGameContract.creatorEdge()

        expect(responseGeneralAdmin).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactoryContract.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseHouseEdge).to.be.equal(this.houseEdge)
        expect(responseCreatorEdge).to.be.equal(this.creatorEdge)
      })

      it('should add the new game in deployedGames', async function () {
        const currentId = await this.gameFactoryContract
          .connect(this.owner)
          .gameId()

        const currentGameImplementationVersionId =
          await this.gameFactoryContract
            .connect(this.owner)
            .latestGameImplementationVersionId()

        await this.gameFactoryContract
          .connect(this.bob)
          .createNewGame(
            this.maxPlayers,
            this.playTimeRange,
            this.authorizedAmounts[this.authorizedAmounts.length - 1],
            this.encodedCron
          )
        await this.gameFactoryContract
          .connect(this.alice)
          .createNewGame(
            this.maxPlayers,
            this.playTimeRange,
            this.authorizedAmounts[this.authorizedAmounts.length - 2],
            this.encodedCron
          )

        const deployedGames = await this.gameFactoryContract
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
        const currentId = await this.gameFactoryContract
          .connect(this.owner)
          .gameId()

        await expect(
          this.gameFactoryContract
            .connect(this.bob)
            .createNewGame(
              this.maxPlayers,
              this.playTimeRange,
              this.authorizedAmounts[this.authorizedAmounts.length - 1],
              this.encodedCron
            )
        )
          .to.emit(this.gameFactoryContract, 'GameCreated')
          .withArgs(currentId, anyValue, '0', this.bob.address)
      })
    })
  })

  context('GameFactory getDeployedGames', function () {
    it('should return all the deployed game lines', async function () {
      const deployedGamesBefore = await this.gameFactoryContract
        .connect(this.owner)
        .getDeployedGames()

      await this.gameFactoryContract
        .connect(this.bob)
        .createNewGame(
          this.maxPlayers,
          this.playTimeRange,
          this.authorizedAmounts[1],
          this.encodedCron
        )
      await this.gameFactoryContract
        .connect(this.alice)
        .createNewGame(
          this.maxPlayers,
          this.playTimeRange,
          this.authorizedAmounts[2],
          this.encodedCron
        )

      const deployedGamesAfter = await this.gameFactoryContract
        .connect(this.owner)
        .getDeployedGames()

      expect(deployedGamesAfter.length).to.be.equal(
        deployedGamesBefore.length + 2
      )
    })
  })
})
