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
  genre: string
  year: number
  rating?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Prefill shape — mirrors GameFormValues from GameFormModal (title, year, platform)
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
}

export interface GamesState {
  games: Game[]
  search: string
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
  isCreateModalOpen: boolean
  createModalPrefill: Partial<GameFormPrefill> | undefined
}

export const defaultGamesState: GamesState = {
  games: [],
  search: '',
  platformFilter: 'all',
  statusFilter: 'all',
  isCreateModalOpen: false,
  createModalPrefill: undefined,
}
