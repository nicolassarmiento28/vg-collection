import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'

import { loadGamesState, saveGamesState } from '../../../shared/lib/storage/gamesStorage'
import type { GamesState } from '../../../shared/types/game'
import { gamesReducer, type GamesAction } from './gamesReducer'

interface GamesContextValue {
  state: GamesState
  dispatch: Dispatch<GamesAction>
}

const GamesContext = createContext<GamesContextValue | undefined>(undefined)

export function GamesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gamesReducer, undefined, loadGamesState)

  useEffect(() => {
    saveGamesState(state)
  }, [state])

  return <GamesContext.Provider value={{ state, dispatch }}>{children}</GamesContext.Provider>
}

export function useGamesContext(): GamesContextValue {
  const context = useContext(GamesContext)

  if (context === undefined) {
    throw new Error('useGamesContext must be used within a GamesProvider')
  }

  return context
}
