import { useContext } from 'react'
import { GameCreationContext } from 'views/GameForm/contexts/GameCreationProvider'

export const useGameContext = () => {
  return useContext(GameCreationContext)
}
