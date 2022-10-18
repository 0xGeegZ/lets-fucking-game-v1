import { expect } from 'chai'

import {
  beforeEachGameImplementation,
  makePlayerLooseForNotPlaying,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECOND,
  registerPlayer,
  setUpGameReadyToPlay,
  setUpGameWithAWinner,
} from '../../../helpers/helpers'

describe('GameImplementationContract - Initialisation', function () {
  beforeEach(beforeEachGameImplementation)

  context('Contract Initialisation', function () {
    describe('when generalAdmin has deployed the Factory Contract', async function () {
      it('should be set as the generalAdmin of the created game', async function () {
        const contractAdmin = await this.contract.generalAdmin()
        expect(this.generalAdmin.address).to.equal(contractAdmin)
      })
    })

    describe('when creator creates the game', async function () {
      it('should be set as the creator of the game', async function () {
        const contractCreator = await this.contract.creator()
        expect(this.creator.address).to.equal(contractCreator)
      })
    })
  })
})
