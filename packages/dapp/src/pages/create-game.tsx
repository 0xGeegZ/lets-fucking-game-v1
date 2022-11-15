import { SUPPORT_GAMES_TEST } from 'config/constants/supportChains'
import GameCreation from '../views/GameCreation'

const CreateGamesPage = () => {
  return <GameCreation />
}

CreateGamesPage.chains = SUPPORT_GAMES_TEST

export default CreateGamesPage
