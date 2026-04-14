export type Platform =
  // Sega
  | 'sega-ms'
  | 'sega-md'
  | 'sega-saturn'
  | 'sega-dc'
  // Nintendo — home
  | 'nes'
  | 'snes'
  | 'n64'
  | 'gamecube'
  | 'wii'
  | 'wiiu'
  | 'switch'
  // Nintendo — portátiles
  | 'gameboy'
  | 'gbc'
  | 'gba'
  | 'nds'
  | '3ds'
  // PlayStation — home
  | 'ps1'
  | 'ps2'
  | 'ps3'
  | 'ps4'
  | 'ps5'
  // PlayStation — portátiles
  | 'psp'
  | 'psvita'
  // Microsoft
  | 'xbox'
  | 'xbox360'
  | 'xbone'
  | 'xbsx'
  // PC
  | 'pc'
  // Commodore
  | 'c64'
  | 'amiga'
  // Otra
  | 'other'

export const PLATFORM_LABELS: Record<Platform, string> = {
  'sega-ms': 'Master System',
  'sega-md': 'Mega Drive',
  'sega-saturn': 'Saturn',
  'sega-dc': 'Dreamcast',
  nes: 'NES',
  snes: 'SNES',
  n64: 'Nintendo 64',
  gamecube: 'GameCube',
  wii: 'Wii',
  wiiu: 'Wii U',
  switch: 'Nintendo Switch',
  gameboy: 'Game Boy',
  gbc: 'Game Boy Color',
  gba: 'Game Boy Advance',
  nds: 'Nintendo DS',
  '3ds': 'Nintendo 3DS',
  ps1: 'PlayStation 1',
  ps2: 'PlayStation 2',
  ps3: 'PlayStation 3',
  ps4: 'PlayStation 4',
  ps5: 'PlayStation 5',
  psp: 'PSP',
  psvita: 'PS Vita',
  xbox: 'Xbox',
  xbox360: 'Xbox 360',
  xbone: 'Xbox One',
  xbsx: 'Xbox Series X/S',
  pc: 'PC',
  c64: 'Commodore 64',
  amiga: 'Amiga',
  other: 'Otra',
}

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
  igdbId?: number
  coverUrl?: string      // URL string (IGDB CDN or user-pasted)
  coverBase64?: string   // base64 data-URI (user file upload)
  pros?: string          // newline-separated positive points
  cons?: string          // newline-separated negative points
  createdAt: string
  updatedAt: string
}

// Prefill shape — mirrors GameFormValues from GameFormModal
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
  igdbId?: number
  coverUrl?: string
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
