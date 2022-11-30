import memoize from 'lodash/memoize'
import { ContextApi } from '@pancakeswap/localization'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: "Let's F*#@$* Game",
  description:
    'Let\'s Fucking Game allows you to create "one button games" and offer them to your twitter community in order to provide them with a fun way to engage with your content. Once the game starts. players have to log in everyday during a random time slot. If you forget, you lose. The last players share the prizes according to the prizepool distribution.',
  image: 'https://avatars.githubusercontent.com/u/115870339?s=200&v=4',
}

interface PathList {
  paths: { [path: string]: { title: string; basePath?: boolean; description?: string } }
  defaultTitleSuffix: string
}

const getPathList = (t: ContextApi['t']): PathList => {
  return {
    paths: {
      '/': { title: t('Home') },
      '/games': { title: t('Games') },
      '/game': { title: t('Game') },
      '/game/:id/update': { title: t('Update Game') },
      '/game/create': { title: t('Create Game') },
    },
    defaultTitleSuffix: t("Let's F*#@$* Game"),
  }
}

export const getCustomMeta = memoize(
  (path: string, t: ContextApi['t'], _: string): PageMeta => {
    const pathList = getPathList(t)
    const pathMetadata =
      pathList.paths[path] ??
      pathList.paths[Object.entries(pathList.paths).find(([url, data]) => data.basePath && path.startsWith(url))?.[0]]

    if (pathMetadata) {
      return {
        title: `${pathMetadata.title} | ${t(pathList.defaultTitleSuffix)}`,
        ...(pathMetadata.description && { description: pathMetadata.description }),
      }
    }
    return null
  },
  (path, t, locale) => `${path}#${locale}`,
)
