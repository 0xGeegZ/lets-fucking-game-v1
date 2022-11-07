import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory, GameImplementationV1Interface } from 'config/types/typechain'
import { fetchPublicGamesData } from './fetchPublicGameData'
import { State, SerializedGame, DeserializedGame, DeserializedGameUserData } from '../types'

function gameTransformer(gameResult) {
  return (game, index): SerializedGame => {
    const [
      [
        {
          creator,
          creatorFee,
          treasuryFee,
          gameImage,
          gameName,
          gameInProgress,
          contractPaused,
          maxPlayers,
          playTimeRange,
          playerAddressesCount,
          registrationAmount,
          roundId,
        },
      ],
    ] = gameResult[index]

    return {
      creator,
      creatorFee: creatorFee.toNumber(),
      treasuryFee: treasuryFee.toNumber(),
      gameImage,
      gameName,
      gameInProgress,
      contractPaused,
      maxPlayers: maxPlayers.toNumber(),
      playTimeRange: playTimeRange.toNumber(),
      playerAddressesCount: playerAddressesCount.toNumber(),
      registrationAmount: registrationAmount.toNumber(),
      roundId: roundId.toNumber(),
    }
  }
}

const fetchGames = async (chainId: number): Promise<SerializedGame[]> => {
  const gameFactoryContract: GameFactory = getGameFactoryV1Contract(chainId)
  const gamesToFetch: GameFactory.GameStructOutput[] = await gameFactoryContract.getDeployedGames()

  // TODO GUIGUI ADD other function call if needed
  const [gameResult] = await Promise.all([fetchPublicGamesData(gamesToFetch, chainId)])

  // TODO GUIGUI ADD other function called results if needed
  return gamesToFetch.map(gameTransformer(gameResult))
}

export default fetchGames
