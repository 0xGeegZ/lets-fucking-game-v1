import { createContext, useEffect, useMemo, useReducer } from 'react'

import { useWeb3React } from '@pancakeswap/wagmi'
import { parseEther } from '@ethersproject/units'
import { TREASURY_FEE_DEFAULT, CREATOR_FEE_DEFAULT } from '../config'
import { Actions, BNB, ContextType, NFT, State } from './types'

const initialState: State = {
  isInitialized: false,
  currentStep: 0,
  treasuryFee: TREASURY_FEE_DEFAULT,
  creatorFee: CREATOR_FEE_DEFAULT,
  registrationAmount: parseEther(`0.05`).toString(),
  maxPlayers: 5,
  playTimeRange: 2,
  encodedCron: '0 18 * * *',
  numberPlayersAllowedToWin: 2,
  prizeType: 'STANDARD',
  successMessage: null,
  errorMessage: null,
}

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case 'previous_step':
      return {
        ...state,
        currentStep: state.currentStep - 1,
      }
    case 'next_step':
      return {
        ...state,
        currentStep: state.currentStep + 1,
      }
    case 'initialize':
      return {
        ...state,
        isInitialized: true,
        currentStep: action.currentStep,
      }
    case 'game_creation':
      return {
        ...state,
        isInitialized: true,
        currentStep: state.currentStep,
        treasuryFee: action.treasuryFee,
        creatorFee: action.creatorFee,
        registrationAmount: action.registrationAmount,
        maxPlayers: action.maxPlayers,
        playTimeRange: action.playTimeRange,
        encodedCron: action.encodedCron,
      }
    case 'prize_configuration':
      return {
        ...state,
        numberPlayersAllowedToWin: action.numberPlayersAllowedToWin,
        prizeType: action.prizeType,
        currentStep: state.currentStep,
      }
    case 'game_confirmation_and_contract_creation':
      return {
        ...state,
        currentStep: state.currentStep,
      }

    case 'success_or_error_message':
      return {
        successMessage: action.successMessage,
        errorMessage: action.errorMessage,
        currentStep: state.currentStep,
        ...state,
      }
    default:
      return state
  }
}

export const GameCreationContext = createContext<ContextType>(null)

const GameCreationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { account } = useWeb3React()

  // Initial checks
  useEffect(() => {
    let isSubscribed = true

    const fetchData = async () => {
      // TODO LOAD INITIAL DATA (if needed)

      dispatch({ type: 'initialize', currentStep: 0 })

      // When changing wallets quickly unmounting before the hasClaim finished causes a React error
      if (isSubscribed) {
        dispatch({ type: 'initialize', currentStep: 0 })
      }
    }

    if (account) {
      fetchData()
    }

    return () => {
      isSubscribed = false
    }
  }, [account, dispatch])

  const actions: ContextType['actions'] = useMemo(
    () => ({
      previousStep: (currentStep: number) => dispatch({ type: 'previous_step', currentStep: currentStep - 1 }),
      nextStep: (currentStep: number) => dispatch({ type: 'next_step', currentStep: currentStep + 1 }),
      setInitialize: (currentStep: number) => dispatch({ type: 'initialize', currentStep }),
      setGameCreation: (
        currentStep: number,
        treasuryFee: number,
        creatorFee: number,
        registrationAmount: string,
        maxPlayers: number,
        playTimeRange: number,
        encodedCron: string,
      ) =>
        dispatch({
          type: 'game_creation',
          currentStep,
          treasuryFee,
          creatorFee,
          registrationAmount,
          maxPlayers,
          playTimeRange,
          encodedCron,
        }),
      setPrizeConfiguration: (
        numberPlayersAllowedToWin: number,
        prizeType: NFT | BNB | 'STANDARD',
        currentStep: number,
      ) =>
        dispatch({
          type: 'prize_configuration',
          currentStep,
          numberPlayersAllowedToWin,
          prizeType,
        }),
      setGameConfirmationAndContractCreation: (currentStep: number) =>
        dispatch({
          type: 'game_confirmation_and_contract_creation',
          currentStep,
          ...state,
        }),
      setSuccessOrErrorMessage: (successMessage: string | null, errorMessage: string | null, currentStep: number) =>
        dispatch({
          type: 'success_or_error_message',
          currentStep,
          successMessage,
          errorMessage,
        }),
    }),
    [state],
  )

  return <GameCreationContext.Provider value={{ ...state, actions }}>{children}</GameCreationContext.Provider>
}

export default GameCreationProvider
