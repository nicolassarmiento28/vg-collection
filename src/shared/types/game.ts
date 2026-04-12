import type { Platform, PlatformFamily } from '../constants/platforms'

export type { Platform, PlatformFamily } from '../constants/platforms'

export type GameStatus = 'backlog' | 'playing' | 'completed' | 'paused' | 'dropped'

export interface GameIgdbMetadata {
  id: number
  slug: string
  name?: string
  coverUrl?: string
  summary?: string
  firstReleaseDate?: string
  genres?: string[]
}

export interface Game {
  id: string
  title: string
  platformFamily?: PlatformFamily
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdb?: GameIgdbMetadata
  createdAt: string
  updatedAt: string
}

export interface GamesState {
  games: Game[]
  search: string
  platformFamilyFilter: PlatformFamily | 'all'
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
}

export const defaultGamesState: GamesState = {
  games: [],
  search: '',
  platformFamilyFilter: 'all',
  platformFilter: 'all',
  statusFilter: 'all',
}
