import { RocketIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface RegistrationTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const RegistrationTag: React.FC<RegistrationTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag variant="warning" style={{ background: 'none' }} outline {...props}>
      {t('Registering')}
    </Tag>
  )
}

export default memo(RegistrationTag)