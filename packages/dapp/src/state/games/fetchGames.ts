import { getGameFactoryV1Contract } from 'utils/contractHelpers'
import { GameFactory } from 'config/types/typechain'

const fetchGames = async (chainId: number): Promise<GameFactory.GameStructOutput[]> => {
  const gameFactoryContract: GameFactory = getGameFactoryV1Contract(chainId)
  return gameFactoryContract.getDeployedGames()
}

export default fetchGames
