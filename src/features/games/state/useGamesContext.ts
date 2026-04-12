import { useContext } from 'react'

import { GamesContext, type GamesContextValue } from './gamesContextInstance'

export function useGamesContext(): GamesContextValue {
  const context = useContext(GamesContext)

  if (context === undefined) {
    throw new Error('useGamesContext must be used within a GamesProvider')
  }

  return context
}
