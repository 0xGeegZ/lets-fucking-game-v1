import { FC } from 'react'
import Games, { GamesContext } from './Games'

export const GamesPageLayout: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  return <Games>{children}</Games>
}

export { GamesContext }
