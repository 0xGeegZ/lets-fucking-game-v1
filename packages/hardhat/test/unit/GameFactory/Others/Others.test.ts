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

  context('GameFactory setNewGameImplementation', function () {
    describe('when called by non admin', function () {
      it('should revert with correct message', async function () {
        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .setNewGameImplementation(this.gameImplementation.address),
          'Caller is not the admin'
        )
      })
    })

    describe('when called by admin', function () {
      it('should add the new implementation version to gameImplementations', async function () {
        await this.gameFactory
          .connect(this.owner)
          .setNewGameImplementation(this.secondGameImplementation.address)
        const responseGameImplementations1 =
          await this.gameFactory.gameImplementations('0')
        const responseGameImplementations2 =
          await this.gameFactory.gameImplementations('1')

        expect(responseGameImplementations1.id).to.be.equal('0')
        expect(responseGameImplementations1.deployedAddress).to.be.equal(
          this.gameImplementation.address
        )
        expect(responseGameImplementations2.id).to.be.equal('1')
        expect(responseGameImplementations2.deployedAddress).to.be.equal(
          this.secondGameImplementation.address
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
})
