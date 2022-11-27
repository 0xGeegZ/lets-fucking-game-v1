import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory } from 'config/types/typechain'

import { gameBaseTransformer, gameFullTransformer } from './transformers'

import {
  fetchPublicGamesData,
  fetchGamesTreasuryAmounts,
  fetchGamesCreatorAmounts,
  fetchGamesPlayersAddresses,
  fetchGamesPrizes,
  fetchGamesPlayersData,
} from './fetchGameData'
import { State, SerializedGame, DeserializedGame, DeserializedGameUserData } from '../types'

const fetchGamesFull = async (chainId: number): Promise<SerializedGame[]> => {
  const gameFactoryContract: GameFactory = getGameFactoryV1Contract(chainId)
  const gamesToFetch: GameFactory.GameStructOutput[] = await gameFactoryContract.getDeployedGames()

  const [gameData, gamePlayers, gameCreatorAmounts, gameTreasuryAmounts] = await Promise.all([
    fetchPublicGamesData(gamesToFetch, chainId),
    fetchGamesPlayersAddresses(gamesToFetch, chainId),
    fetchGamesCreatorAmounts(gamesToFetch, chainId),
    fetchGamesTreasuryAmounts(gamesToFetch, chainId),
  ])
  const transformedGames = gamesToFetch.map(
    gameBaseTransformer(gameData, gamePlayers, gameCreatorAmounts, gameTreasuryAmounts),
  )

  // TODO GUIGUI HANDLE gamePlayersData
  const [gamePrizes /* , gamePlayersData */] = await Promise.all([
    fetchGamesPrizes(transformedGames, chainId),
    // fetchGamesPlayersData(transformedGames, chainId),
  ])
  const completeGames = transformedGames.map(gameFullTransformer(gamePrizes /* , gamePlayersData */))
  return completeGames
}

export default fetchGamesFull
