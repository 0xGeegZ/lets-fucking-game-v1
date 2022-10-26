import {
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECOND,
  beforeEachGameImplementation,
  getTwoPlayersInFinal,
  registerPlayer,
  setUpGameReadyToPlay,
  setUpGameWithAWinner,
} from '../../../helpers/helpers'

import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { expectRevert } from '@openzeppelin/test-helpers'

describe('GameImplementationContract - Mecanism', function () {
  beforeEach(beforeEachGameImplementation)

  context('Registering to game', function () {
    describe("User can't register to the game", function () {
      context('when game is paused', async function () {
        it('should not allow user to register to the game', async function () {
          await this.game.pause()
          await expectRevert(
            this.game.connect(this.players[0]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'Contract is paused'
          )
        })
      })

      context('when user is the creator of the Game', async function () {
        it('should not allow user to register to the game', async function () {
          await expectRevert(
            this.game.connect(this.creator).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            "Caller can't be the creator"
          )
        })
      })

      context('when game is full', async function () {
        it('should not allow user to register to the game', async function () {
          const maxAmountOfUser = 10
          for (let i = 0; i < maxAmountOfUser; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.game,
              value: this.correctRegistrationAmount,
            })
          }
          await expectRevert(
            this.game.connect(this.players[10]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'This game is full'
          )
        })
      })

      context('when user already joined the game', async function () {
        it('should not allow user to register to the game', async function () {
          const player = this.players[0]
          await registerPlayer({
            player: this.players[0],
            contract: this.game,
            value: this.correctRegistrationAmount,
          })

          await expectRevert(
            this.game.connect(player).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'Player already entered in this game'
          )
        })
      })

      context(
        'when user joins the game with an incorrect amount',
        async function () {
          it('should not allow user to register to the game', async function () {
            const player = this.players[0]

            await expectRevert(
              this.game.connect(player).registerForGame({
                value: this.incorrectRegistrationAmount,
              }),
              'Only game amount is allowed'
            )
          })
        }
      )

      context('when user joins the game with 0 amount', async function () {
        it('should not allow user to register to the game', async function () {
          const player = this.players[0]

          await expectRevert(
            this.game.connect(player).registerForGame({
              value: this.zeroRegistrationAmount,
            }),
            'Only game amount is allowed'
          )
        })
      })
    })

    describe('User can register to the game', function () {
      context('when one user registers to the game', async function () {
        it('should increase the number of registered players', async function () {
          const initialNumberOfPlayers = await this.game.numPlayers()
          await registerPlayer({
            player: this.players[0],
            contract: this.game,
            value: this.correctRegistrationAmount,
          })
          const updatedNumberOfPlayers = await this.game.numPlayers()
          expect(updatedNumberOfPlayers).to.equal(initialNumberOfPlayers + 1)
        })

        it("should add the new player's address to the playerAddresses list", async function () {
          const newPlayerIndex = 0
          const newPlayerAddress = this.players[newPlayerIndex].address
          const intialPlayerAddressesList = await this.game.getPlayerAddresses()
          await registerPlayer({
            player: this.players[newPlayerIndex],
            contract: this.game,
            value: this.correctRegistrationAmount,
          })
          const updatedPlayerAddressesList =
            await this.game.getPlayerAddresses()
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
            contract: this.game,
            value: this.correctRegistrationAmount,
          })

          const playerFromMapping = await this.game.players(newPlayerAddress)
          expect(playerFromMapping.playerAddress).to.equal(newPlayerAddress)
          expect(playerFromMapping.roundCount.isZero()).to.be.true
          expect(playerFromMapping.hasLost).to.be.false
          expect(playerFromMapping.isSplitOk).to.be.false
          expect(playerFromMapping.hasPlayedRound).to.be.false
          expect(playerFromMapping.roundRangeUpperLimit.isZero()).to.be.true
          expect(playerFromMapping.roundRangeLowerLimit.isZero()).to.be.true
        })
      })
      context(
        "when the last user registers to the game before it's full",
        async function () {
          it('should let the user register', async function () {
            for (let i = 0; i < 10; i++) {
              await registerPlayer({
                player: this.players[i],
                contract: this.game,
                value: this.correctRegistrationAmount,
              })
            }
            const numPlayers = await this.game.numPlayers()
            const playerAddresses = await this.game.getPlayerAddresses()
            expect(numPlayers.toNumber()).to.equal(10) // No risk of using toNumber() here
            expect(playerAddresses.length).to.equal(10)
          })
        }
      )
    })
  })

  context('Calling daily checkpoint', function () {
    describe('when triggerDailyCheckpoint caller is not the keeper', function () {
      it('should revert transaction with correct message', async function () {
        const wrongCaller = this.players[0]
        await expectRevert(
          this.game.connect(wrongCaller).triggerDailyCheckpoint(),
          'Caller is not the keeper'
        )
      })
    })

    describe('when triggerDailyCheckpoint called during paused contract', function () {
      it('should revert transaction with correct message', async function () {
        await this.game.pause()
        await expectRevert(
          this.game.connect(this.mockKeeper).triggerDailyCheckpoint(),
          'Contract is paused'
        )
      })
    })

    describe('when there is no game currently playing', function () {
      describe('when the game is not full', function () {
        it('should not start the game', async function () {
          for (let i = 0; i < 8; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.game,
              value: this.correctRegistrationAmount,
            })
          }

          await expect(
            this.game.connect(this.mockKeeper).triggerDailyCheckpoint()
          ).to.not.emit(this.game, 'StartedGame')
        })
      })

      describe('when the game is full', function () {
        it('should start the game', async function () {
          for (let i = 0; i < 10; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.game,
              value: this.correctRegistrationAmount,
            })
          }

          await expect(
            this.game.connect(this.mockKeeper).triggerDailyCheckpoint()
          )
            .to.emit(this.game, 'StartedGame')
            .withArgs(anyValue, '10')
        })
      })
    })

    describe('when there is a game currently playing', function () {
      it('should not start a new game', async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,
          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.game.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.not.emit(this.game, 'StartedGame')
      })

      it("should refresh players' statuses", async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.game.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.emit(this.game, 'GameLost')
      })

      it('should check if prize have to be split', async function () {
        //
      })

      it('should check if game ended and close it', async function () {
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        // A day passes until the next checkpoint
        await ethers.provider.send('evm_increaseTime', [ONE_DAY_IN_SECONDS])

        await expect(
          this.game.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.emit(this.game, 'ResetGame')
      })
    })
  })

  context('When game gets started', function () {
    it('should set the game as started', async function () {
      await setUpGameReadyToPlay({
        players: this.players,
        contract: this.game,
        amount: this.correctRegistrationAmount,

        mockKeeper: this.mockKeeper,
      })

      const isStartedGame = await this.game.gameInProgress()
      expect(isStartedGame).to.be.true
    })

    it("should set each player's round limits to a new random timestamp in the next 24 hours", async function () {
      await setUpGameReadyToPlay({
        players: this.players,
        contract: this.game,
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
        const player = await this.game.players(this.players[i].address)
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
      ).to.emit(this.game, 'StartedGame')
    })
  })

  context('Playing a round', function () {
    describe("User can't play a round", function () {
      context('when game is paused', async function () {
        it('should not allow the user to play the round', async function () {
          await this.game.pause()
          await expectRevert(
            this.game.connect(this.players[0]).playRound(),
            'Contract is paused'
          )
        })
      })

      context('when game is not full', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          for (let i = 0; i < maxAmountOfUser - 1; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.game,
              value: this.correctRegistrationAmount,
            })
          }
          await expectRevert(
            this.game.connect(this.players[0]).playRound(),
            'This game is not full'
          )
        })
      })

      context('when user is not registered in the game', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          const notRegisteredUserIndex = 11
          for (let i = 0; i < maxAmountOfUser; i++) {
            await registerPlayer({
              player: this.players[i],
              contract: this.game,
              value: this.correctRegistrationAmount,
            })
          }

          await expectRevert(
            this.game.connect(this.players[notRegisteredUserIndex]).playRound(),
            'Player has not entered in this game'
          )
        })
      })

      context('when user has lost in this game', async function () {
        it('should not allow the user to play the round', async function () {
          const playerIndex = 0
          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.game,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
          const initialPlayer = await this.game.players(
            this.players[playerIndex].address
          )
          const initialPlayerRangeLowerLimit =
            initialPlayer.roundRangeLowerLimit

          await this.game.connect(this.players[playerIndex]).playRound()

          // Time passes until we reach player's range
          const insidePlayerRange =
            initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
          await ethers.provider.send('evm_setNextBlockTimestamp', [
            insidePlayerRange.toNumber(),
          ])

          await expectRevert(
            this.game.connect(this.players[playerIndex]).playRound(),
            'Player has already lost'
          )
        })
      })

      context('when user has played in this round', async function () {
        it('should not allow the user to play again', async function () {
          const playerIndex = 0
          await setUpGameReadyToPlay({
            players: this.players,
            contract: this.game,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
          const initialPlayer = await this.game.players(
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

          await this.game.connect(this.players[playerIndex]).playRound()

          await expectRevert(
            this.game.connect(this.players[playerIndex]).playRound(),
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
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

        await this.game.connect(this.players[playerIndex]).playRound()
        const updatedPlayer = await this.game.players(
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await this.game.connect(this.players[playerIndex]).playRound()

        const updatedPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.hasPlayedRound).to.be.false
        expect(updatedPlayer.hasPlayedRound).to.be.true
      })

      it('should emit the PlayedRound event with the correct data', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await expect(this.game.connect(this.players[playerIndex]).playRound())
          .to.emit(this.game, 'PlayedRound')
          .withArgs(this.players[playerIndex].address)
      })

      it("should keep player's hasLost field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange =
          initialPlayerRangeLowerLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          insidePlayerRange.toNumber(),
        ])

        await this.game.connect(this.players[playerIndex]).playRound()

        const updatedPlayer = await this.game.players(
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange =
          initialPlayerRangeUpperLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          beyondPlayerRange.toNumber(),
        ])

        await this.game.connect(this.players[playerIndex]).playRound()

        const updatedPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.hasLost).to.be.false
        expect(updatedPlayer.hasLost).to.be.true
      })

      it("should keep the player's isSplitOk field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange =
          initialPlayerRangeUpperLimit.add(ONE_HOUR_IN_SECOND)
        await ethers.provider.send('evm_setNextBlockTimestamp', [
          beyondPlayerRange.toNumber(),
        ])

        await this.game.connect(this.players[playerIndex]).playRound()

        const updatedPlayer = await this.game.players(
          this.players[playerIndex].address
        )
        expect(initialPlayer.isSplitOk).to.be.false
        expect(updatedPlayer.isSplitOk).to.be.false
      })

      it('should emit the event notifying the user lost the game', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const initialPlayer = await this.game.players(
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
          this.game.connect(this.players[playerIndex]).playRound()
        ).to.emit(this.game, 'GameLost')
        // Add params  event GameLost(uint256 roundId, address playerAddress, uint256 roundCount);
        // .withArgs('0', this.players[playerIndex].address)
      })
    })

    describe('when player does not play in this round and others did', function () {
      it("should set the player's hasLost field to true", async function () {
        const looserIndex = 0
        const finalistIndex = 2
        const secondFinalistIndex = 3

        await setUpGameReadyToPlay({
          players: this.players,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.game.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.game,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,

          mockKeeper: this.mockKeeper,
        })

        const looserUpdatedData = await this.game.players(
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.game.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.game,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,

          mockKeeper: this.mockKeeper,
        })

        const looserUpdatedData = await this.game.players(
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
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const startedGameBlock = await ethers.provider.getBlock()
        const startedGameTimestamp = startedGameBlock.timestamp

        const looserInitialData = await this.game.players(
          this.players[looserIndex].address
        )

        await getTwoPlayersInFinal({
          players: this.players,
          contract: this.game,
          player1Index: finalistIndex,
          player2Index: secondFinalistIndex,
          startedGameTimestamp,

          mockKeeper: this.mockKeeper,
        })
        const looserUpdatedData = await this.game.players(
          this.players[looserIndex].address
        )
        expect(looserInitialData.hasLost).to.be.false
        expect(looserUpdatedData.hasLost).to.be.true
      })
    })
  })

  context('Winning a game', function () {
    describe('when there is only one user left', async function () {
      it('should create a new Winner and add it to the gameWinners mapping', async function () {
        // TODO this case test fail
        const roundId = 0
        const winnerIndex = 4
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const newWinner = await this.game.gameWinners(roundId)
        expect(newWinner.playerAddress).to.equal(
          this.players[winnerIndex].address
        )
        expect(newWinner.amountWon.eq(this.prizeAmount)).to.be.true
        expect(newWinner.prizeClaimed).to.be.false
        expect(newWinner.roundId).to.equal(roundId)
      })

      it('should emit the GameWon event with the correct data', async function () {
        // TODO this case test fail
        const winnerIndex = 4

        await expect(
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.game,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
        )
          .to.emit(this.game, 'GameWon')
          .withArgs(
            '0',
            this.players[winnerIndex].address,
            this.prizeAmount.toString()
          )
      })

      it('should reset the game', async function () {
        // TODO this case test fail
        const previousGameId = 0
        const winnerIndex = 4
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        const updatedPlayersAmount = await this.game.numPlayers()
        const updatedPlayerAddressesList = await this.game.getPlayerAddresses()

        const updatedGameId = await this.game.roundId()

        expect(updatedPlayersAmount).to.equal(0)
        for (let i = 0; i < updatedPlayerAddressesList.length; i++) {
          expect(updatedPlayerAddressesList[i]).to.equal(
            '0x0000000000000000000000000000000000000000'
          )
        }

        expect(updatedGameId).to.equal(previousGameId + 1)
      })

      it('should emit the ResetGame event', async function () {
        const winnerIndex = 4

        await expect(
          await setUpGameWithAWinner({
            players: this.players,
            winnerIndex,
            contract: this.game,
            amount: this.correctRegistrationAmount,

            mockKeeper: this.mockKeeper,
          })
        ).to.emit(this.game, 'ResetGame')
      })
    })
  })

  context('Claiming a prize', function () {
    describe('when the game does not exist', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const inexistantGameId = 10
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        await expectRevert(
          this.game
            .connect(this.players[winnerIndex])
            .claimPrize(inexistantGameId),
          'This game does not exist'
        )
      })
    })

    describe('when the user did not win the game', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const impostorIndex = 3
        const existantGameId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        await expectRevert(
          this.game
            .connect(this.players[impostorIndex])
            .claimPrize(existantGameId),
          'Player did not win this game'
        )
      })
    })

    describe('when the prize for the game as been claimed already', function () {
      it('should revert', async function () {
        // TODO this case test fail
        // TODO GUIGUI
        const winnerIndex = 0
        const existantGameId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })
        await this.game
          .connect(this.players[winnerIndex])
          .claimPrize(existantGameId)

        await expectRevert(
          this.game
            .connect(this.players[winnerIndex])
            .claimPrize(existantGameId),
          'Prize for this game already claimed'
        )
      })
    })

    describe('when the user did win an existing game not already claimed', function () {
      it('should transfer the prize to the winner', async function () {
        // TODO this case test fail
        // TODO GUIGUI
        const winnerIndex = 3
        const existantGameId = 0

        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        const initialContractBalance = await ethers.provider.getBalance(
          this.game.address
        )
        const initialWinnerBalance = await ethers.provider.getBalance(
          this.players[winnerIndex].address
        )
        const tx = await this.game
          .connect(this.players[winnerIndex])
          .claimPrize(existantGameId)

        const receipt = await tx.wait()
        const gasPrice = tx.gasPrice
        const gasUsed = receipt.gasUsed

        const updatedContractBalance = await ethers.provider.getBalance(
          this.game.address
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
        // TODO this case test fail
        const winnerIndex = 0
        const existantGameId = 0
        await setUpGameWithAWinner({
          players: this.players,
          winnerIndex,
          contract: this.game,
          amount: this.correctRegistrationAmount,

          mockKeeper: this.mockKeeper,
        })

        await expect(
          this.game
            .connect(this.players[winnerIndex])
            .claimPrize(existantGameId)
        )
          .to.emit(this.game, 'GamePrizeClaimed')
          .withArgs(
            this.players[winnerIndex].address,
            existantGameId,
            this.prizeAmount
          )
      })
    })
  })
})
