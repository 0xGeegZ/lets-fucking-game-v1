import { useContext } from 'react'
import { GameCreationContext } from './GameCreationProvider'

const useGameCreation = () => {
  return useContext(GameCreationContext)
}

export default useGameCreation
