import {
  defaultGamesState,
  type Game,
  type GameStatus,
  type GamesState,
  type Platform,
} from '../../types/game'

export const STORAGE_KEY = 'vg-collection:v1'

const VALID_PLATFORMS: Platform[] = [
  'sega-ms', 'sega-md', 'sega-saturn', 'sega-dc',
  'nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch',
  'gameboy', 'gbc', 'gba', 'nds', '3ds',
  'ps1', 'ps2', 'ps3', 'ps4', 'ps5',
  'psp', 'psvita',
  'xbox', 'xbox360', 'xbone', 'xbsx',
  'pc',
  'c64', 'amiga',
  'other',
]

const VALID_STATUSES: GameStatus[] = [
  'backlog',
  'playing',
  'completed',
  'paused',
  'dropped',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidGame(value: unknown): value is Game {
  if (!isRecord(value)) {
    return false
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.platform !== 'string' ||
    typeof value.status !== 'string' ||
    typeof value.genre !== 'string' ||
    typeof value.year !== 'number' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return false
  }

  if (value.id.length === 0) {
    return false
  }

  if (value.genre.length === 0 || !Number.isInteger(value.year)) {
    return false
  }

  if (!VALID_PLATFORMS.includes(value.platform as Platform)) {
    return false
  }

  if (!VALID_STATUSES.includes(value.status as GameStatus)) {
    return false
  }

  if (value.rating !== undefined && typeof value.rating !== 'number') {
    return false
  }

  if (value.notes !== undefined && typeof value.notes !== 'string') {
    return false
  }

  if (value.coverUrl !== undefined && typeof value.coverUrl !== 'string') {
    return false
  }

  if (value.coverBase64 !== undefined && typeof value.coverBase64 !== 'string') {
    return false
  }

  if (value.pros !== undefined && typeof value.pros !== 'string') {
    return false
  }

  if (value.cons !== undefined && typeof value.cons !== 'string') {
    return false
  }

  return true
}

function migrateStoredGame(value: unknown): Game | null {
  if (isValidGame(value)) {
    return value
  }

  if (!isRecord(value)) {
    return null
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.platform !== 'string' ||
    typeof value.status !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return null
  }

  if (value.id.length === 0) {
    return null
  }

  if (!VALID_PLATFORMS.includes(value.platform as Platform)) {
    return null
  }

  if (!VALID_STATUSES.includes(value.status as GameStatus)) {
    return null
  }

  if (value.rating !== undefined && typeof value.rating !== 'number') {
    return null
  }

  if (value.notes !== undefined && typeof value.notes !== 'string') {
    return null
  }

  if (value.coverUrl !== undefined && typeof value.coverUrl !== 'string') {
    return null
  }

  if (value.coverBase64 !== undefined && typeof value.coverBase64 !== 'string') {
    return null
  }

  if (value.pros !== undefined && typeof value.pros !== 'string') {
    return null
  }

  if (value.cons !== undefined && typeof value.cons !== 'string') {
    return null
  }

  if (value.genre !== undefined && (typeof value.genre !== 'string' || value.genre.length === 0)) {
    return null
  }

  if (value.year !== undefined && (typeof value.year !== 'number' || !Number.isInteger(value.year))) {
    return null
  }

  return {
    ...value,
    genre: value.genre ?? 'Sin genero',
    year: value.year ?? 2000,
  } as Game
}

function isValidGamesState(value: unknown): value is GamesState {
  if (!isRecord(value) || !Array.isArray(value.games)) {
    return false
  }

  if (typeof value.search !== 'string') {
    return false
  }

  if (value.platformFilter !== 'all' && !VALID_PLATFORMS.includes(value.platformFilter as Platform)) {
    return false
  }

  if (value.statusFilter !== 'all' && !VALID_STATUSES.includes(value.statusFilter as GameStatus)) {
    return false
  }

  return value.games.every(isValidGame)
}

export function loadGamesState(): GamesState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    return defaultGamesState
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.games)) {
      return defaultGamesState
    }

    if (typeof parsed.search !== 'string') {
      return defaultGamesState
    }

    if (parsed.platformFilter !== 'all' && !VALID_PLATFORMS.includes(parsed.platformFilter as Platform)) {
      return defaultGamesState
    }

    if (parsed.statusFilter !== 'all' && !VALID_STATUSES.includes(parsed.statusFilter as GameStatus)) {
      return defaultGamesState
    }

    const games = parsed.games.map(migrateStoredGame)
    if (games.some((game) => game === null)) {
      return defaultGamesState
    }

    const migratedState: GamesState = {
      games: games as Game[],
      search: parsed.search,
      platformFilter: parsed.platformFilter as GamesState['platformFilter'],
      statusFilter: parsed.statusFilter as GamesState['statusFilter'],
    }

    return isValidGamesState(migratedState) ? migratedState : defaultGamesState
  } catch {
    return defaultGamesState
  }
}

export function saveGamesState(state: GamesState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // no-op
  }
}
