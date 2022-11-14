import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory } from 'config/types/typechain'
// import { GameFactory } from 'config/types/typechain'
import { formatEther } from '@ethersproject/units'
import { parseBytes32String } from '@ethersproject/strings'
import { arrayify } from '@ethersproject/bytes'

import { fetchGamesPlayersData } from './fetchGamesPlayersData'
import { fetchGamesPrizes } from './fetchGamesPrizes'
import { fetchGamesPlayersAddresses } from './fetchGamesPlayersAddresses'
import { fetchPublicGamesData } from './fetchPublicGameData'
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
      registrationAmount: parseFloat(formatEther(`${+registrationAmount}`)),
      gameCreationAmount: parseFloat(formatEther(`${+gameCreationAmount}`)),
      creatorFee: creatorFee.toNumber(),
      treasuryFee: treasuryFee.toNumber(),
      isInProgress,
      isPaused,
      isDeleted: false,
      address,
      creator,
      admin,
      // TODO MANGE PRIZES
      prizepool: parseFloat(formatEther(maxPlayers.toNumber() * registrationAmount.toNumber())),
      // TODO MANGE CRON
      encodedCron: encodedCron.toString(),
      // encodedCron: parseStringOrBytes32('', encodedCron, ''),
      playerAddresses,
    }
  }
}

function gameExtendedTransformer(gamePrizes, gamePlayersData) {
  return (game, index): SerializedGame => {
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
    ] = gamePrizes[index]

    const [[playerAddresses]] = gamePlayersData[index]

    return {
      ...game,
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
  console.log('🚀 ~ file: fetchGames.ts ~ line 125 ~ fetchGames ~ gamePlayersData', gamePlayersData)
  console.log('🚀 ~ file: fetchGames.ts ~ line 125 ~ fetchGames ~ gamePrizes', gamePrizes)

  return transformedGames

  // return transformedGames.map(gameExtendedTransformer(gamePrizes, gamePlayersData))

  // // TODO GUIGUI ADD other function call if needed
  // // load other data from getPrizes(uint256 _roundId)
  // // load data from getPlayer(playerAdress)
  // const [gameResult] = await Promise.all([fetchPublicGamesData(gamesToFetch, chainId)])

  // // TODO GUIGUI ADD other function called results if needed
  // return gamesToFetch.map(gameTransformer(gameResult))
}

export default fetchGames
