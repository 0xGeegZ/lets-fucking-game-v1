import { useContext } from 'react'
import { GameCreationContext } from '../contexts/GameCreationProvider'

export const useGameContext = () => {
  return useContext(GameCreationContext)
}
