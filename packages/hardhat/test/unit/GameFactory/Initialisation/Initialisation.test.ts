import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)
  context('GameImplementation deployed', function () {
    describe('when an account tries to initialize the base contract', function () {
      it('should revert with the correct reason', async function () {
        await expectRevert(
          this.gameImplementation.initialize({
            creator: this.bob.address,
            owner: this.owner.address,
            cronUpkeep: this.cronUpkeep.address,
            gameName: this.gameName,
            gameImage: this.gameImage,
            gameImplementationVersion: '0',
            gameId: '0',
            playTimeRange: this.playTimeRange,
            maxPlayers: this.maxPlayers,
            registrationAmount: this.correctRegistrationAmount,
            treasuryFee: this.treasuryFee,
            creatorFee: this.creatorFee,
            encodedCron: this.encodedCron,
            prizes: this.prizes,
          }),
          "The implementation contract can't be initialized"
        )
      })
    })
    describe('when the creator tries to initialize a game already initialized', function () {
      it('should revert with the correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers)

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
            updatedPrizes,
            { value: this.gameCreationAmount }
          )

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const clonedContract = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          clonedContract.deployedAddress
        )
        await expectRevert(
          clonedGameContract.initialize({
            creator: this.bob.address,
            owner: this.owner.address,
            cronUpkeep: this.cronUpkeep.address,
            gameName: this.gameName,
            gameImage: this.gameImage,
            gameImplementationVersion: '0',
            gameId: '0',
            playTimeRange: this.playTimeRange,
            maxPlayers: this.maxPlayers,
            registrationAmount: this.correctRegistrationAmount,
            treasuryFee: this.treasuryFee,
            creatorFee: this.creatorFee,
            encodedCron: this.encodedCron,
            prizes: this.prizes,
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
          await this.gameFactory.latestGameImplementationVersionId()
        const responseGameImplementation =
          await this.gameFactory.gameImplementations(
            responseLatestGameImplementationVersionId
          )
        const responseOwner = await this.gameFactory.owner()

        const responseAuthorizedAmounts =
          await this.gameFactory.getAuthorizedAmounts()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseLatestGameImplementationVersionId).to.be.equal('0')
        expect(responseGameImplementation.deployedAddress).to.be.equal(
          this.gameImplementation.address
        )
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
          this.gameImplementation.address,
          this.cronUpkeep.address,
          this.gameCreationAmount,
          this.authorizedAmounts
        )
        await gameFactoryContract.deployed()
      })
      it('should revert create game with no authorizedAmounts', async function () {
        const emptyauthorizedAmounts = []
        await expectRevert(
          this.GameFactoryContract.connect(this.owner).deploy(
            this.gameImplementation.address,
            this.cronUpkeep.address,
            this.gameCreationAmount,
            emptyauthorizedAmounts
          ),
          'authorizedAmounts should be greather or equal to 1'
        )
      })
      it('should revert create game with already used amount', async function () {
        const sameRegistrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = sameRegistrationAmount.mul(this.maxPlayers)

        await this.gameFactory
          .connect(this.bob)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            sameRegistrationAmount,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizes,
            { value: this.gameCreationAmount }
          )

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              sameRegistrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            ),
          'registrationAmout is already used'
        )
      })

      it('should revert create payable game with not ordered prizes list', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes.push(Object.assign({}, updatedPrizes[0]))

        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers * 0.8)
        updatedPrizes[0].position = 2

        updatedPrizes[1].amount = registrationAmount.mul(this.maxPlayers * 0.2)
        updatedPrizes[1].position = 1

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            ),
          'Prize list is not ordered'
        )
      })

      it('should revert create payable game with prizepool amount too low', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers * 0.8)

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            ),
          'Wrong total amount to won'
        )
      })

      it('should revert create payable game with prizepool amount too high', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers * 2)

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            ),
          'Wrong total amount to won'
        )
      })

      it('should revert create a not payable game without initial prizepool amount sent', async function () {
        const registrationAmount = 0
        const prizepool = ethers.utils.parseEther('1')

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = prizepool
        updatedPrizes[0].position = 1

        await expectRevert(
          this.gameFactory
            .connect(this.alice)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              updatedPrizes,
              { value: this.gameCreationAmount }
            ),
          'Need to send prizepool amount'
        )
      })
    })
  })
})
