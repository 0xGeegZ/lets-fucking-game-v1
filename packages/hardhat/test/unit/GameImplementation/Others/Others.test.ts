import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { initialiseTestData } from '../../../factories/setup'
import { setUpGameReadyToPlay, setUpGameWithAWinner } from '../../../helpers'

describe('GameImplementationContract - Others', function () {
  beforeEach(initialiseTestData)

  context('Creator functions', function () {
    describe('setGameName', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).setGameName('New name'),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should change the name of the Game Line', async function () {
          const newName = 'New name'
          await this.deployedGame.connect(this.owner).setGameName(newName)
          const updatedName = await this.deployedGame.gameName()
          expect(updatedName).to.be.equal(newName)
        })
      })
    })

    describe('setGameImage', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.bob)
              .setGameImage('https://www.new-ipfs-image.com'),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should change the image link of the Game Line', async function () {
          const newImageLink = 'https://www.new-ipfs-image.com'
          await this.deployedGame.connect(this.owner).setGameImage(newImageLink)
          const updatedImage = await this.deployedGame.gameImage()
          expect(updatedImage).to.be.equal(newImageLink)
        })
      })
    })

    describe('setMaxPlayers', function () {
      describe('when caller is not the admin or creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).setMaxPlayers(50),
            'Caller is not the admin or creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should update the max players', async function () {
          const newMaxPlayers = 50
          await this.deployedGame
            .connect(this.owner)
            .setMaxPlayers(newMaxPlayers)
          const updatedMaxPlayers = await this.deployedGame.maxPlayers()
          expect(updatedMaxPlayers).to.be.equal(newMaxPlayers)
        })

        it('should revert with correct error message if max players is too low', async function () {
          const tooHighMaxPlayers = 1
          await expectRevert(
            this.deployedGame
              .connect(this.owner)
              .setMaxPlayers(tooHighMaxPlayers),
            'maxPlayers should be bigger than or equal to 2'
          )
        })

        it('should revert with correct error message if max players is too high', async function () {
          const tooHighMaxPlayers = 1000
          await expectRevert(
            this.deployedGame
              .connect(this.owner)
              .setMaxPlayers(tooHighMaxPlayers),
            'maxPlayers should not be bigger than 100'
          )
        })
      })
    })

    describe('setCreatorFee', function () {
      describe('when caller is not the admin or creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).setCreatorFee(100),
            'Caller is not the admin or creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should update the creator fee', async function () {
          const newCreatorFee = 100
          await this.deployedGame
            .connect(this.owner)
            .setCreatorFee(newCreatorFee)
          const updatedCreatorFee = await this.deployedGame.creatorFee()
          expect(updatedCreatorFee).to.be.equal(newCreatorFee)
        })

        it('should revert with correct error message if creatorFee is too high', async function () {
          const tooHighCreatorFee = 501
          await expectRevert(
            this.deployedGame
              .connect(this.owner)
              .setCreatorFee(tooHighCreatorFee),
            'Creator fee too high'
          )
        })
      })
    })

    describe('claimCreatorFee', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).claimCreatorFee(),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should withdraw the creator fee', async function () {
          const winnerIndex = 4
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })

          const initialContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const initialCreatorBalance = await ethers.provider.getBalance(
            this.owner.address
          )

          const initialCreatorAmount = await this.deployedGame
            .connect(this.owner)
            .creatorAmount()

          const tx = await this.deployedGame
            .connect(this.owner)
            .claimCreatorFee()

          const receipt = await tx.wait()
          const gasPrice = tx.gasPrice
          const gasUsed = receipt.gasUsed

          const updatedContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const updatedCreatorBalance = await ethers.provider.getBalance(
            this.owner.address
          )

          const updatedCreatorAmount = await this.deployedGame
            .connect(this.owner)
            .creatorAmount()

          expect(updatedContractBalance).to.be.equal(
            initialContractBalance.sub(initialCreatorAmount)
          )
          expect(updatedCreatorBalance).to.be.equal(
            initialCreatorBalance
              .add(initialCreatorAmount)
              .sub(gasPrice.mul(gasUsed))
          )
          expect(updatedCreatorAmount).to.be.equal(0)
        })

        it('should revert with correct error message if creator claim fee twice', async function () {
          const winnerIndex = 4
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })

          await this.deployedGame.connect(this.owner).claimCreatorFee()

          await expectRevert(
            this.deployedGame.connect(this.owner).claimCreatorFee(),
            'Nothing to claim'
          )
        })
      })
    })
  })

  context('Admin functions', function () {
    describe('claimTreasuryFee', function () {
      describe('when caller is not the general admin', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).claimTreasuryFee(),
            'Caller is not the admin'
          )
        })
      })

      describe('when caller is the general admin', function () {
        it('should withdraw the treasury fee', async function () {
          const winnerIndex = 4
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })
          const initialContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const initialAdminBalance = await ethers.provider.getBalance(
            this.owner.address
          )

          const initialTreasuryAmount = await this.deployedGame
            .connect(this.owner)
            .treasuryAmount()

          const tx = await this.deployedGame
            .connect(this.owner)
            .claimTreasuryFee()

          const receipt = await tx.wait()
          const gasPrice = tx.gasPrice
          const gasUsed = receipt.gasUsed

          const updatedContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const updatedAdminBalance = await ethers.provider.getBalance(
            this.owner.address
          )

          const updatedTreasuryAmount = await this.deployedGame
            .connect(this.owner)
            .treasuryAmount()

          expect(updatedContractBalance).to.be.equal(
            initialContractBalance.sub(initialTreasuryAmount)
          )
          expect(updatedAdminBalance).to.be.equal(
            initialAdminBalance
              .add(initialTreasuryAmount)
              .sub(gasPrice.mul(gasUsed))
          )
          expect(updatedTreasuryAmount).to.be.equal(0)
        })

        it('should revert with correct error message if general admin claim fee twice', async function () {
          const winnerIndex = 4
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })

          await this.deployedGame.connect(this.owner).claimTreasuryFee()

          await expectRevert(
            this.deployedGame.connect(this.owner).claimTreasuryFee(),
            'Nothing to claim'
          )
        })
      })
    })
    describe('claimTreasuryFeeToFactory', function () {
      describe('when caller is the game factory', function () {
        it('should withdraw the treasury fee to factory', async function () {
          // TODO FIXME gameFactory contract can't call gameImplementation function
          expect(true).to.be.false
          // const winnerIndex = 4
          // await setUpGameWithAWinner({
          //   players: this.players,
          //   winnerIndex,
          //   contract: this.deployedGame,
          //   amount: this.correctRegistrationAmount,
          //   mockKeeper: this.mockKeeper,
          // })
          // const initialContractBalance = await ethers.provider.getBalance(
          //   this.deployedGame.address
          // )
          // const initialAdminBalance = await ethers.provider.getBalance(
          //   this.owner.address
          // )
          // const initialTreasuryAmount = await this.deployedGame
          //   .connect(this.owner)
          //   .treasuryAmount()
          // const tx = await this.deployedGame
          //   .connect(this.gameFactory)
          //   .claimTreasuryFeeToFactory()
          // const receipt = await tx.wait()
          // const gasPrice = tx.gasPrice
          // const gasUsed = receipt.gasUsed
          // const updatedContractBalance = await ethers.provider.getBalance(
          //   this.deployedGame.address
          // )
          // const updatedAdminBalance = await ethers.provider.getBalance(
          //   this.owner.address
          // )
          // const updatedTreasuryAmount = await this.deployedGame
          //   .connect(this.owner)
          //   .treasuryAmount()
          // expect(updatedContractBalance).to.be.equal(
          //   initialContractBalance.sub(initialTreasuryAmount)
          // )
          // expect(updatedAdminBalance).to.be.equal(
          //   initialAdminBalance
          //     .add(initialTreasuryAmount)
          //     .sub(gasPrice.mul(gasUsed))
          // )
          // expect(updatedTreasuryAmount).to.be.equal(0)
        })

        it('should revert with correct error message if factory claim fee twice', async function () {
          // TODO FIXME factory contract can't call gameImplementation function
          expect(true).to.be.false
          // const winnerIndex = 4
          // await setUpGameWithAWinner({
          //   players: this.players,
          //   winnerIndex,
          //   contract: this.deployedGame,
          //   amount: this.correctRegistrationAmount,
          //   mockKeeper: this.mockKeeper,
          // })

          // await this.deployedGame.connect(this.gameFactory).claimTreasuryFee()

          // await expectRevert(
          //   this.deployedGame.connect(this.gameFactory).claimTreasuryFee(),
          //   'Nothing to claim'
          // )
        })
      })
    })
    describe('setTreasuryFee', function () {
      describe('when caller is not the admin', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).setTreasuryFee(100),
            'Caller is not the admin'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should update the creator fee', async function () {
          const newTreasuryFee = 100
          await this.deployedGame
            .connect(this.owner)
            .setTreasuryFee(newTreasuryFee)
          const updatedTreasuryFee = await this.deployedGame.treasuryFee()
          expect(updatedTreasuryFee).to.be.equal(newTreasuryFee)
        })

        it('should revert with correct error message if treasuryFee is too high', async function () {
          const tooHighTreasuryFee = 1001
          await expectRevert(
            this.deployedGame
              .connect(this.owner)
              .setTreasuryFee(tooHighTreasuryFee),
            'Treasury fee too high'
          )
        })
      })
    })

    context('setCronUpkeep', function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.bob)
              .setCronUpkeep('0x0000000000000000000000000000000000000001'),
            'Caller is not the admin or factory'
          )
        })
      })

      describe('when called by admin', function () {
        it('should update keeper address for the game and associated keeper job', async function () {
          // TODO deploy a new cronUpkeep to get his adress and update the keeper
          expect(true).to.be.false
          // const newCronUpkeep = '0x0000000000000000000000000000000000000001'
          // await this.deployedGame
          //   .connect(this.owner)
          //   .setCronUpkeep(newCronUpkeep)
          // const updatedCronUpkeep = await this.deployedGame.cronUpkeep()
          // expect(updatedCronUpkeep).to.be.equal(newCronUpkeep)
        })

        it('should revert if keeper address is not init', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.owner)
              .setCronUpkeep('0x0000000000000000000000000000000000000000'),
            'address need to be initialised'
          )
        })
      })
    })

    context('setEncodedCron', function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame.connect(this.bob).setEncodedCron('* * * * *'),
            'Caller is not the admin or creator'
          )
        })
      })

      describe('when called by admin', function () {
        it('should update keeper cron for the game and associated keeper job', async function () {
          // TODO FIXME call toEncodedSpec from externalCron
          expect(true).to.be.false

          // const newEncodedCron = '* * * * *'
          // await this.deployedGame
          //   .connect(this.owner)
          //   .setEncodedCron(newEncodedCron)

          // const encodedCronBytes = await this.deployedGame.encodedCron()

          // const updatedEncodedCron =
          //   this.cronExternal.toEncodedSpec(newEncodedCron)
          // expect(updatedEncodedCron).to.be.equal(encodedCronBytes)
        })

        it('should revert if keeper cron is not init', async function () {
          // TODO FIXME (operation="getResolver", network="unknown", code=UNSUPPORTED_OPERATION, version=providers/5.7.1)
          expect(true).to.be.false

          // await expectRevert.unspecified(
          //   this.deployedGame.connect(this.owner).setCronUpkeep('ERROR')
          // )
        })
      })
    })
  })

  context('Emergency functions', function () {
    describe('withdrawFunds', function () {
      describe('when caller is not the general admin or creator', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.players[5])
              .withdrawFunds(this.players[5].address),
            'Caller is not the admin or factory'
          )
        })
      })

      describe('when caller is the general admin or factory', function () {
        it('should withdraw all the contract funds and transfer them to the general admin address', async function () {
          const fundReceiverAddress = this.players[5].address
          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
          const initialContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const initialReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          await this.deployedGame
            .connect(this.owner)
            .withdrawFunds(fundReceiverAddress)

          const updatedContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const updatedReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          expect(updatedContractBalance).to.be.equal(0)
          expect(updatedReceiverBalance).to.be.equal(
            initialReceiverBalance.add(initialContractBalance)
          )
        })
        it('should withdraw all the contract funds and transfer them to the factory address', async function () {
          // TODO FIXME gameFactory contract can't call gameImplementation function (invalid signer or provider)
          expect(true).to.be.false
          // const fundReceiverAddress = this.players[5].address
          // await setUpGameReadyToPlay({
          //   players: this.players,
          //   contract: this.deployedGame,
          //   amount: this.correctRegistrationAmount,

          //   mockKeeper: this.mockKeeper,
          // })
          // const initialContractBalance = await ethers.provider.getBalance(
          //   this.deployedGame.address
          // )
          // const initialReceiverBalance = await ethers.provider.getBalance(
          //   fundReceiverAddress
          // )

          // await this.deployedGame
          //   .connect(this.gameFactory)
          //   .withdrawFunds(fundReceiverAddress)

          // const updatedContractBalance = await ethers.provider.getBalance(
          //   this.deployedGame.address
          // )
          // const updatedReceiverBalance = await ethers.provider.getBalance(
          //   fundReceiverAddress
          // )

          // expect(updatedContractBalance).to.be.equal(0)
          // expect(updatedReceiverBalance).to.be.equal(
          //   initialReceiverBalance.add(initialContractBalance)
          // )
        })
      })

      describe('when caller is the creator', function () {
        it('should withdraw all the contract funds and transfer them to the given address', async function () {
          const fundReceiverAddress = this.players[5].address
          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.deployedGame,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
          const initialContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const initialReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          await this.deployedGame
            .connect(this.owner)
            .withdrawFunds(fundReceiverAddress)

          const updatedContractBalance = await ethers.provider.getBalance(
            this.deployedGame.address
          )
          const updatedReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          expect(updatedContractBalance).to.be.equal(0)
          expect(updatedReceiverBalance).to.be.equal(
            initialReceiverBalance.add(initialContractBalance)
          )
        })
      })
    })
    describe('transferOwnership', function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.alice)
              .transferAdminOwnership(this.alice.address),
            'Caller is not the admin'
          )
        })
      })

      describe('when called by admin', function () {
        it('should transfer the administration to given address', async function () {
          await this.deployedGame
            .connect(this.owner)
            .transferAdminOwnership(this.alice.address)
          const newAdmin = await this.deployedGame.owner()

          expect(newAdmin).to.be.equal(this.alice.address)
        })
      })
    })
    describe('transferCreatorOwnership', function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.alice)
              .transferCreatorOwnership(this.alice.address),
            'Caller is not the creator'
          )
        })
      })

      describe('when called by admin', function () {
        it('should transfer the creator to given address', async function () {
          await this.deployedGame
            .connect(this.owner)
            .transferCreatorOwnership(this.alice.address)
          const newCreator = await this.deployedGame.creator()

          expect(newCreator).to.be.equal(this.alice.address)
        })
      })
    })
    describe('transferFactoryOwnership', function () {
      describe('when called by non admin', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.deployedGame
              .connect(this.alice)
              .transferFactoryOwnership(this.alice.address),
            'Caller is not the factory'
          )
        })
      })

      describe('when called by admin', function () {
        it('should transfer the factory to given address', async function () {
          // TODO FIXME gameFactory contract can't call gameImplementation function (invalid signer or provider)
          expect(true).to.be.false
          // await this.deployedGame
          //   .connect(this.gameFactory)
          //   .transferFactoryOwnership(this.alice.address)
          // const newFactory = await this.deployedGame.creator()

          // expect(newFactory).to.be.equal(this.alice.address)
        })
      })
    })
  })
})
