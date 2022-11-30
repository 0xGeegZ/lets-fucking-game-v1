import { Flex, Text, Input, CheckmarkIcon, WarningIcon } from '@pancakeswap/uikit'
import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'

import { useGameContext } from 'views/GameForm/hooks/useGameContext'

const InputWrap = styled.div`
  position: relative;
`

const Indicator = styled(Flex)`
  align-items: center;
  height: 24px;
  justify-content: center;
  margin-top: -12px;
  position: absolute;
  right: 16px;
  top: 50%;
  width: 24px;
`

const MaximumPlayersSelection = () => {
  const {
    gameConfig,
    game,
    treasuryFee,
    creatorFee,
    registrationAmount,
    freeGamePrizepoolAmount,
    maxPlayers,
    playTimeRange,
    encodedCron,
    currentStep,
    actions,
  } = useGameContext()

  const [isValid, setIsValid] = useState(true)
  const [message, setMessage] = useState('')
  const [isUpdated, setIsUpdated] = useState(false)

  const { PLAYERS_MIN_LENGTH, PLAYERS_MAX_LENGTH } = gameConfig

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const errorMessage = 'Number of players should be between 2 and 100.'

    if (Number(value) < PLAYERS_MIN_LENGTH || Number(value) > PLAYERS_MAX_LENGTH) {
      setIsValid(false)
      setMessage(errorMessage)
    } else {
      setIsValid(true)
      setMessage('')
    }

    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      freeGamePrizepoolAmount,
      Number(value),
      playTimeRange,
      encodedCron,
    )
    setIsUpdated(true)
  }

  const defaultMaxPlayers = game && !isUpdated ? game.maxPlayers : maxPlayers

  return (
    <>
      <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
        Number of players
      </Text>
      <InputWrap>
        <Input
          onChange={handleChange}
          isWarning={defaultMaxPlayers && !isValid}
          isSuccess={defaultMaxPlayers && isValid}
          pattern="^[1-9][0-9]?$|^100$"
          min="1"
          max="100"
          value={defaultMaxPlayers}
        />
        <Indicator>
          {isValid && defaultMaxPlayers && <CheckmarkIcon color="success" />}
          {!isValid && defaultMaxPlayers && <WarningIcon color="failure" />}
        </Indicator>
      </InputWrap>
      <Text color="failure" fontSize="14px" py="4px" mb="16px" style={{ minHeight: 'auto' }}>
        {message}
      </Text>
    </>
  )
}

export default MaximumPlayersSelection
