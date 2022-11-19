import { VerifiedIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface StartingTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const StartingTag: React.FC<StartingTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag variant="textSubtle" style={{ background: 'none' }} outline {...props}>
      {t('Starting')}
    </Tag>
  )
}

export default memo(StartingTag)
