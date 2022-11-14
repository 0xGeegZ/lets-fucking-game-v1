import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory } from 'config/types/typechain'
import { formatEther } from '@ethersproject/units'
import { parseBytes32String } from '@ethersproject/strings'
import { arrayify } from '@ethersproject/bytes'

import BigNumber from 'bignumber.js'
import {
  fetchPublicGamesData,
  fetchGamesPlayersAddresses,
  fetchGamesPrizes,
  fetchGamesPlayersData,
} from './fetchGameData'
import { State, SerializedGame, DeserializedGame, DeserializedGameUserData } from '../types'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

function gameBaseTransformer(gameData, gamePlayers) {
  return (game, index): SerializedGame => {
    const { deployedAddress: address, gameCreationAmount } = game
    const [
      [
        {
          id,
          name,
          roundId,
          maxPlayers,
          playTimeRange,
          playerAddressesCount,
          registrationAmount,
          encodedCron,
          isInProgress,
          isPaused,
          creator,
          admin,
          creatorFee,
          treasuryFee,
        },
      ],
    ] = gameData[index]

    const [[playerAddresses]] = gamePlayers[index]

    return {
      id,
      name: parseStringOrBytes32('', name, 'Game'),
      roundId: roundId.toNumber(),
      maxPlayers: maxPlayers.toNumber(),
      playerAddressesCount: playerAddressesCount.toNumber(),
      playTimeRange: playTimeRange.toNumber(),
      registrationAmount: parseFloat(formatEther(`${registrationAmount}`)),
      gameCreationAmount: parseFloat(formatEther(`${gameCreationAmount}`)),
      creatorFee: creatorFee.toNumber(),
      treasuryFee: treasuryFee.toNumber(),
      isInProgress,
      isPaused,
      isDeleted: false,
      address,
      creator,
      admin,
      prizepool: 0,
      // TODO MANGE CRON
      encodedCron: encodedCron.toString(),
      // encodedCron: parseStringOrBytes32('', encodedCron, ''),
      playerAddresses,
      prizes: [],
    }
  }
}

function gameExtendedTransformer(gamePrizes, gamePlayersData) {
  return (game, index): SerializedGame => {
    const [[rawPrizes]] = gamePrizes[index]
    const prizes = rawPrizes.map((prize) => {
      const { amount, position } = prize
      return {
        amount,
        position,
      }
    })
    const prizepool = prizes.reduce((acc, prize) => acc + +prize.amount, 0)

    const [[{ gamePlayer: rawPlayers }]] = gamePlayersData[index]
    const players = rawPlayers.map((player) => {
      const {
        hasLost,
        hasPlayedRound,
        isSplitOk,
        playerAddress: address,
        position,
        roundCount,
        roundRangeLowerLimit,
        roundRangeUpperLimit,
      } = player
      return {
        hasLost,
        hasPlayedRound,
        isSplitOk,
        address,
        position,
        roundCount,
        roundRangeLowerLimit,
        roundRangeUpperLimit,
      }
    })

    return {
      ...game,
      prizepool: parseFloat(formatEther(`${prizepool}`)),
      prizes,
      players,
    }
  }
}

const fetchGames = async (chainId: number): Promise<SerializedGame[]> => {
  const gameFactoryContract: GameFactory = getGameFactoryV1Contract(chainId)
  const gamesToFetch: GameFactory.GameStructOutput[] = await gameFactoryContract.getDeployedGames()

  const [gameData, gamePlayers] = await Promise.all([
    fetchPublicGamesData(gamesToFetch, chainId),
    fetchGamesPlayersAddresses(gamesToFetch, chainId),
  ])

  const transformedGames = gamesToFetch.map(gameBaseTransformer(gameData, gamePlayers))

  const [gamePrizes, gamePlayersData] = await Promise.all([
    fetchGamesPrizes(transformedGames, chainId),
    fetchGamesPlayersData(transformedGames, chainId),
  ])

  return transformedGames.map(gameExtendedTransformer(gamePrizes, gamePlayersData))
}

export default fetchGames
