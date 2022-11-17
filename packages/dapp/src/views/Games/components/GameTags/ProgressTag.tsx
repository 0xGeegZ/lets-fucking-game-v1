import { VerifiedIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface ProgressTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const ProgressTag: React.FC<ProgressTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag
      variant="secondary"
      style={{ background: 'none' }}
      outline
      startIcon={<VerifiedIcon width="18px" color="secondary" mr="4px" />}
      {...props}
    >
      {t('In Progress')}
    </Tag>
  )
}

export default memo(ProgressTag)
