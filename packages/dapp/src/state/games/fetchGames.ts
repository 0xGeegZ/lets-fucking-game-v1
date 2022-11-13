import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory } from 'config/types/typechain'
// import { GameFactory } from 'config/types/typechain'
import { formatEther } from '@ethersproject/units'
import { parseBytes32String } from '@ethersproject/strings'
import { arrayify } from '@ethersproject/bytes'
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

function gameTransformer(gameResult) {
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
    ] = gameResult[index]

    return {
      id,
      name: parseStringOrBytes32('', name, 'Game'),
      roundId: roundId.toNumber(),
      maxPlayers: maxPlayers.toNumber(),
      playerAddressesCount: playerAddressesCount.toNumber(),
      playTimeRange: playTimeRange.toNumber(),
      registrationAmount: registrationAmount.toNumber(),
      gameCreationAmount,
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
    }
  }
}

const fetchGames = async (chainId: number): Promise<SerializedGame[]> => {
  const gameFactoryContract: GameFactory = getGameFactoryV1Contract(chainId)
  const gamesToFetch: GameFactory.GameStructOutput[] = await gameFactoryContract.getDeployedGames()
  // console.log('🚀 ~ file: fetchGames.ts ~ line 47 ~ fetchGames ~ gamesToFetch', gamesToFetch)

  // TODO GUIGUI ADD other function call if needed
  // load other data from getPrizes(uint256 _roundId)
  // load data from getPlayer(playerAdress)
  const [gameResult] = await Promise.all([fetchPublicGamesData(gamesToFetch, chainId)])

  // TODO GUIGUI ADD other function called results if needed
  return gamesToFetch.map(gameTransformer(gameResult))
}

export default fetchGames
