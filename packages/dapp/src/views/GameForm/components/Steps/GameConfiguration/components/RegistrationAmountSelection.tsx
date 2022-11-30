import { Text, Input } from '@pancakeswap/uikit'

import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import Select, { OptionProps } from 'components/Select/Select'
import { parseEther } from '@ethersproject/units'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const RegistrationAmountSelection = () => {
  const {
    gameConfig,
    game,
    treasuryFee,
    creatorFee,
    freeGamePrizepoolAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    currentStep,
    actions,
  } = useGameContext()

  const handleRegistrationAmountOptionChange = (option: OptionProps) => {
    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      option.value,
      freeGamePrizepoolAmount,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
  }

  const { chain } = useActiveWeb3React()

  const { AUTHORIZED_REGISTRATION_AMOUNTS, REGISTRATION_AMOUNT_DEFAULT } = gameConfig

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const authorizedAmounts = AUTHORIZED_REGISTRATION_AMOUNTS.map((amount) => {
    return {
      label: `${amount} ${chainSymbol}`,
      value: parseEther(`${amount}`).toString(),
    }
  })

  const defaultIndex = authorizedAmounts.findIndex((amount) => +amount.value === +REGISTRATION_AMOUNT_DEFAULT) + 1

  const defaultOptionIndex = game
    ? authorizedAmounts.findIndex((amount) => {
        return amount.value === parseEther(`${game.registrationAmount}`).toString()
      })
    : defaultIndex

  return (
    <>
      {authorizedAmounts && (
        <>
          <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
            Registration amount
          </Text>
          {game ? (
            <Input disabled value={game.registrationAmount} />
          ) : (
            <Select
              defaultOptionIndex={defaultOptionIndex}
              options={authorizedAmounts}
              onOptionChange={handleRegistrationAmountOptionChange}
            />
          )}
        </>
      )}
    </>
  )
}

export default RegistrationAmountSelection
