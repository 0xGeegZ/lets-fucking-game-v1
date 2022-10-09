const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
const { time, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { ethers } = require('hardhat')

let creator,
  players,
  GameImplementationContract,
  gameImplementationContract,
  GameFactoryContract,
  gameFactoryContract

describe('GameImplementationContract', function () {
  beforeEach(async function () {
    ;[creator, ...players] = await ethers.getSigners()
    this.correctRegistrationAmount = ethers.utils.parseEther('0.0001')
    this.houseEdge = ethers.utils.parseEther('0.00005')
    this.creatorEdge = ethers.utils.parseEther('0.00005')
    this.prizeAmount = ethers.utils.parseEther('0.0009') // prizeAmount equals total prize amount minus house edge
    this.incorrectRegistrationAmount = ethers.utils.parseEther('0.03')
    this.zeroRegistrationAmount = ethers.utils.parseEther('0')
    this.launchDuration = 60 * 60 * 25
    this.nextAllowedPlay = time.duration.days(1)
    this.RoundMaximumDuration = time.duration.days(2)
    this.upperMaxDuration = 60 * 60 * 24
    this.underMaxDuration = 60 * 60 * 20
    this.mockKeeper = players[18]
    this.generalAdmin = players[17]

    GameFactoryContract = await ethers.getContractFactory('GameFactory')
    GameImplementationContract = await ethers.getContractFactory(
      'GameImplementation'
    )
    gameImplementationContract = await GameImplementationContract.deploy()
    await gameImplementationContract.deployed()
    gameFactoryContract = await GameFactoryContract.connect(
      this.generalAdmin
    ).deploy(
      gameImplementationContract.address,
      this.correctRegistrationAmount,
      this.houseEdge,
      this.creatorEdge
    )
    await gameFactoryContract.deployed()
    await gameFactoryContract.connect(creator).createNewGameLine(10, 2)
    const clonedContract = await gameFactoryContract.deployedGameLines('0')
    this.contract = await GameImplementationContract.attach(
      clonedContract.deployedAddress
    )

    await this.contract
      .connect(this.generalAdmin)
      .setKeeper(players[18].address)
  })
  /*
----------------------------------------------------------------------------------------------------
HELPERS FUNCTIONS
----------------------------------------------------------------------------------------------------
  */

  const registerPlayer = async function (index, contract, value) {
    const player = players[index]

    await expect(contract.connect(player).registerForGame({ value }))
      .to.emit(contract, 'RegisteredForGame')
      .withArgs(player.address, anyValue)
  }

  const setUpGameReadyToPlay = async function (contract, amount, mockKeeper) {
    // 10 players register for the game.
    for (let i = 0; i < 10; i++) {
      await registerPlayer(i, contract, amount)
    }

    // Some time passes before the daily checkpoint gets triggered
    await time.increase(time.duration.hours(2))

    // Daily checkpoint gets triggered, the game starts
    const receipt = await contract.connect(mockKeeper).triggerDailyCheckpoint()
    return receipt
  }

  const makePlayerLooseForNotPlaying = async function (
    contract,
    otherPlayer1Index,
    otherPlayer2Index,
    startedGameTimestamp,
    mockKeeper
  ) {
    const otherPlayer1InitialData = await contract.players(
      players[otherPlayer1Index].address
    )
    const otherPlayer2InitialData = await contract.players(
      players[otherPlayer2Index].address
    )
    const otherPlayer1RangeLowerLimit =
      otherPlayer1InitialData.roundRangeLowerLimit
    const otherPlayer2RangeLowerLimit =
      otherPlayer2InitialData.roundRangeLowerLimit

    // Time passes until first other player's range, he plays, then until second other player's range, who plays too
    // Whoever has the soonest range plays first
    if (otherPlayer1RangeLowerLimit.eq(otherPlayer2RangeLowerLimit)) {
      await time.increaseTo(otherPlayer1RangeLowerLimit.toString())
      await contract.connect(players[otherPlayer1Index]).playRound()
      await contract.connect(players[otherPlayer2Index]).playRound()
    } else if (otherPlayer1RangeLowerLimit.lt(otherPlayer2RangeLowerLimit)) {
      await time.increaseTo(otherPlayer1RangeLowerLimit.toString())
      await contract.connect(players[otherPlayer1Index]).playRound()
      await time.increaseTo(otherPlayer2RangeLowerLimit.toString())
      await contract.connect(players[otherPlayer2Index]).playRound()
    } else {
      await time.increaseTo(otherPlayer2RangeLowerLimit.toString())
      await contract.connect(players[otherPlayer2Index]).playRound()
      await time.increaseTo(otherPlayer1RangeLowerLimit.toString())
      await contract.connect(players[otherPlayer1Index]).playRound()
    }

    // Time passes until next checkpoint
    await time.increaseTo(
      startedGameTimestamp.add(time.duration.hours(24)).toString()
    )

    const receipt = await contract.connect(mockKeeper).triggerDailyCheckpoint()
    return receipt
  }

  const setUpGameWithAWinner = async function (
    winnerIndex,
    contract,
    amount,
    mockKeeper
  ) {
    const secondPlayerIndex = 2
    await setUpGameReadyToPlay(contract, amount, mockKeeper)
    const startedGameTimestamp = await time.latest()
    // 8 players lost for not playing, 2 players remain in second round
    await makePlayerLooseForNotPlaying(
      contract,
      winnerIndex,
      secondPlayerIndex,
      startedGameTimestamp,
      mockKeeper
    )
    const secondRoundStartedTimestamp = await time.latest()
    const firstPlayerInitialData = await contract.players(
      players[winnerIndex].address
    )
    const secondPlayerInitialData = await contract.players(
      players[secondPlayerIndex].address
    )
    const firstPlayerRangeLowerLimit =
      firstPlayerInitialData.roundRangeLowerLimit
    const secondPlayerRangeUpperLimit =
      secondPlayerInitialData.roundRangeUpperLimit

    // Time passes beyond second player's round range and until winner's round range
    // Both play and second player looses
    if (firstPlayerRangeLowerLimit.eq(secondPlayerRangeUpperLimit)) {
      await time.increaseTo(firstPlayerRangeLowerLimit.toString())
      await contract.connect(players[winnerIndex]).playRound()
      await contract.connect(players[secondPlayerIndex]).playRound()
    } else if (firstPlayerRangeLowerLimit.lt(secondPlayerRangeUpperLimit)) {
      await time.increaseTo(firstPlayerRangeLowerLimit.toString())
      await contract.connect(players[winnerIndex]).playRound()
      await time.increaseTo(secondPlayerRangeUpperLimit.toString())
      await contract.connect(players[secondPlayerIndex]).playRound()
    } else {
      await time.increaseTo(secondPlayerRangeUpperLimit.toString())
      await contract.connect(players[secondPlayerIndex]).playRound()
      await time.increaseTo(firstPlayerRangeLowerLimit.toString())
      await contract.connect(players[winnerIndex]).playRound()
    }

    // Time passes until next checkpoint
    await time.increaseTo(
      secondRoundStartedTimestamp.add(time.duration.hours(25)).toString()
    )

    const receipt = await contract.connect(mockKeeper).triggerDailyCheckpoint()
    return receipt
  }

  /*
----------------------------------------------------------------------------------------------------
TESTS
----------------------------------------------------------------------------------------------------
  */

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
        expect(creator.address).to.equal(contractCreator)
      })
    })
  })

  context('Registering to game', function () {
    describe("User can't register to the game", function () {
      context('when game is paused', async function () {
        it('should not allow user to register to the game', async function () {
          await this.contract.pause()
          await expectRevert(
            this.contract.connect(players[0]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'Contract is paused'
          )
        })
      })

      context('when user is the creator of the Game', async function () {
        it('should not allow user to register to the game', async function () {
          await expectRevert(
            this.contract.connect(creator).registerForGame({
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
            await registerPlayer(
              i,
              this.contract,
              this.correctRegistrationAmount
            )
          }
          await expectRevert(
            this.contract.connect(players[10]).registerForGame({
              value: this.correctRegistrationAmount,
            }),
            'This game is full'
          )
        })
      })

      context('when user already joined the game', async function () {
        it('should not allow user to register to the game', async function () {
          const player = players[0]
          await registerPlayer(0, this.contract, this.correctRegistrationAmount)

          await expectRevert(
            this.contract.connect(player).registerForGame({
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
            const player = players[0]

            await expectRevert(
              this.contract.connect(player).registerForGame({
                value: this.incorrectRegistrationAmount,
              }),
              'Only game amount is allowed'
            )
          })
        }
      )

      context('when user joins the game with 0 amount', async function () {
        it('should not allow user to register to the game', async function () {
          const player = players[0]

          await expectRevert(
            this.contract.connect(player).registerForGame({
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
          const initialNumberOfPlayers = await this.contract.numPlayers()
          await registerPlayer(0, this.contract, this.correctRegistrationAmount)
          const updatedNumberOfPlayers = await this.contract.numPlayers()
          expect(updatedNumberOfPlayers).to.equal(initialNumberOfPlayers + 1)
        })

        it("should add the new player's address to the playerAddresses list", async function () {
          const newPlayerIndex = 0
          const newPlayerAddress = players[newPlayerIndex].address
          const intialPlayerAddressesList =
            await this.contract.getPlayerAddresses()
          await registerPlayer(
            newPlayerIndex,
            this.contract,
            this.correctRegistrationAmount
          )
          const updatedPlayerAddressesList =
            await this.contract.getPlayerAddresses()
          expect(updatedPlayerAddressesList.length).to.equal(
            +intialPlayerAddressesList.length + 1
          )
          expect(updatedPlayerAddressesList[newPlayerIndex]).to.equal(
            newPlayerAddress
          )
        })

        it('should create a new Player and add it to the players mapping', async function () {
          const newPlayerIndex = 0
          const newPlayerAddress = players[newPlayerIndex].address
          await registerPlayer(
            newPlayerIndex,
            this.contract,
            this.correctRegistrationAmount
          )
          const playerFromMapping = await this.contract.players(
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
      context(
        "when the last user registers to the game before it's full",
        async function () {
          it('should let the user register', async function () {
            for (let i = 0; i < 10; i++) {
              await registerPlayer(
                i,
                this.contract,
                this.correctRegistrationAmount
              )
            }
            const numPlayers = await this.contract.numPlayers()
            const playerAddresses = await this.contract.getPlayerAddresses()
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
        const wrongCaller = players[17]
        await expectRevert(
          this.contract.connect(wrongCaller).triggerDailyCheckpoint(),
          'Caller is not the keeper'
        )
      })
    })

    describe('when triggerDailyCheckpoint called during paused contract', function () {
      it('should revert transaction with correct message', async function () {
        await this.contract.pause()
        await expectRevert(
          this.contract.connect(this.mockKeeper).triggerDailyCheckpoint(),
          'Contract is paused'
        )
      })
    })

    describe('when there is no game currently playing', function () {
      describe('when the game is not full', function () {
        it('should not start the game', async function () {
          for (let i = 0; i < 8; i++) {
            await registerPlayer(
              i,
              this.contract,
              this.correctRegistrationAmount
            )
          }

          await expect(
            this.contract.connect(this.mockKeeper).triggerDailyCheckpoint()
          ).to.not.emit(this.contract, 'StartedGame')
        })
      })

      describe('when the game is full', function () {
        it('should start the game', async function () {
          for (let i = 0; i < 10; i++) {
            await registerPlayer(
              i,
              this.contract,
              this.correctRegistrationAmount
            )
          }

          await expect(
            this.contract.connect(this.mockKeeper).triggerDailyCheckpoint()
          )
            .to.emit(this.contract, 'StartedGame')
            .withArgs(anyValue, '10')
        })
      })
    })

    describe('when there is a game currently playing', function () {
      it('should not start a new game', async function () {
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        // A day passes until the next checkpoint
        await time.increase(time.duration.hours(24))

        await expect(
          this.contract.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.not.emit(this.contract, 'StartedGame')
      })

      it("should refresh players' statuses", async function () {
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        // A day passes until the next checkpoint
        await time.increase(time.duration.hours(24))

        await expect(
          this.contract.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.emit(this.contract, 'GameLost')
      })

      it('should check if game ended and close it', async function () {
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        // A day passes until the next checkpoint
        await time.increase(time.duration.hours(24))

        await expect(
          this.contract.connect(this.mockKeeper).triggerDailyCheckpoint()
        ).to.emit(this.contract, 'ResetGame')
      })
    })
  })

  context('When game gets started', function () {
    it('should set the game as started', async function () {
      await setUpGameReadyToPlay(
        this.contract,
        this.correctRegistrationAmount,
        this.mockKeeper
      )

      const isStartedGame = await this.contract.gameInProgress()
      expect(isStartedGame).to.be.true
    })

    it("should set each player's round limits to a new random timestamp in the next 24 hours", async function () {
      await setUpGameReadyToPlay(
        this.contract,
        this.correctRegistrationAmount,
        this.mockKeeper
      )
      const currentBlockTimestamp = await time.latest()
      const nextCheckpointTimestamp = currentBlockTimestamp.add(
        time.duration.hours(24)
      )
      for (let i = 0; i < 10; i++) {
        const player = await this.contract.players(players[i].address)
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
        setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
      ).to.emit(this.contract, 'StartedGame')
    })
  })

  context('Playing a round', function () {
    describe("User can't play a round", function () {
      context('when game is paused', async function () {
        it('should not allow the user to play the round', async function () {
          await this.contract.pause()
          await expectRevert(
            this.contract.connect(players[0]).playRound(),
            'Contract is paused'
          )
        })
      })

      context('when game is not full', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          for (let i = 0; i < maxAmountOfUser - 1; i++) {
            await registerPlayer(
              i,
              this.contract,
              this.correctRegistrationAmount
            )
          }
          await expectRevert(
            this.contract.connect(players[0]).playRound(),
            'This game is not full'
          )
        })
      })

      context('when user is not registered in the game', async function () {
        it('should not allow the user to play the round', async function () {
          const maxAmountOfUser = 10
          const notRegisteredUserIndex = 11
          for (let i = 0; i < maxAmountOfUser; i++) {
            await registerPlayer(
              i,
              this.contract,
              this.correctRegistrationAmount
            )
          }

          await expectRevert(
            this.contract.connect(players[notRegisteredUserIndex]).playRound(),
            'Player has not entered in this game'
          )
        })
      })

      context('when user has lost in this game', async function () {
        it('should not allow the user to play the round', async function () {
          const playerIndex = 0
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialPlayer = await this.contract.players(
            players[playerIndex].address
          )
          const initialPlayerRangeLowerLimit =
            initialPlayer.roundRangeLowerLimit

          await this.contract.connect(players[playerIndex]).playRound()

          // Time passes until we reach player's range
          const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
          await time.increaseTo(insidePlayerRange.toString())

          await expectRevert(
            this.contract.connect(players[playerIndex]).playRound(),
            'Player has already lost'
          )
        })
      })

      context('when user has played in this round', async function () {
        it('should not allow the user to play again', async function () {
          const playerIndex = 0
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialPlayer = await this.contract.players(
            players[playerIndex].address
          )
          const initialPlayerRangeLowerLimit =
            initialPlayer.roundRangeLowerLimit

          // Time passes until we reach player's range
          const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
          await time.increaseTo(insidePlayerRange.toString())

          await this.contract.connect(players[playerIndex]).playRound()

          await expectRevert(
            this.contract.connect(players[playerIndex]).playRound(),
            'Player has already played in this round'
          )
        })
      })
    })

    describe('User plays at the correct moment', function () {
      it("should update player's round count", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRoundCount = initialPlayer.roundCount
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
        await time.increaseTo(insidePlayerRange.toString())

        await this.contract.connect(players[playerIndex]).playRound()
        const updatedPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const updatedPlayerRoundCount = updatedPlayer.roundCount

        expect(updatedPlayerRoundCount.toNumber()).to.equal(
          initialPlayerRoundCount.toNumber() + 1
        )
      })

      it("should set the player's hasPlayed field to true", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
        await time.increaseTo(insidePlayerRange.toString())

        await this.contract.connect(players[playerIndex]).playRound()

        const updatedPlayer = await this.contract.players(
          players[playerIndex].address
        )
        expect(initialPlayer.hasPlayedRound).to.be.false
        expect(updatedPlayer.hasPlayedRound).to.be.true
      })

      it('should emit the PlayedRound event with the correct data', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
        await time.increaseTo(insidePlayerRange.toString())

        await expect(this.contract.connect(players[playerIndex]).playRound())
          .to.emit(this.contract, 'PlayedRound')
          .withArgs(players[playerIndex].address)
      })

      it("should keep player's hasLost field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeLowerLimit = initialPlayer.roundRangeLowerLimit

        // Time passes until we reach player's range
        const insidePlayerRange = initialPlayerRangeLowerLimit.add(3600)
        await time.increaseTo(insidePlayerRange.toString())

        await this.contract.connect(players[playerIndex]).playRound()

        const updatedPlayer = await this.contract.players(
          players[playerIndex].address
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
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange = initialPlayerRangeUpperLimit.add(3600)
        await time.increaseTo(beyondPlayerRange.toString())

        await this.contract.connect(players[playerIndex]).playRound()

        const updatedPlayer = await this.contract.players(
          players[playerIndex].address
        )
        expect(initialPlayer.hasLost).to.be.false
        expect(updatedPlayer.hasLost).to.be.true
      })

      it("should keep the player's isSplitOk field to false", async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange = initialPlayerRangeUpperLimit.add(3600)
        await time.increaseTo(beyondPlayerRange.toString())

        await this.contract.connect(players[playerIndex]).playRound()

        const updatedPlayer = await this.contract.players(
          players[playerIndex].address
        )
        expect(initialPlayer.isSplitOk).to.be.false
        expect(updatedPlayer.isSplitOk).to.be.false
      })

      it('should emit the event notifying the user lost the game', async function () {
        const playerIndex = 0
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const initialPlayer = await this.contract.players(
          players[playerIndex].address
        )
        const initialPlayerRangeUpperLimit = initialPlayer.roundRangeUpperLimit

        // Time passes beyond player's range
        const beyondPlayerRange = initialPlayerRangeUpperLimit.add(3600)
        await time.increaseTo(beyondPlayerRange.toString())

        await expect(this.contract.connect(players[playerIndex]).playRound())
          .to.emit(this.contract, 'GameLost')
          .withArgs('0', players[playerIndex].address)
      })
    })

    describe('when player does not play in this round and others did', function () {
      it("should set the player's hasLost field to true", async function () {
        const looserIndex = 0
        const otherPlayerIndex = 2
        const otherPlayerIndex2 = 3
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const StartedGameTimestamp = await time.latest()
        const looserInitialData = await this.contract.players(
          players[looserIndex].address
        )
        await makePlayerLooseForNotPlaying(
          this.contract,
          otherPlayerIndex,
          otherPlayerIndex2,
          StartedGameTimestamp,
          this.mockKeeper
        )
        const looserUpdatedData = await this.contract.players(
          players[looserIndex].address
        )
        expect(looserInitialData.hasLost).to.be.false
        expect(looserUpdatedData.hasLost).to.be.true
      })

      it("should keep the player's isSplitOk field to false", async function () {
        const looserIndex = 0
        const otherPlayerIndex = 2
        const otherPlayerIndex2 = 3
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const StartedGameTimestamp = await time.latest()
        const looserInitialData = await this.contract.players(
          players[looserIndex].address
        )
        await makePlayerLooseForNotPlaying(
          this.contract,
          otherPlayerIndex,
          otherPlayerIndex2,
          StartedGameTimestamp,
          this.mockKeeper
        )
        const looserUpdatedData = await this.contract.players(
          players[looserIndex].address
        )
        expect(looserInitialData.isSplitOk).to.be.false
        expect(looserUpdatedData.isSplitOk).to.be.false
      })

      it('should emit the event notifying the user lost the game', async function () {
        const looserIndex = 0
        const otherPlayerIndex = 2
        const otherPlayerIndex2 = 3
        await setUpGameReadyToPlay(
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const StartedGameTimestamp = await time.latest()
        await expect(
          makePlayerLooseForNotPlaying(
            this.contract,
            otherPlayerIndex,
            otherPlayerIndex2,
            StartedGameTimestamp,
            this.mockKeeper
          )
        )
          .to.emit(this.contract, 'GameLost')
          .withArgs('0', players[looserIndex].address)
      })
    })
  })

  context('Winning a game', function () {
    describe('when there is only one user left', async function () {
      it('should create a new Winner and add it to the gameWinners mapping', async function () {
        const gameId = 0
        const winnerIndex = 4
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const newWinner = await this.contract.gameWinners(gameId)
        expect(newWinner.playerAddress).to.equal(players[winnerIndex].address)
        expect(newWinner.amountWon.eq(this.prizeAmount)).to.be.true
        expect(newWinner.prizeClaimed).to.be.false
        expect(newWinner.gameId).to.equal(gameId)
      })

      it('should emit the GameWon event with the correct data', async function () {
        const winnerIndex = 4

        await expect(
          setUpGameWithAWinner(
            winnerIndex,
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
        )
          .to.emit(this.contract, 'GameWon')
          .withArgs(
            '0',
            players[winnerIndex].address,
            this.prizeAmount.toString()
          )
      })

      it('should reset the game', async function () {
        const previousGameId = 0
        const winnerIndex = 4
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        const updatedPlayersAmount = await this.contract.numPlayers()
        const updatedPlayerAddressesList =
          await this.contract.getPlayerAddresses()
        const updatedGameId = await this.contract.gameId()
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
          setUpGameWithAWinner(
            winnerIndex,
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
        ).to.emit(this.contract, 'ResetGame')
      })
    })
  })

  context('Claiming a prize', function () {
    describe('when the game does not exist', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const inexistantGameId = 10
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        await expectRevert(
          this.contract
            .connect(players[winnerIndex])
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
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        await expectRevert(
          this.contract
            .connect(players[impostorIndex])
            .claimPrize(existantGameId),
          'Player did not win this game'
        )
      })
    })

    describe('when the prize for the game as been claimed already', function () {
      it('should revert', async function () {
        const winnerIndex = 0
        const existantGameId = 0
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )
        await this.contract
          .connect(players[winnerIndex])
          .claimPrize(existantGameId)

        await expectRevert(
          this.contract
            .connect(players[winnerIndex])
            .claimPrize(existantGameId),
          'Prize for this game already claimed'
        )
      })
    })

    describe('when the user did win an existing game not already claimed', function () {
      it('should transfer the prize to the winner', async function () {
        const winnerIndex = 3
        const existantGameId = 0

        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        const initialContractBalance = await ethers.provider.getBalance(
          this.contract.address
        )
        const initialWinnerBalance = await ethers.provider.getBalance(
          players[winnerIndex].address
        )
        const tx = await this.contract
          .connect(players[winnerIndex])
          .claimPrize(existantGameId)

        const receipt = await tx.wait()
        const gasPrice = tx.gasPrice
        const gasUsed = receipt.gasUsed

        const updatedContractBalance = await ethers.provider.getBalance(
          this.contract.address
        )
        const updatedWinnerBalance = await ethers.provider.getBalance(
          players[winnerIndex].address
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
        const existantGameId = 0
        await setUpGameWithAWinner(
          winnerIndex,
          this.contract,
          this.correctRegistrationAmount,
          this.mockKeeper
        )

        await expect(
          this.contract.connect(players[winnerIndex]).claimPrize(existantGameId)
        )
          .to.emit(this.contract, 'GamePrizeClaimed')
          .withArgs(
            players[winnerIndex].address,
            existantGameId,
            this.prizeAmount
          )
      })
    })
  })

  context('Creator functions', function () {
    describe('setGameName', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.contract.connect(this.generalAdmin).setGameName('New name'),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should change the name of the Game Line', async function () {
          const newName = 'New name'
          await this.contract.connect(creator).setGameName(newName)
          const updatedName = await this.contract.gameName()
          expect(updatedName).to.be.equal(newName)
        })
      })
    })

    describe('setGameImage', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.contract
              .connect(this.generalAdmin)
              .setGameImage('https://www.new-ipfs-image.com'),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should change the image link of the Game Line', async function () {
          const newImageLink = 'https://www.new-ipfs-image.com'
          await this.contract.connect(creator).setGameImage(newImageLink)
          const updatedImage = await this.contract.gameImage()
          expect(updatedImage).to.be.equal(newImageLink)
        })
      })
    })

    describe('withdrawCreatorEdge', function () {
      describe('when caller is not the creator', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.contract.connect(this.generalAdmin).withdrawCreatorEdge(),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the creator', function () {
        it('should withdraw the creator edge', async function () {
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const initialCreatorBalance = await ethers.provider.getBalance(
            creator.address
          )
          const tx = await this.contract.connect(creator).withdrawCreatorEdge()

          const receipt = await tx.wait()
          const gasPrice = tx.gasPrice
          const gasUsed = receipt.gasUsed

          const updatedContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const updatedCreatorBalance = await ethers.provider.getBalance(
            creator.address
          )

          expect(updatedContractBalance).to.be.equal(
            initialContractBalance.sub(this.creatorEdge)
          )
          expect(updatedCreatorBalance).to.be.equal(
            initialCreatorBalance
              .add(this.creatorEdge)
              .sub(gasPrice.mul(gasUsed))
          )
        })
      })
    })
  })

  context('Admin functions', function () {
    describe('withdrawAdminEdge', function () {
      describe('when caller is not the general admin', function () {
        it('should revert with correct error message', async function () {
          await expectRevert(
            this.contract.connect(creator).withdrawAdminEdge(),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the general admin', function () {
        it('should withdraw the general admin edge', async function () {
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const initialAdminBalance = await ethers.provider.getBalance(
            this.generalAdmin.address
          )
          const tx = await this.contract
            .connect(this.generalAdmin)
            .withdrawAdminEdge()

          const receipt = await tx.wait()
          const gasPrice = tx.gasPrice
          const gasUsed = receipt.gasUsed

          const updatedContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const updatedAdminBalance = await ethers.provider.getBalance(
            this.generalAdmin.address
          )

          expect(updatedContractBalance).to.be.equal(
            initialContractBalance.sub(this.houseEdge)
          )
          expect(updatedAdminBalance).to.be.equal(
            initialAdminBalance.add(this.houseEdge).sub(gasPrice.mul(gasUsed))
          )
        })
      })
    })
  })

  context('Emergency functions', function () {
    describe('withdrawFunds', function () {
      describe('when caller is not the general admin or creator', function () {
        it('should revert with correct message', async function () {
          await expectRevert(
            this.contract.connect(players[5]).withdrawFunds(players[5].address),
            'Caller is not the creator'
          )
        })
      })

      describe('when caller is the general admin', function () {
        it('should withdraw all the contract funds and transfer them to the given address', async function () {
          const fundReceiverAddress = players[5].address
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const initialReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          await this.contract
            .connect(this.generalAdmin)
            .withdrawFunds(fundReceiverAddress)

          const updatedContractBalance = await ethers.provider.getBalance(
            this.contract.address
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

      describe('when caller is the creator', function () {
        it('should withdraw all the contract funds and transfer them to the given address', async function () {
          const fundReceiverAddress = players[5].address
          await setUpGameReadyToPlay(
            this.contract,
            this.correctRegistrationAmount,
            this.mockKeeper
          )
          const initialContractBalance = await ethers.provider.getBalance(
            this.contract.address
          )
          const initialReceiverBalance = await ethers.provider.getBalance(
            fundReceiverAddress
          )

          await this.contract
            .connect(creator)
            .withdrawFunds(fundReceiverAddress)

          const updatedContractBalance = await ethers.provider.getBalance(
            this.contract.address
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
  })
})
