import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { beforeEachGameFactory } from '../../../helpers/helpers'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { expectRevert } from '@openzeppelin/test-helpers'

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
    
    context('GameFactory updateAuthorizedAmounts', function () {
      describe('when authorized amounts is going to be update', function () {
        it('should be updated with correct amounts', async function () {
          const responseAuthorizedAmounts = await this.authorisedAmounts
          const responseNewAuthorizedAmounts = await this.newAuthorizedAmounts
          // Setter tasks
          expect(responseNewAuthorizedAmounts).to.be.an('array').and.to.be.empty.should.throw('New list of authorized amounts can not be empty')
          expect(responseNewAuthorizedAmounts).to.be.an('array').and.to.have.lengthOf(1).that.includes.same.members(responseAuthorizedAmounts).should.throw('New list of authorized amounts can not be already exists in authorized amounts')
          expect(responseNewAuthorizedAmounts).to.be.an('array').and.to.have.lengthOf(2).that.includes.same.members(responseAuthorizedAmounts).should.throw('New list of authorized amounts can not be already exists in authorized amounts')
          expect(responseNewAuthorizedAmounts).to.be.an('array').to.not.include.same.members(responseAuthorizedAmounts).and.to.have.lengthOf(1)
          expect(responseNewAuthorizedAmounts).to.be.an('array').to.not.include.same.members(responseAuthorizedAmounts).and.to.have.lengthOf(10)
          // i didn't find better solution to check if all values are unique
          // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
          const arrayWithUniqueValues = responseNewAuthorizedAmounts.filter((v, i, a) => a.indexOf(v) === i)
          expect(arrayWithUniqueValues).to.be.an('array').and.to.not.have.lengthOf(lengthOf(responseNewAuthorizedAmounts)).should.throw('New list of authorized amounts must contains unique values')
        })
      })
    })
  })
})
