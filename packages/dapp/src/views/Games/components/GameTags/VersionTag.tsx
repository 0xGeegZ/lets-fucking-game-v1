import { ErrorIcon, Tag, TagProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'
import BigNumber from 'bignumber.js'

interface VersionTag extends TagProps {
  // Add Object to bypass typescript warning
  versionId: BigNumber
  style?: object
}

const VersionTag: React.FC<VersionTag> = ({ versionId, ...props }) => {
  const { t } = useTranslation()
  return (
    <Tag variant="textSubtle" style={{ background: 'none' }} outline {...props}>
      {t(`V${versionId.toNumber() + 1}`)}
    </Tag>
  )
}

export default memo(VersionTag)
