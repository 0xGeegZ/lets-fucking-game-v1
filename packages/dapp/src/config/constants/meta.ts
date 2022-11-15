import memoize from 'lodash/memoize'
import { ContextApi } from '@pancakeswap/localization'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: "Let's Fucking Game",
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
      '/create-game': { title: t('Create Game') },
      // TODO GUIGUI REMOVE ALL OTHER INFOS
      // '/swap': { basePath: true, title: t('Exchange') },
      // '/limit-orders': { basePath: true, title: t('Limit Orders') },
      // '/add': { basePath: true, title: t('Add Liquidity') },
      // '/remove': { basePath: true, title: t('Remove Liquidity') },
      // '/liquidity': { title: t('Liquidity') },
      // '/find': { title: t('Import Pool') },
      // '/competition': { title: t('Trading Battle') },
      // '/prediction': { title: t('Prediction') },
      // '/prediction/leaderboard': { title: t('Leaderboard') },
      // '/farms': { title: t('Farms') },
      // '/farms/auction': { title: t('Farm Auctions') },
      // '/pools': { title: t('Pools') },
      // '/lottery': { title: t('Lottery') },
      // '/ifo': { title: t('Initial Farm Offering') },
      // '/teams': { basePath: true, title: t('Leaderboard') },
      // '/voting': { basePath: true, title: t('Voting') },
      // '/voting/proposal': { title: t('Proposals') },
      // '/voting/proposal/create': { title: t('Make a Proposal') },
      // '/info': { title: t('Overview'), description: 'View statistics for Lets Fucking Game exchanges.' },
      // '/info/pools': { title: t('Pools'), description: 'View statistics for Lets Fucking Game exchanges.' },
      // '/info/tokens': { title: t('Tokens'), description: 'View statistics for Lets Fucking Game exchanges.' },
      // '/nfts/collections': { basePath: true, title: t('Collections') },
      // '/nfts/activity': { title: t('Activity') },
      // '/profile': { basePath: true, title: t('Profile') },
      // '/pancake-squad': { basePath: true, title: t('Pancake Squad') },
      // '/pottery': { basePath: true, title: t('Pottery') },
    },
    defaultTitleSuffix: t("Let's Fucking Game"),
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
