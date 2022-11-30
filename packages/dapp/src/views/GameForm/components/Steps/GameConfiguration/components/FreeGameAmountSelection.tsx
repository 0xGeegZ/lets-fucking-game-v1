import { Flex, Text, Input, CheckmarkIcon, WarningIcon } from '@pancakeswap/uikit'
import { useState } from 'react'
import styled from 'styled-components'

import { escapeRegExp } from 'utils'

import { useTranslation } from '@pancakeswap/localization'
import { useGameContext } from 'views/GameForm/hooks/useGameContext'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import Tooltip from 'views/Games/components/GameCardButtons/Tooltip'

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

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

const FreeGameAmountSelection = () => {
  const {
    game,
    registrationAmount,
    freeGamePrizepoolAmount,
    treasuryFee,
    creatorFee,
    maxPlayers,
    playTimeRange,
    encodedCron,
    currentStep,
    actions,
  } = useGameContext()

  const { t } = useTranslation()

  const { chain } = useActiveWeb3React()

  const chainSymbol = chain?.nativeCurrency?.symbol || 'BNB'

  const handleChange = (value: string) => {
    if (game && value !== game.prizepool) {
      setIsWarning(true)
    } else {
      setIsWarning(false)
    }

    actions.setGameCreation(
      currentStep,
      treasuryFee,
      creatorFee,
      registrationAmount,
      value,
      maxPlayers,
      playTimeRange,
      encodedCron,
    )
    setIsUpdated(true)
  }

  const [isWarning, setIsWarning] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  const defaultPrizepoolAmount =
    game && !Number(game.registrationAmount) && !isUpdated ? game.prizepool : freeGamePrizepoolAmount

  const defaultRegistrationAmount = game ? game.registrationAmount : registrationAmount

  return (
    <>
      {defaultRegistrationAmount && !Number(defaultRegistrationAmount) ? (
        <>
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            <Text fontSize="12px" textTransform="uppercase" color="textSubtle" fontWeight={600}>
              {t('Prizepool amount')}
            </Text>
            <Tooltip
              content={
                <>
                  {game && (
                    <Text>
                      {t(
                        'This prizepool amount will be added to existing prizepool and will be shared between number of players selected in the next step.',
                      )}
                    </Text>
                  )}
                  <Text>{t("* You'll have to send the prizepool amount during the game creation.")}</Text>
                </>
              }
            />
          </Text>
          <InputWrap>
            <Input
              value={defaultPrizepoolAmount}
              onChange={(event) => {
                // replace commas with periods, because we exclusively uses period as the decimal separator
                const nextUserInput = event.target.value.replace(/,/g, '.')

                if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
                  handleChange(nextUserInput)
                }
              }}
              // universal input options
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              // text-specific options
              type="text"
              pattern="^[1-9][0-9]?$|^100$"
              minLength={1}
              maxLength={79}
              spellCheck="false"
            />
            <Indicator>
              {!isWarning && defaultPrizepoolAmount && <CheckmarkIcon color="success" />}
              {isWarning && defaultPrizepoolAmount && <WarningIcon color="warning" />}
            </Indicator>
          </InputWrap>
          {isWarning && (
            <>
              <Text color="warning" fontSize="14px" pt="4px" mb="0px" style={{ minHeight: 'auto' }}>
                {t(
                  `Updating prizepool amount will add new amount value ${freeGamePrizepoolAmount} ${chainSymbol} to existing prizepool and share it with selected number of winners in next step.`,
                )}
              </Text>
              <Text color="warning" fontSize="14px" mb="16px" style={{ minHeight: 'auto' }}>
                {t("If you don't want to add somme winners, do not modify this field.")}
              </Text>
            </>
          )}
        </>
      ) : (
        <Text color="failure" fontSize="14px" py="4px" mb="16px" style={{ minHeight: 'auto' }} />
      )}
    </>
  )
}

export default FreeGameAmountSelection
