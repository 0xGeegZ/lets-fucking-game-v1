import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { initialiseTestData } from '../../../factories/setup'
import {
  getTwoLastPlayersVoteSplitPot,
  getTwoPlayersInFinal,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECOND,
  registerPlayer,
  setUpGameReadyToPlay,
  setUpGameWithAWinner,
} from '../../../helpers'

describe('GameV1Contract - Mecanism', function () {
  beforeEach(initialiseTestData)

  context('Registering to game', function () {
    describe("User can't register to the game", function () {
      describe('when game is paused', async function () {
        it('should not allow user to register to the game', async function () {
          await this.deployedPayableGame.pause()
          await expectRevert(
            this.deployedPayableGame.connect(this.players[0]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'Pausable: paused'
          )
        })
      })

      describe('when user is the creator of the Game', async function () {
        it('should not allow user to register to the game', async function () {
          await expectRevert(
            this.deployedPayableGame.connect(this.owner).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            "Caller can't be the creator"
          )
        })
      })

      describe('when game is full', async function () {
        it('should not allow user to register to the game', async function () {
          const maxAmountOfUser = 10
          for (let i = 0; i < maxAmountOfUser; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }

          await expectRevert(
            this.deployedPayableGame.connect(this.players[10]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'This game is full'
          )
        })
      })

      describe('when user already joined the game', async function () {
        it('should not allow user to register to the game', async function () {
          const player = this.players[0]
          await registerPlayer({
            player: this.players[0],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })

          await expectRevert(
            this.deployedPayableGame.connect(player).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'Player already entered in this game'
          )
        })
      })

      describe('when user joins the game with an incorrect amount', async function () {
        it('should not allow user to register to the game', async function () {
          const player = this.players[0]

          await expectRevert(
            this.deployedPayableGame.connect(player).registerForGame({
              value: this.incorrectRegistrationAmount,
            }),
            'Only registration amount is allowed'
          )
        })
      })

      describe('when user joins the game with 0 amount', async function () {
        it('should not allow user to register to the game', async function () {
          const player = this.players[0]

          await expectRevert(
            this.deployedPayableGame.connect(player).registerForGame({
              value: this.zeroRegistrationAmount,
            }),
            'Only registration amount is allowed'
          )
        })
      })
    })

    describe('User can register to the game', function () {
      describe('when one user registers to the game', async function () {
        it('should increase the number of registered players', async function () {
          const initialNumberOfPlayers = (
            await this.deployedPayableGame.getPlayerAddresses()
          ).length

          await registerPlayer({
            player: this.players[0],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })
          const updatedNumberOfPlayers = (
            await this.deployedPayableGame.getPlayerAddresses()
          ).length

          expect(updatedNumberOfPlayers).to.equal(initialNumberOfPlayers + 1)
        })

        it("should add the new player's address to the playerAddresses list", async function () {
          const newPlayerIndex = 0
          const newPlayerAddress = this.players[newPlayerIndex].address
          const intialPlayerAddressesList =
            await this.deployedPayableGame.getPlayerAddresses()
          await registerPlayer({
            player: this.players[newPlayerIndex],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })
          const updatedPlayerAddressesList =
            await this.deployedPayableGame.getPlayerAddresses()
          expect(updatedPlayerAddressesList.length).to.equal(
            +intialPlayerAddressesList.length + 1
          )
          expect(updatedPlayerAddressesList[newPlayerIndex]).to.equal(
            newPlayerAddress
          )
        })

        it('should create a new Player and add it to the players mapping', async function () {
          const newPlayerIndex = 0
          const newPlayerAddress = this.players[newPlayerIndex].address
          await registerPlayer({
            player: this.players[newPlayerIndex],
            contract: this.deployedPayableGame,
            value: this.correctRegistrationAmount,
          })

          const playerFromMapping = await this.deployedPayableGame.players(
            newPlayerAddress
          )
          expect(playerFromMapping.playerAddress).to.equal(newPlayerAddress)
          expect(playerFromMapping.roundCount.isZero()).to.be.true
          expect(playerFromMapping.hasLost).to.be.false
          expect(playerFromMapping.isSplitOk).to.be.false
          expect(playerFromMapping.hasPlayedRound).to.be.false
          expect(playerFromMapping.roundRangeUpperLimit.isZero()).to.be.true
          expect(playerFromMapping.roundRangeLowerLimit.isZero()).to.be.true
        })
      })
      describe("when the last user registers to the game before it's full", async function () {
        it('should let the user register', async function () {
          for (let i = 0; i < 10; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }
          const numPlayers = (
            await this.deployedPayableGame.getPlayerAddresses()
          ).length
          const playerAddresses =
            await this.deployedPayableGame.getPlayerAddresses()
          expect(numPlayers).to.equal(10) // No risk of using toNumber() here
          expect(playerAddresses.length).to.equal(10)
        })
      })
    })
  })

  context('Calling daily checkpoint', function () {
    describe('when triggerDailyCheckpoint caller is not the keeper', function () {
      it('should revert transaction with correct message', async function () {
        const wrongCaller = this.players[0]
        await expectRevert(
          this.deployedPayableGame
            .connect(wrongCaller)
            .triggerDailyCheckpoint(),
          'Caller is not the admin or keeper'
        )
      })
    })

    describe('when triggerDailyCheckpoint called during paused contract', function () {
      it('should revert transaction with correct message', async function () {
        await this.deployedPayableGame.pause()
        await expectRevert(
          this.deployedPayableGame
            .connect(this.mockKeeper)
            .triggerDailyCheckpoint(),
          'Pausable: paused'
        )
      })
    })

    describe('when there is no game currently playing', function () {
      describe('when the game is not full', function () {
        it('should not start the game', async function () {
          for (let i = 0; i < 8; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }

          await expect(
            this.deployedPayableGame
              .connect(this.mockKeeper)
              .triggerDailyCheckpoint()
          ).to.not.emit(this.deployedPayableGame, 'StartedGame')
        })
      })

      describe('when the game is full', function () {
        it('should start the game', async function () {
          for (let i = 0; i < 10; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }

          await expect(
            this.deployedPayableGame
              .connect(this.mockKeeper)
              .triggerDailyCheckpoint()
          )
            .to.emit(this.deployedPayableGame, 'StartedGame')
            .withArgs(anyValue, '10')
        })
      })
    })

    describe('when there is a game currently playing', function () {
      it('should not start a new game', async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.deployedPayableGame
            .connect(this.mockKeeper)
            .triggerDailyCheckpoint()
        ).to.not.emit(this.deployedPayableGame, 'StartedGame')
      })

      it("should refresh players' statuses", async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.deployedPayableGame
            .connect(this.mockKeeper)
            .triggerDailyCheckpoint()
        ).to.emit(this.deployedPayableGame, 'GameLost')
      })

      it('should check if game ended and close it', async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.deployedPayableGame
            .connect(this.mockKeeper)
            .triggerDailyCheckpoint()
        ).to.emit(this.deployedPayableGame, 'ResetGame')
      })
    })
  })

  context('When game gets started', function () {
    it('should set the game as started', async function () {
      await setUpGameReadyToPlay({
        players: this.players,
        contract: this.deployedPayableGame,
        amount: this.correctRegistrationAmount,

        mockKeeper: this.mockKeeper,
      })

      const isStartedGame = await this.deployedPayableGame.isInProgress()
      expect(isStartedGame).to.be.true
    })

    it("should set each player's round limits to a new random timestamp in the next 24 hours", async function () {
      await setUpGameReadyToPlay({
        players: this.players,
        contract: this.deployedPayableGame,
        amount: this.correctRegistrationAmount,
        mockKeeper: this.mockKeeper,
      })

      const currentBlock = await ethers.provider.send('eth_getBlockByNumber', [
        'latest',
        false,
      ])
      const currentBlockTimestamp = currentBlock.timestamp
      const nextCheckpointTimestamp = currentBlockTimestamp + ONE_DAY_IN_SECONDS
      for (let i = 0; i < 10; i++) {
        const player = await this.deployedPayableGame.players(
          this.players[i].address
        )
        expect(
          player.roundRangeLowerLimit.gte(
            ethers.BigNumber.from(currentBlockTimestamp.toString())
          )
        ).to.be.true
        expect(
          player.roundRangeUpperLimit.gte(
            ethers.BigNumber.from(currentBlockTimestamp.toString())
          )
        ).to.be.true
        expect(player.roundRangeLowerLimit.lte(player.roundRangeUpperLimit)).to
          .be.true
        expect(
          player.roundRangeLowerLimit.lte(
            ethers.BigNumber.from(nextCheckpointTimestamp.toString())
          )
        ).to.be.true
        expect(
          player.roundRangeUpperLimit.lte(
            ethers.BigNumber.from(nextCheckpointTimestamp.toString())
          )
        ).to.be.true
      }
    })

    it('should emit the StartedGame event', async function () {
      await expect(
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
      ).to.emit(this.deployedPayableGame, 'StartedGame')
    })
  })

  context('Playing a round', function () {
    describe("User can't play a round", function () {
      describe('when game is paused', async function () {
        it('should not allow the user to play the round', async function () {
          await this.deployedPayableGame.pause()
          await expectRevert(
            this.deployedPayableGame.connect(this.players[0]).playRound(),
            'Pausable: paused'
          )
        })
      })

      describe('when game is not full', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          for (let i = 0; i < maxAmountOfUser - 1; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }
          await expectRevert(
            this.deployedPayableGame.connect(this.players[0]).playRound(),
            'This game is not full'
          )
        })
      })

      describe('when user is not registered in the game', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          const notRegisteredUserIndex = 11
          for (let i = 0; i < maxAmountOfUser; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.deployedPayableGame,
              value: this.correctRegistrationAmount,
            })
          }

          await expectRevert(
            this.deployedPayableGame
              .connect(this.players[notRegisteredUserIndex])
              .playRound(),
            'Player has not entered in this game'
          )
        })
      })

      describe('when user has lost in this game', async function () {
        it('should not allow the user to play the round', async function () {
          const playerIndex = 0
          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.deployedPayableGame,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
          const initialPlayer = await this.deployedPayableGame.players(
            this.players[playerIndex].address
          )
          const initialPlayerRangeLowerLimit =
            initialPlayer.roundRangeLowerLimit

          await this.deployedPayableGame
            .connect(this.players[playerIndex])
            .playRound()

          // Time passes until we reach player's range
          const insidePlayerRange =
            initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
          await ethers.provider.send('evm_setNextBlockTimestamp', [
            insidePlayerRange.toNumber(),
          ])

          await expectRevert(
            this.deployedPayableGame
              .connect(this.players[playerIndex])
              .playRound(),
            'Player has already lost'
          )
        })
      })

      describe('when user has played in this round', async function () {
        it('should not allow the user to play again', async function () {
          const playerIndex = 0

          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.deployedPayableGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })
          const initialPlayer = await this.deployedPayableGame.players(
            this.players[playerIndex].address
          )
          const initialPlayerRangeLowerLimit =
            initialPlayer.roundRangeLowerLimit

          // Time passes until we reach player's range
          const insidePlayerRange =
            initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
          await ethers.provider.send('evm_setNextBlockTimestamp', [
            insidePlayerRange.toNumber(),
          ])

          await this.deployedPayableGame
            .connect(this.players[playerIndex])
            .playRound()

          await expectRevert(
            this.deployedPayableGame
              .connect(this.players[playerIndex])
              .playRound(),
            'Player has already played in this round'
          )
        })
      })
    })

    describe('User plays at the correct moment', function () {
      it("should update player's round count", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRoundCount = initialPlayer.roundCount
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await this.deployedPayableGame
          .connect(this.players[playerIndex])
          .playRound()
        const updatedPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const updatedPlayerRoundCount = updatedPlayer.roundCount

        expect(updatedPlayerRoundCount.toNumber()).to.equal(
          initialPlayerRoundCount.toNumber() + 1
        )
      })

      it("should set the player's hasPlayed field to true", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await this.deployedPayableGame
          .connect(this.players[playerIndex])
          .playRound()

        const updatedPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.hasPlayedRound).to.be.false
        expect(updatedPlayer.hasPlayedRound).to.be.true
      })

      it('should emit the PlayedRound event with the correct data', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await expect(
          this.deployedPayableGame
            .connect(this.players[playerIndex])
            .playRound()
        )
          .to.emit(this.deployedPayableGame, 'PlayedRound')
          .withArgs(this.players[playerIndex].address)
      })

      it("should keep player's hasLost field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await this.deployedPayableGame
          .connect(this.players[playerIndex])
          .playRound()

        const updatedPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.hasLost).to.be.false
        expect(updatedPlayer.hasLost).to.be.false
      })
    })
  })

  context('Loosing a game', function () {
    describe('when player plays outside his round range', function () {
      it("should set the player's hasLost field to true", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange =
          initialPlayerRangeUpperLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          beyondPlayerRange.toNumber(),
        ])

        await this.deployedPayableGame
          .connect(this.players[playerIndex])
          .playRound()

        const updatedPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.hasLost).to.be.false
        expect(updatedPlayer.hasLost).to.be.true
      })

      it("should keep the player's isSplitOk field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange =
          initialPlayerRangeUpperLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          beyondPlayerRange.toNumber(),
        ])

        await this.deployedPayableGame
          .connect(this.players[playerIndex])
          .playRound()

        const updatedPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.isSplitOk).to.be.false
        expect(updatedPlayer.isSplitOk).to.be.false
      })

      it('should emit the event notifying the user lost the game', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.deployedPayableGame.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange =
          initialPlayerRangeUpperLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          beyondPlayerRange.toNumber(),
        ])

        await expect(
          this.deployedPayableGame
            .connect(this.players[playerIndex])
            .playRound()
        )
          .to.emit(this.deployedPayableGame, 'GameLost')
          .withArgs('0', this.players[playerIndex].address, anyValue)
      })
    })

    describe('when player does not play in this round and others did', function () {
      it("should set the player's hasLost field to true", async function () {
        const looserIndex = 0
        const finalistIndex = 2
        const secondFinalistIndex = 3

        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,
          mockKeeper: this.mockKeeper,
        })

        const looserUpdatedData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )
        expect(looserInitialData.hasLost).to.be.false
        expect(looserUpdatedData.hasLost).to.be.true
      })

      it("should keep the player's isSplitOk field to false", async function () {
        const looserIndex = 0
        const finalistIndex = 2
        const secondFinalistIndex = 3

        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,
          mockKeeper: this.mockKeeper,
        })

        const looserUpdatedData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )
        expect(looserInitialData.isSplitOk).to.be.false
        expect(looserUpdatedData.isSplitOk).to.be.false
      })

      it('should emit the event notifying the user lost the game', async function () {
        const looserIndex = 0
        const finalistIndex = 2
        const secondFinalistIndex = 3
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,
          mockKeeper: this.mockKeeper,
        })
        const looserUpdatedData = await this.deployedPayableGame.players(
          this.players[looserIndex].address
        )
        expect(looserInitialData.hasLost).to.be.false
        expect(looserUpdatedData.hasLost).to.be.true
      })
    })
  })

  context('Winning a game', function () {
    describe('when there is only one user left', async function () {
      // TODO should won game with 1 player left for game with multiple winners

      it('should create a new Winner and add it to the winners list', async function () {
        const winnerIndex = 4
        const roundId = await this.deployedPayableGame.roundId()

        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const winners = await this.deployedPayableGame.getWinners(roundId)
        const [newWinner] = winners

        expect(newWinner.playerAddress).to.equal(
          this.players[winnerIndex].address
        )
        expect(newWinner.amountWon.eq(this.prizeAmount)).to.be.true
        expect(newWinner.prizeClaimed).to.be.false
        expect(newWinner.roundId).to.equal(roundId)
        expect(winners.length).to.equal(1)
      })

      it('should emit the GameWon event with the correct data', async function () {
        const winnerIndex = 4

        await expect(
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedPayableGame,
            amount: this.correctRegistrationAmount,
            mockKeeper: this.mockKeeper,
          })
        )
          .to.emit(this.deployedPayableGame, 'GameWon')
          .withArgs(
            '0',
            '1',
            this.players[winnerIndex].address,
            this.prizeAmount.toString()
          )
      })

      it('should reset the game', async function () {
        const previousId = 0
        const winnerIndex = 4
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })
        const updatedPlayerAddressesList =
          await this.deployedPayableGame.getPlayerAddresses()

        const updatedId = await this.deployedPayableGame.roundId()

        expect(updatedPlayerAddressesList.length).to.equal(0)
        for (let i = 0; i < updatedPlayerAddressesList.length; i++) {
          expect(updatedPlayerAddressesList[i]).to.equal(
            '0x0000000000000000000000000000000000000000'
          )
        }

        expect(updatedId).to.equal(previousId + 1)
      })

      it('should emit the ResetGame event', async function () {
        const winnerIndex = 4

        await expect(
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.deployedPayableGame,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
        ).to.emit(this.deployedPayableGame, 'ResetGame')
      })
    })
  })

  context('Claiming a prize', function () {
    // TODO should won game with 1 player left for game with multiple winners

    describe('when the game does not exist', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const inexistantId = 10
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        await expectRevert(
          this.deployedPayableGame
            .connect(this.players[winnerIndex])
            .claimPrize(inexistantId),
          'This round does not exist'
        )
      })
    })

    describe('when the user did not win the game', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const impostorIndex = 3
        const existantId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        await expectRevert(
          this.deployedPayableGame
            .connect(this.players[impostorIndex])
            .claimPrize(existantId),
          'Player did not win this game'
        )
      })
    })

    describe('when the prize for the game as been claimed already', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const existantId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        await this.deployedPayableGame
          .connect(this.players[winnerIndex])
          .claimPrize(existantId)

        await expectRevert(
          this.deployedPayableGame
            .connect(this.players[winnerIndex])
            .claimPrize(existantId),
          'Prize for this game already claimed'
        )
      })
    })

    describe('when the user did win an existing game not already claimed', function () {
      it('should transfer the prize to the winner', async function () {
        const winnerIndex = 3
        const existantId = 0

        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        const initialContractBalance = await ethers.provider.getBalance(
          this.deployedPayableGame.address
        )
        const initialWinnerBalance = await ethers.provider.getBalance(
          this.players[winnerIndex].address
        )
        const tx = await this.deployedPayableGame
          .connect(this.players[winnerIndex])
          .claimPrize(existantId)

        const receipt = await tx.wait()
        const gasPrice = tx.gasPrice
        const gasUsed = receipt.gasUsed

        const updatedContractBalance = await ethers.provider.getBalance(
          this.deployedPayableGame.address
        )
        const updatedWinnerBalance = await ethers.provider.getBalance(
          this.players[winnerIndex].address
        )

        expect(updatedContractBalance).to.be.equal(
          initialContractBalance.sub(this.prizeAmount)
        )
        expect(updatedWinnerBalance).to.be.equal(
          initialWinnerBalance.add(this.prizeAmount).sub(gasPrice.mul(gasUsed))
        )
      })

      it('should emit the GamePrizeClaimed event with the correct data', async function () {
        const winnerIndex = 0
        const existantId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.deployedPayableGame,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        await expect(
          this.deployedPayableGame
            .connect(this.players[winnerIndex])
            .claimPrize(existantId)
        )
          .to.emit(this.deployedPayableGame, 'GamePrizeClaimed')
          .withArgs(
            this.players[winnerIndex].address,
            existantId,
            this.prizeAmount
          )
      })
    })
  })

  context('Splitting the prize', function () {
    describe('when users decide to split the prize', function () {
      it('should allow players to split the pot for payable game', async function () {
        const finalistIndex = 2
        const secondFinalistIndex = 3
        const roundId = await this.deployedPayableGame.roundId()

        await getTwoLastPlayersVoteSplitPot({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        await expect(
          this.deployedPayableGame
            .connect(this.players[finalistIndex])
            .voteToSplitPot()
        ).to.emit(this.deployedPayableGame, 'VoteToSplitPot')

        await expect(
          this.deployedPayableGame
            .connect(this.players[secondFinalistIndex])
            .voteToSplitPot()
        ).to.emit(this.deployedPayableGame, 'VoteToSplitPot')

        const isAllPlayersSplitOk = await this.deployedPayableGame
          .connect(this.mockKeeper)
          .isAllPlayersSplitOk()
        expect(isAllPlayersSplitOk).to.be.true

        const getRemainingPlayersCount = await this.deployedPayableGame
          .connect(this.mockKeeper)
          .getRemainingPlayersCount()
        expect(getRemainingPlayersCount.eq(2)).to.be.true

        await expect(
          this.deployedPayableGame
            .connect(this.mockKeeper)
            .triggerDailyCheckpoint()
        )
          .to.emit(this.deployedPayableGame, 'GameSplitted')
          .to.emit(this.deployedPayableGame, 'ResetGame')

        const winners = await this.deployedPayableGame.getWinners(roundId)
        const [firstWinner, secondWinner] = winners

        expect(firstWinner.playerAddress).to.equal(
          this.players[finalistIndex].address
        )
        expect(firstWinner.amountWon.eq(this.prizeAmount / 2)).to.be.true
        expect(firstWinner.prizeClaimed).to.be.false
        expect(firstWinner.roundId).to.equal(roundId)

        expect(secondWinner.playerAddress).to.equal(
          this.players[secondFinalistIndex].address
        )
        expect(secondWinner.amountWon.eq(this.prizeAmount / 2)).to.be.true
        expect(secondWinner.prizeClaimed).to.be.false
        expect(secondWinner.roundId).to.equal(roundId)

        expect(winners.length).to.equal(2)
      })

      it('should allow players to split the pot for free game', async function () {
        const finalistIndex = 2
        const secondFinalistIndex = 3
        const roundId = await this.deployedPayableGame.roundId()

        await getTwoLastPlayersVoteSplitPot({
          players: this.players,
          contract: this.deployedFreeGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          amount: this.zeroRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        await this.deployedFreeGame
          .connect(this.mockKeeper)
          .triggerDailyCheckpoint()

        // TODO ensure that address have receive right amount
        await expect(
          this.deployedFreeGame
            .connect(this.players[finalistIndex])
            .claimPrize(roundId)
        )
          .to.emit(this.deployedFreeGame, 'GamePrizeClaimed')
          .withArgs(
            this.players[finalistIndex].address,
            roundId,
            // TODO use fee to calculate 0.45
            ethers.utils.parseEther(`${this.freeGamePrizepool * 0.45}`)
          )

        // TODO ensure that address have receive right amount
        await expect(
          this.deployedFreeGame
            .connect(this.players[secondFinalistIndex])
            .claimPrize(roundId)
        )
          .to.emit(this.deployedFreeGame, 'GamePrizeClaimed')
          .withArgs(
            this.players[secondFinalistIndex].address,
            roundId,
            // TODO use fee to calculate 0.45
            ethers.utils.parseEther(`${this.freeGamePrizepool * 0.45}`)
          )
      })

      it('should claim prize', async function () {
        const finalistIndex = 2
        const secondFinalistIndex = 3

        const roundId = await this.deployedPayableGame.roundId()

        await getTwoLastPlayersVoteSplitPot({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        await this.deployedPayableGame
          .connect(this.mockKeeper)
          .triggerDailyCheckpoint()

        await expect(
          this.deployedPayableGame
            .connect(this.players[finalistIndex])
            .claimPrize(roundId)
        )
          .to.emit(this.deployedPayableGame, 'GamePrizeClaimed')
          .withArgs(
            this.players[finalistIndex].address,
            roundId,
            this.prizeAmount / 2
          )

        await expect(
          this.deployedPayableGame
            .connect(this.players[secondFinalistIndex])
            .claimPrize(roundId)
        )
          .to.emit(this.deployedPayableGame, 'GamePrizeClaimed')
          .withArgs(
            this.players[secondFinalistIndex].address,
            roundId,
            this.prizeAmount / 2
          )
      })

      it('should revert if loosing player vote to split pot', async function () {
        const finalistIndex = 2
        const secondFinalistIndex = 3
        const looserIndex = 4
        const unregisteredIndex = this.players[this.players.length - 1]

        await getTwoLastPlayersVoteSplitPot({
          players: this.players,
          contract: this.deployedPayableGame,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        await expectRevert(
          this.deployedPayableGame
            .connect(this.players[looserIndex])
            .voteToSplitPot(),
          'Player has already lost'
        )

        await expectRevert(
          this.deployedPayableGame.connect(unregisteredIndex).voteToSplitPot(),
          'Player has not entered in this game'
        )
      })

      it.skip('should revert if remaining player are less than 50 % of total players', async function () {
        // TODO Implement this Test
        // setup game ready to play (use setUpGameReadyToPlay), play for 6 player and lose for 4
        // Then call triggerDailyCheckpoint function and try calling voteToSplitPot with one player, this should throw an exception.
        // Then make a player loose then call triggerDailyCheckpoint function and and try to call again voteToSplitPot, it should works
        expect(true).to.be.false
      })
    })
  })
})
