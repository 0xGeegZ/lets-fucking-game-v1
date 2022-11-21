export type NFT = 'ERC721' | 'ERC1155'
export type BNB = 'ERC20'

export type Actions =
  | { type: 'initialize'; currentStep: number }
  | { type: 'previous_step'; currentStep: number }
  | { type: 'next_step'; currentStep: number }
  | {
      type: 'game_name'
      currentStep: number
      name: string
    }
  | {
      type: 'game_creation'
      currentStep: number
      treasuryFee: number
      creatorFee: number
      registrationAmount: string
      freeGamePrizepoolAmount: string
      maxPlayers: number
      playTimeRange: number
      encodedCron: string
    }
  | {
      type: 'prize_configuration'
      currentStep: number
      numberPlayersAllowedToWin: number
      prizeType: NFT | BNB | 'STANDARD'
    }
  | {
      type: 'game_confirmation_and_contract_creation'
      currentStep: number
      name: string
      treasuryFee: number
      creatorFee: number
      registrationAmount: string
      maxPlayers: number
      playTimeRange: number
      encodedCron: string
      numberPlayersAllowedToWin: number
      prizeType: NFT | BNB | 'STANDARD'
    }
  | {
      type: 'success_or_error_message'
      currentStep: number
      successMessage: string | null
      errorMessage: string | null
    }

export interface State {
  isInitialized: boolean
  name: string
  currentStep: number
  treasuryFee: number
  creatorFee: number
  registrationAmount: string
  freeGamePrizepoolAmount: string
  maxPlayers: number
  playTimeRange: number
  encodedCron: string
  numberPlayersAllowedToWin: number
  prizeType: NFT | BNB | 'STANDARD'
  successMessage: string | null
  errorMessage: string | null
}

export interface ContextType extends State {
  actions: {
    previousStep: (currentStep: number) => void
    nextStep: (currentStep: number) => void
    setInitialize: (currentStep: number) => void
    setGameName: (currentStep: number, name: string) => void
    setGameCreation: (
      currentStep: number,
      treasuryFee: number,
      creatorFee: number,
      registrationAmount: string,
      freeGamePrizepoolAmount: string,
      maxPlayers: number,
      playTimeRange: number,
      encodedCron: string,
    ) => void
    setPrizeConfiguration: (
      numberPlayersAllowedToWin: number,
      prizeType: NFT | BNB | 'STANDARD',
      currentStep: number,
    ) => void
    setGameConfirmationAndContractCreation: (
      currentStep: number,
      name: string,
      treasuryFee: number,
      creatorFee: number,
      registrationAmount: string,
      freeGamePrizepoolAmount: string,
      maxPlayers: number,
      playTimeRange: number,
      encodedCron: string,
      numberPlayersAllowedToWin: number,
      prizeType: NFT | BNB | 'STANDARD',
    ) => void
    setSuccessOrErrorMessage: (successMessage: string | null, errorMessage: string | null, currentStep: number) => void
  }
}
