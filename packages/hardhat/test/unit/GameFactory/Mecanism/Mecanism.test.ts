import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

import { initialiseTestData } from '../../../factories/setup'

describe('GameFactoryContract', function () {
  beforeEach(initialiseTestData)

  context('GameFactory createNewGame', function () {
    describe('when create a payable game', function () {
      it('should create a payable game with simple winner', async function () {
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

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseOwner = await clonedGameContract.owner()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseTreasuryFee = await clonedGameContract.treasuryFee()
        const responseCreatorFee = await clonedGameContract.creatorFee()

        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactory.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseTreasuryFee).to.be.equal(this.treasuryFee)
        expect(responseCreatorFee).to.be.equal(this.creatorFee)
      })

      it('should create a payable game with multiple winners', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = []
        updatedPrizes.push({ ...this.prizes[0] })
        updatedPrizes.push({ ...this.prizes[0] })

        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers * 0.8)
        updatedPrizes[0].position = 1

        updatedPrizes[1].amount = registrationAmount.mul(this.maxPlayers * 0.2)
        updatedPrizes[1].position = 2

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

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseOwner = await clonedGameContract.owner()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseTreasuryFee = await clonedGameContract.treasuryFee()
        const responseCreatorFee = await clonedGameContract.creatorFee()
        const responsePrizes = await clonedGameContract.getPrizes(
          responseGameId
        )
        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactory.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseTreasuryFee).to.be.equal(this.treasuryFee)
        expect(responseCreatorFee).to.be.equal(this.creatorFee)
        expect(responsePrizes.length).to.be.equal(updatedPrizes.length)
        expect(responsePrizes[0].amount).to.be.equal(
          registrationAmount.mul(this.maxPlayers * 0.8)
        )
        expect(responsePrizes[0].position).to.be.equal(1)
        expect(responsePrizes[1].amount).to.be.equal(
          registrationAmount.mul(this.maxPlayers * 0.2)
        )
        expect(responsePrizes[1].position).to.be.equal(2)
      })

      it('should revert create payable game with no authorizedAmounts', async function () {
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

      it('should revert create payable game with already used amount', async function () {
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

        const updatedPrizes = []
        updatedPrizes.push({ ...this.prizes[0] })
        updatedPrizes.push({ ...this.prizes[0] })

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
    })

    describe('when create a free game', function () {
      it('should create a free game with simple winner', async function () {
        const registrationAmount = 0
        const prizepool = 1

        const updatedPrizes = []
        updatedPrizes.push({ ...this.prizes[0] })
        updatedPrizes[0].amount = ethers.utils.parseEther(`${prizepool}`)

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
            {
              value: this.gameCreationAmount.add(
                ethers.utils.parseEther(`${prizepool}`)
              ),
            }
          )

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseOwner = await clonedGameContract.owner()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseTreasuryFee = await clonedGameContract.treasuryFee()
        const responseCreatorFee = await clonedGameContract.creatorFee()
        const responsePrizes = await clonedGameContract.getPrizes(
          responseGameId
        )
        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactory.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseTreasuryFee).to.be.equal(this.treasuryFee)
        expect(responseCreatorFee).to.be.equal(this.creatorFee)
        expect(responsePrizes.length).to.be.equal(updatedPrizes.length)
        expect(responsePrizes[0].amount).to.be.equal(
          ethers.utils.parseEther(`${prizepool}`)
        )
        expect(responsePrizes[0].position).to.be.equal(1)
      })

      it('should create a free game with multiple winners', async function () {
        const registrationAmount = 0
        const prizepool = 1

        const updatedPrizes = []
        updatedPrizes.push({ ...this.prizes[0] })
        updatedPrizes.push({ ...this.prizes[0] })

        updatedPrizes[0].amount = ethers.utils.parseEther(`${prizepool * 0.8}`)
        updatedPrizes[1].amount = ethers.utils.parseEther(`${prizepool * 0.2}`)
        updatedPrizes[1].position = 2

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
            {
              value: this.gameCreationAmount.add(
                ethers.utils.parseEther(`${prizepool}`)
              ),
            }
          )

        const deployedGames = await this.gameFactory
          .connect(this.owner)
          .getDeployedGames()

        const newGame = deployedGames[deployedGames.length - 1]
        const clonedGameContract = await this.GameImplementationContract.attach(
          newGame.deployedAddress
        )

        const responseOwner = await clonedGameContract.owner()
        const responseCreator = await clonedGameContract.creator()
        const responseFactory = await clonedGameContract.factory()
        const responseGameId = await clonedGameContract.roundId()
        const responseGameImplementationVersion =
          await clonedGameContract.gameImplementationVersion()
        const responsePlayTimeRange = await clonedGameContract.playTimeRange()
        const responseMaxPlayers = await clonedGameContract.maxPlayers()
        const responseRegistrationAmount =
          await clonedGameContract.registrationAmount()
        const responseTreasuryFee = await clonedGameContract.treasuryFee()
        const responseCreatorFee = await clonedGameContract.creatorFee()
        const responsePrizes = await clonedGameContract.getPrizes(
          responseGameId
        )
        expect(responseOwner).to.be.equal(this.owner.address)
        expect(responseCreator).to.be.equal(this.bob.address)
        expect(responseFactory).to.be.equal(this.gameFactory.address)
        expect(responseGameId).to.be.equal('0')
        expect(responseGameImplementationVersion).to.be.equal('0')
        expect(responseGameId).to.be.equal('0')
        expect(responsePlayTimeRange).to.be.equal(this.playTimeRange)
        expect(responseMaxPlayers).to.be.equal(this.maxPlayers)
        expect(responseRegistrationAmount).to.be.equal(registrationAmount)
        expect(responseTreasuryFee).to.be.equal(this.treasuryFee)
        expect(responseCreatorFee).to.be.equal(this.creatorFee)
        expect(responsePrizes.length).to.be.equal(updatedPrizes.length)
        expect(responsePrizes[0].amount).to.be.equal(
          ethers.utils.parseEther(`${prizepool * 0.8}`)
        )
        expect(responsePrizes[0].position).to.be.equal(1)
        expect(responsePrizes[1].amount).to.be.equal(
          ethers.utils.parseEther(`${prizepool * 0.2}`)
        )
        expect(responsePrizes[1].position).to.be.equal(2)
      })

      it('should create multiples free games', async function () {
        const registrationAmount = 0
        const prizepool = 1

        const updatedPrizes = []
        updatedPrizes.push({ ...this.prizes[0] })
        updatedPrizes.push({ ...this.prizes[0] })

        updatedPrizes[0].amount = ethers.utils.parseEther(`${prizepool * 0.8}`)
        updatedPrizes[1].amount = ethers.utils.parseEther(`${prizepool * 0.2}`)
        updatedPrizes[1].position = 2

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
            {
              value: this.gameCreationAmount.add(
                ethers.utils.parseEther(`${prizepool}`)
              ),
            }
          )
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
            {
              value: this.gameCreationAmount.add(
                ethers.utils.parseEther(`${prizepool}`)
              ),
            }
          )
      })

      it('should revert create a free game without initial prizepool amount sent', async function () {
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

    describe('when new game gets created', function () {
      it('should add the new game in deployedGames', async function () {
        const currentId = await this.gameFactory
          .connect(this.owner)
          .nextGameId()

        const currentGameImplementationVersionId = await this.gameFactory
          .connect(this.owner)
          .latestGameImplementationVersionId()

        const registrationAmountFirst =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizesFirst = this.prizes
        updatedPrizesFirst[0].amount = registrationAmountFirst.mul(
          this.maxPlayers
        )

        await this.gameFactory
          .connect(this.bob)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            registrationAmountFirst,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizesFirst,
            { value: this.gameCreationAmount }
          )

        const registrationAmountSecond =
          this.authorizedAmounts[this.authorizedAmounts.length - 2]

        const updatedPrizesSecond = this.prizes
        updatedPrizesSecond[0].amount = registrationAmountSecond.mul(
          this.maxPlayers
        )

        await this.gameFactory
          .connect(this.alice)
          .createNewGame(
            this.gameName,
            this.gameImage,
            this.maxPlayers,
            this.playTimeRange,
            registrationAmountSecond,
            this.treasuryFee,
            this.creatorFee,
            this.encodedCron,
            updatedPrizesSecond,
            { value: this.gameCreationAmount }
          )

        const deployedGames = await this.gameFactory
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
        const currentId = await this.gameFactory
          .connect(this.owner)
          .nextGameId()

        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const updatedPrizes = this.prizes
        updatedPrizes[0].amount = registrationAmount.mul(this.maxPlayers)

        await expect(
          this.gameFactory
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
        )
          .to.emit(this.gameFactory, 'GameCreated')
          .withArgs(currentId, anyValue, '0', this.bob.address)
      })
    })

    describe('when contract is paused', function () {
      it('should revert with correct message', async function () {
        await this.gameFactory.connect(this.owner).pause()

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              this.playTimeRange,
              this.correctRegistrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizes,
              { value: this.gameCreationAmount }
            ),
          'Pausable: paused'
        )
      })
    })

    describe('when the given this.maxPlayers is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const outOfRangeMaxPlayers1 = 101
        const outOfRangeMaxPlayers2 = 1

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              outOfRangeMaxPlayers1,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizes,
              { value: this.gameCreationAmount }
            ),
          'maxPlayers should not be bigger than 100'
        )

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              outOfRangeMaxPlayers2,
              this.playTimeRange,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizes,
              { value: this.gameCreationAmount }
            ),
          'maxPlayers should be bigger than or equal to 2'
        )
      })
    })

    describe('when the given this.playTimeRange is not in authorized range', function () {
      it('should revert with correct message', async function () {
        const registrationAmount =
          this.authorizedAmounts[this.authorizedAmounts.length - 1]

        const outOfRangePlayTimeRange1 = 9
        const outOfRangePlayTimeRange2 = 0

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              outOfRangePlayTimeRange1,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizes,
              { value: this.gameCreationAmount }
            ),
          'playTimeRange should not be bigger than 8'
        )

        await expectRevert(
          this.gameFactory
            .connect(this.bob)
            .createNewGame(
              this.gameName,
              this.gameImage,
              this.maxPlayers,
              outOfRangePlayTimeRange2,
              registrationAmount,
              this.treasuryFee,
              this.creatorFee,
              this.encodedCron,
              this.prizes,
              { value: this.gameCreationAmount }
            ),
          'playTimeRange should be bigger than 0'
        )
      })
    })
  })

  context('GameFactory getDeployedGames', function () {
    it('should return all the deployed game lines', async function () {
      const deployedGamesBefore = await this.gameFactory
        .connect(this.owner)
        .getDeployedGames()

      const registrationAmountFirst =
        this.authorizedAmounts[this.authorizedAmounts.length - 1]

      const updatedPrizesFirst = this.prizes
      updatedPrizesFirst[0].amount = registrationAmountFirst.mul(
        this.maxPlayers
      )

      await this.gameFactory
        .connect(this.bob)
        .createNewGame(
          this.gameName,
          this.gameImage,
          this.maxPlayers,
          this.playTimeRange,
          registrationAmountFirst,
          this.treasuryFee,
          this.creatorFee,
          this.encodedCron,
          updatedPrizesFirst,
          { value: this.gameCreationAmount }
        )

      const registrationAmountSecond = this.authorizedAmounts[2]

      const updatedPrizesSecond = this.prizes
      updatedPrizesSecond[0].amount = registrationAmountSecond.mul(
        this.maxPlayers
      )

      await this.gameFactory
        .connect(this.alice)
        .createNewGame(
          this.gameName,
          this.gameImage,
          this.maxPlayers,
          this.playTimeRange,
          registrationAmountSecond,
          this.treasuryFee,
          this.creatorFee,
          this.encodedCron,
          updatedPrizesSecond,
          { value: this.gameCreationAmount }
        )

      const deployedGamesAfter = await this.gameFactory
        .connect(this.owner)
        .getDeployedGames()

      expect(deployedGamesAfter.length).to.be.equal(
        deployedGamesBefore.length + 2
      )
    })
  })
})
