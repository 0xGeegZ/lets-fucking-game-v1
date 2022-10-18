import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { beforeEachGameFactory } from '../../../helpers/helpers'

describe('GameFactoryContract', function () {
  beforeEach(beforeEachGameFactory)
  context('GameFactory setAdmin', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactoryContract
            .connect(this.thirdAccount)
            .setAdmin(this.thirdAccount.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should transfer the administration to given address', async function () {
        await this.gameFactoryContract
          .connect(this.owner)
          .setAdmin(this.thirdAccount.address)
        const newAdmin = await this.gameFactoryContract.owner()

        expect(newAdmin).to.be.equal(this.thirdAccount.address)
      })
    })
  })

  context('GameFactory withdrawFunds', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactoryContract
            .connect(this.thirdAccount)
            .withdrawFunds(this.thirdAccount.address),
          'Caller is not the admin'
        )
      })
    })
  })

  context('GameFactory setNewGameImplementation', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactoryContract
            .connect(this.thirdAccount)
            .setNewGameImplementation(this.gameImplementationContract.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should add the new implementation version to gameImplementations', async function () {
        await this.gameFactoryContract
          .connect(this.owner)
          .setNewGameImplementation(
            this.secondGameImplementationContract.address
          )
        const responseGameImplementations1 =
          await this.gameFactoryContract.gameImplementations('0')
        const responseGameImplementations2 =
          await this.gameFactoryContract.gameImplementations('1')

        expect(responseGameImplementations1.id).to.be.equal('0')
        expect(responseGameImplementations1.deployedAddress).to.be.equal(
          this.gameImplementationContract.address
        )
        expect(responseGameImplementations2.id).to.be.equal('1')
        expect(responseGameImplementations2.deployedAddress).to.be.equal(
          this.secondGameImplementationContract.address
        )
      })
    })
  })
})
