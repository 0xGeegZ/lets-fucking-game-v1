import { SUPPORT_GAMES } from 'config/constants/supportChains'
import GameCreation from '../views/GameCreation'

const CreateGamesPage = () => {
  return <GameCreation />
}

CreateGamesPage.chains = SUPPORT_GAMES

export default CreateGamesPage
