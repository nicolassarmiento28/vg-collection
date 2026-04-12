import { useEffect, useReducer, type ReactNode } from 'react'

import { loadGamesState, saveGamesState } from '../../../shared/lib/storage/gamesStorage'
import { GamesContext } from './gamesContextInstance'
import { gamesReducer } from './gamesReducer'

export function GamesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gamesReducer, undefined, loadGamesState)

  useEffect(() => {
    saveGamesState(state)
  }, [state])

  return <GamesContext.Provider value={{ state, dispatch }}>{children}</GamesContext.Provider>
}
