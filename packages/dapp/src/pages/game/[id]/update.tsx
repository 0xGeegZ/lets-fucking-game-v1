import { SUPPORT_GAMES_TEST } from 'config/constants/supportChains'
import GameForm from 'views/GameForm'

const UpdateGamesPage = () => {
  return <GameForm />
}

UpdateGamesPage.chains = SUPPORT_GAMES_TEST

export default UpdateGamesPage
