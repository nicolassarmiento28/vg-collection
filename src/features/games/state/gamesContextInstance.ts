import { createContext, type Dispatch } from 'react'

import type { GamesState } from '../../../shared/types/game'
import type { GamesAction } from './gamesReducer'

export interface GamesContextValue {
  state: GamesState
  dispatch: Dispatch<GamesAction>
}

export const GamesContext = createContext<GamesContextValue | undefined>(undefined)
