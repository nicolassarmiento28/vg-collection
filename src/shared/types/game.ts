export type Platform =
  | 'pc'
  | 'playstation'
  | 'xbox'
  | 'switch'
  | 'mobile'
  | 'other'

export type GameStatus = 'backlog' | 'playing' | 'completed' | 'paused' | 'dropped'

export interface Game {
  id: string
  title: string
  platform: Platform
  status: GameStatus
  rating?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface GamesState {
  games: Game[]
}

export const defaultGamesState: GamesState = {
  games: [],
}
