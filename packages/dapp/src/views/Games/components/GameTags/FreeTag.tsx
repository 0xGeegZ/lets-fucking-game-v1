import { RocketIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

interface FreeTag extends TagProps {
  // Add Object to bypass typescript warning
  style?: object
}

const FreeTag: React.FC<FreeTag> = (props) => {
  const { t } = useTranslation()
  return (
    <Tag
      variant="success"
      style={{ background: 'none' }}
      outline
      startIcon={<RocketIcon width="18px" color="success" mr="4px" />}
      {...props}
    >
      {t('Free')}
    </Tag>
  )
}

export default memo(FreeTag)
