import { memo } from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { escapeRegExp } from '../../utils'

// const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
//   color: ${({ error, theme }) => (error ? theme.colors.failure : theme.colors.text)};
//   width: 0;
//   position: relative;
//   font-weight: 500;
//   outline: none;
//   border: none;
//   flex: 1 1 auto;
//   background-color: transparent;
//   font-size: 16px;
//   text-align: ${({ align }) => align ?? 'right'};
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   padding: 0px;
//   -webkit-appearance: textfield;

//   ::-webkit-search-decoration {
//     -webkit-appearance: none;
//   }

//   [type='number'] {
//     -moz-appearance: textfield;
//   }

//   ::-webkit-outer-spin-button,
//   ::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//   }

//   ::placeholder {
//     color: ${({ theme }) => theme.colors.textSubtle};
//   }
// `

const scales = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

/**
 * Priority: Warning --> Success
 */
const getBoxShadow = ({ isSuccess = false, isWarning = false, theme }: StyledInputProps) => {
  if (isWarning) {
    return theme.shadows.warning
  }

  if (isSuccess) {
    return theme.shadows.success
  }

  return theme.shadows.inset
}

const getHeight = ({ scale = scales.MD }: StyledInputProps) => {
  switch (scale) {
    case scales.SM:
      return '32px'
    case scales.LG:
      return '48px'
    case scales.MD:
    default:
      return '40px'
  }
}

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.colors.failure : theme.colors.text)};
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  box-shadow: ${getBoxShadow};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  font-size: 16px;
  height: ${getHeight};
  outline: 0;
  padding: 0 16px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    box-shadow: none;
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  &:focus:not(:disabled) {
    box-shadow: ${({ theme, isWarning, isSuccess }) => {
      if (isWarning) {
        return theme.shadows.warning
      }

      if (isSuccess) {
        return theme.shadows.success
      }
      return theme.shadows.focus
    }};
  }
`

StyledInput.defaultProps = {
  scale: scales.MD,
  isSuccess: false,
  isWarning: false,
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  const { t } = useTranslation()

  return (
    <StyledInput
      {...rest}
      value={value}
      onChange={(event) => {
        // replace commas with periods, because we exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'))
      }}
      // universal input options
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[1-9][0-9]?$|^100$"
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={100}
      spellCheck="false"
    />
  )
})

export default Input
