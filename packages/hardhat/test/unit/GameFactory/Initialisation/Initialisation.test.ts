import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { beforeEachGameFactory } from '../../../helpers/helpers'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { expectRevert } from '@openzeppelin/test-helpers'

describe('GameFactoryContract', function () {
  beforeEach(beforeEachGameFactory)
  context('GameImplementation deployed', function () {
    describe('when an account tries to initialize the base contract', function () {
      it('should revert with the correct reason', async function () {
        await expectRevert(
          this.gameImplementationContract.initialize({
            _initializer: this.secondAccount.address,
            _factoryOwner: this.owner.address,
            _cronUpkeep: this.cronUpkeepContract.address,
            _gameImplementationVersion: '0',
            _gameId: '0',
            _roundLength: this.roundLength,
            _maxPlayers: this.maxPlayers,
            _registrationAmount: this.registrationAmount,
            _houseEdge: this.houseEdge,
            _creatorEdge: this.creatorEdge,
            _encodedCron: this.encodedCron,
          }),
          "The implementation contract can't be initialized"
        )
      })
    })
    describe('when the creator tries to initialize a game already initialized', function () {
      it('should revert with the correct message', async function () {
        await this.gameFactoryContract
          .connect(this.secondAccount)
          .createNewGame(
            this.maxPlayers,
            this.roundLength,
            this.registrationAmount,
            this.encodedCron
          )
        const clonedContract = await this.gameFactoryContract.deployedGames(0)
        const clonedGameContract = await this.GameImplementationContract.attach(
          clonedContract.deployedAddress
        )
        await expectRevert(
          clonedGameContract.initialize({
            _initializer: this.secondAccount.address,
            _factoryOwner: this.owner.address,
            _cronUpkeep: this.cronUpkeepContract.address,
            _gameImplementationVersion: '0',
            _gameId: '0',
            _roundLength: this.roundLength,
            _maxPlayers: this.maxPlayers,
            _registrationAmount: this.registrationAmount,
            _houseEdge: this.houseEdge,
            _creatorEdge: this.creatorEdge,
            _encodedCron: this.encodedCron,
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
          await this.gameFactoryContract.latestGameImplementationVersionId()
        const responseGameImplementation =
          await this.gameFactoryContract.gameImplementations(
            responseLatestGameImplementationVersionId
          )
        const responseOwner = await this.gameFactoryContract.owner()
        const responseHouseEdge = await this.gameFactoryContract.houseEdge()
        const responseCreatorEdge = await this.gameFactoryContract.creatorEdge()
        const responseAuthorizedAmounts =
          await this.gameFactoryContract.getAuthorisedAmounts()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseLatestGameImplementationVersionId).to.be.equal('0')
        expect(responseGameImplementation.deployedAddress).to.be.equal(
          this.gameImplementationContract.address
        )
        expect(responseHouseEdge).to.be.equal(this.houseEdge)
        expect(responseCreatorEdge).to.be.equal(this.creatorEdge)
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
          this.gameImplementationContract.address,
          this.cronUpkeepContract.address,
          this.houseEdge,
          this.creatorEdge,
          this.authorizedAmounts
        )
        await gameFactoryContract.deployed()
      })
      it('should revert create game with no authorizedAmounts', async function () {
        const emptyauthorizedAmounts = []
        await expectRevert(
          this.GameFactoryContract.connect(this.owner).deploy(
            this.gameImplementationContract.address,
            this.cronUpkeepContract.address,
            this.houseEdge,
            this.creatorEdge,
            emptyauthorizedAmounts
          ),
          'authorizedAmounts should be greather or equal to 1'
        )
      })
      it('should revert create game with already used amount', async function () {
        const sameRegistrationAmount = this.authorizedAmounts[1]
        await this.gameFactoryContract
          .connect(this.secondAccount)
          .createNewGame(
            this.maxPlayers,
            this.roundLength,
            sameRegistrationAmount,
            this.encodedCron
          )

        await expectRevert(
          this.gameFactoryContract
            .connect(this.thirdAccount)
            .createNewGame(
              this.maxPlayers,
              this.roundLength,
              sameRegistrationAmount,
              this.encodedCron
            ),
          'registrationAmout is already used'
        )
      })
    })
  })
})
