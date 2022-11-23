import { RocketIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface PausedTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const PausedTag: React.FC<PausedTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag variant="failure" style={{ background: 'none' }} outline {...props}>
      {t('Paused')}
    </Tag>
  )
}

export default memo(PausedTag)
