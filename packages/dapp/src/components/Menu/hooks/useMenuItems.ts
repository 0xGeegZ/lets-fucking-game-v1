import { useMemo } from 'react'
import { LinkStatus } from '@pancakeswap/uikit/src/widgets/Menu/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTheme } from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { useMenuItemsStatus } from './useMenuItemsStatus'
import config, { ConfigMenuItemsType } from '../config/config'

export const useMenuItems = (): ConfigMenuItemsType[] => {
  const {
    t,
    currentLanguage: { code: languageCode },
  } = useTranslation()
  const { chainId } = useActiveWeb3React()
  const { isDark } = useTheme()
  const menuItemsStatus = useMenuItemsStatus()

  const menuItems = useMemo(() => {
    return config(t, isDark, languageCode, chainId)
  }, [t, isDark, languageCode, chainId])

  return useMemo(() => {
    if (menuItemsStatus && Object.keys(menuItemsStatus).length) {
      return menuItems.map((item) => {
        const innerItems = item.items.map((innerItem) => {
          const itemStatus = menuItemsStatus[innerItem.href]
          if (itemStatus) {
            let itemMenuStatus
            if (itemStatus === 'soon') {
              itemMenuStatus = <LinkStatus>{ text: t('Soon'), color: 'warning' }
            } else if (itemStatus === 'live') {
              itemMenuStatus = <LinkStatus>{ text: t('Live'), color: 'failure' }
            } else if (itemStatus === 'vote_now') {
              itemMenuStatus = <LinkStatus>{ text: t('Vote Now'), color: 'success' }
            } else if (itemStatus === 'pot_open') {
              itemMenuStatus = <LinkStatus>{ text: t('Pot Open'), color: 'success' }
            } else {
              itemMenuStatus = <LinkStatus>{ text: t('New'), color: 'success' }
            }
            return { ...innerItem, status: itemMenuStatus }
          }
          return innerItem
        })
        return { ...item, items: innerItems }
      })
    }
    return menuItems
  }, [t, menuItems, menuItemsStatus])
}
