import { SUPPORT_GAMES_TEST } from 'config/constants/supportChains'
import GameForm from 'views/GameForm'

const CreateGamePage = () => {
  return <GameForm />
}

CreateGamePage.chains = SUPPORT_GAMES_TEST

export default CreateGamePage
