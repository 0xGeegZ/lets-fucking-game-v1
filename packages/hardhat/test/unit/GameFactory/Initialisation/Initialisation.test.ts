import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { beforeEachGameFactory } from '../../../helpers/helpers'

describe('GameFactoryContract', function () {
  beforeEach(beforeEachGameFactory)

  context('GameImplementation deployed', function () {
    describe('when an account tries to initialize the base contract', function () {
      it('should revert with the correct reason', async function () {
        await expectRevert(
          this.gameImplementationContract.initialize({
            _initializer: this.secondAccount.address,
            _factoryOwner: this.owner.address,
            _gameImplementationVersion: '0',
            _gameId: '0',
            _roundLength: this.roundLength,
            _maxPlayers: this.maxPlayers,
            _registrationAmount: this.registrationAmount,
            _houseEdge: this.houseEdge,
            _creatorEdge: this.creatorEdge,
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
            this.registrationAmount
          )

        const clonedContract = await this.gameFactoryContract.deployedGames(0)
        const clonedGameContract = await this.GameImplementationContract.attach(
          clonedContract.deployedAddress
        )

        await expectRevert(
          clonedGameContract.initialize({
            _initializer: this.secondAccount.address,
            _factoryOwner: this.owner.address,
            _gameImplementationVersion: '0',
            _gameId: '0',
            _roundLength: this.roundLength,
            _maxPlayers: this.maxPlayers,
            _registrationAmount: this.registrationAmount,
            _houseEdge: this.houseEdge,
            _creatorEdge: this.creatorEdge,
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

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseLatestGameImplementationVersionId).to.be.equal('0')
        expect(responseGameImplementation.deployedAddress).to.be.equal(
          this.gameImplementationContract.address
        )
        expect(responseHouseEdge).to.be.equal(this.houseEdge)
        expect(responseCreatorEdge).to.be.equal(this.creatorEdge)
      })
    })
  })
})
