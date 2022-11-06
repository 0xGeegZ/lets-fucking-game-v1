import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameV1Contract - Initialisation', function () {
  beforeEach(initialiseTestData)

  context('Contract Initialisation', function () {
    describe('when owner has deployed the Factory Contract', async function () {
      it('should be set as the owner of the created game', async function () {
        const contractAdmin = await this.deployedPayableGame.owner()
        expect(this.owner.address).to.equal(contractAdmin)
      })
    })

    describe('when creator creates the game', async function () {
      it('should be set as the creator of the game', async function () {
        const contractCreator = await this.deployedPayableGame.creator()
        expect(this.owner.address).to.equal(contractCreator)
      })
    })
  })
})
