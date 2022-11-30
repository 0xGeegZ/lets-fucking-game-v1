import { ArrowBackIcon, Button, ButtonProps } from '@pancakeswap/uikit'

const BackStepButton: React.FC<React.PropsWithChildren<ButtonProps>> = (props) => {
  return <Button startIcon={<ArrowBackIcon color="currentColor" />} {...props} />
}

export default BackStepButton
