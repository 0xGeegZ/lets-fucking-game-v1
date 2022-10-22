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
            .connect(this.secondAccount)
            .createNewGame(
              this.maxPlayers,
              this.roundLength,
              this.registrationAmount,
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
            .connect(this.secondAccount)
            .createNewGame(
              outOfRangeMaxPlayers1,
              this.roundLength,
              this.registrationAmount,
              this.encodedCron
            ),
          'maxPlayers should not be bigger than 20'
        )

        await expectRevert(
          this.gameFactoryContract
            .connect(this.secondAccount)
            .createNewGame(
              outOfRangeMaxPlayers2,
              this.roundLength,
              this.registrationAmount,
              this.encodedCron
            ),
          'maxPlayers should be bigger than or equal to 2'
        )
      })
    })

    describe('when the given this.roundLength is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const outOfRangeRoundLength1 = 9
        const outOfRangeRoundLength2 = 0

        await expectRevert(
          this.gameFactoryContract
            .connect(this.secondAccount)
            .createNewGame(
              this.maxPlayers,
              outOfRangeRoundLength1,
              this.registrationAmount,
              this.encodedCron
            ),
          'roundLength should not be bigger than 8'
        )

        await expectRevert(
          this.gameFactoryContract
            .connect(this.secondAccount)
            .createNewGame(
              this.maxPlayers,
              outOfRangeRoundLength2,
              this.registrationAmount,
              this.encodedCron
            ),
          'roundLength should be bigger than 0'
        )
      })
    })

    describe('when new game gets created', function () {
      it('should create a new game with the correct data', async function () {
        await this.gameFactoryContract
          .connect(this.secondAccount)
          .createNewGame(
            this.maxPlayers,
            this.roundLength,
            this.registrationAmount,
            this.encodedCron
          )

        const newGame = await this.gameFactoryContract.deployedGames(0)

        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseGeneralAdmin = await clonedGameContract.generalAdmin()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responseRoundLength = await clonedGameContract.roundLength()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseHouseEdge = await clonedGameContract.houseEdge()
        const responseCreatorEdge = await clonedGameContract.creatorEdge()

        expect(responseGeneralAdmin).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.secondAccount.address)
        expect(responseFactory).to.be.equal(this.gameFactoryContract.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responseRoundLength).to.be.equal(this.roundLength)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(this.registrationAmount)
        expect(responseHouseEdge).to.be.equal(this.houseEdge)
        expect(responseCreatorEdge).to.be.equal(this.creatorEdge)
      })

      it('should add the new game in deployedGames', async function () {
        await this.gameFactoryContract
          .connect(this.secondAccount)
          .createNewGame(
            this.maxPlayers,
            this.roundLength,
            this.authorizedAmounts[1],
            this.encodedCron
          )
        await this.gameFactoryContract
          .connect(this.thirdAccount)
          .createNewGame(
            this.maxPlayers,
            this.roundLength,
            this.authorizedAmounts[2],
            this.encodedCron
          )

        const firstGame = await this.gameFactoryContract.deployedGames(0)
        const secondGame = await this.gameFactoryContract.deployedGames(1)

        expect(firstGame.id).to.be.equal('0')
        expect(firstGame.versionId).to.be.equal('0')
        expect(firstGame.creator).to.be.equal(this.secondAccount.address)
        expect(secondGame.id).to.be.equal('1')
        expect(secondGame.versionId).to.be.equal('0')
        expect(secondGame.creator).to.be.equal(this.thirdAccount.address)
      })

      it('should emit the GameCreated event with the correct data', async function () {
        await expect(
          this.gameFactoryContract
            .connect(this.secondAccount)
            .createNewGame(
              this.maxPlayers,
              this.roundLength,
              this.registrationAmount,
              this.encodedCron
            )
        )
          .to.emit(this.gameFactoryContract, 'GameCreated')
          .withArgs('0', anyValue, '0', this.secondAccount.address)
      })
    })
  })

  context('GameFactory getDeployedGames', function () {
    it('should return all the deployed game lines', async function () {
      await this.gameFactoryContract
        .connect(this.secondAccount)
        .createNewGame(
          this.maxPlayers,
          this.roundLength,
          this.authorizedAmounts[1],
          this.encodedCron
        )
      await this.gameFactoryContract
        .connect(this.thirdAccount)
        .createNewGame(
          this.maxPlayers,
          this.roundLength,
          this.authorizedAmounts[2],
          this.encodedCron
        )

      const deployedGames = await this.gameFactoryContract
        .connect(this.secondAccount)
        .getDeployedGames()

      expect(deployedGames.length).to.be.equal(2)
    })
  })
})
