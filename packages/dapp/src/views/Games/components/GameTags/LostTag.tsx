import { ErrorIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface LostTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const LostTag: React.FC<LostTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag
      variant="failure"
      style={{ background: 'none' }}
      outline
      startIcon={<ErrorIcon width="18px" color="secondary" mr="4px" />}
      {...props}
    >
      {t('Lost')}
    </Tag>
  )
}

export default memo(LostTag)
