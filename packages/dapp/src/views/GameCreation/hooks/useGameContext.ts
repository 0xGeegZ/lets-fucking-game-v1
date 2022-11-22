import { useContext } from 'react'
import { GameCreationContext } from 'views/GameCreation/contexts/GameCreationProvider'

export const useGameContext = () => {
  return useContext(GameCreationContext)
}
