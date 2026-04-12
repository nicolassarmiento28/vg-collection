import {
  defaultGamesState,
  type Game,
  type GameIgdbMetadata,
  type GameStatus,
  type GamesState,
  type Platform,
} from '../../types/game'
import { type PlatformFamily } from '../../constants/platforms'

export const STORAGE_KEY = 'vg-collection:v1'

const VALID_PLATFORMS: Platform[] = [
  'nes',
  'snes',
  'nintendo-64',
  'gamecube',
  'wii',
  'wii-u',
  'switch',
  'switch-2',
  'game-boy',
  'game-boy-color',
  'game-boy-advance',
  'nintendo-ds',
  'nintendo-3ds',
  'ps1',
  'ps2',
  'ps3',
  'ps4',
  'ps5',
  'psp',
  'ps-vita',
  'xbox',
  'xbox-360',
  'xbox-one',
  'xbox-series-xs',
  'master-system',
  'mega-drive-genesis',
  'sega-cd',
  'sega-32x',
  'saturn',
  'dreamcast',
  'game-gear',
  'atari-2600',
  'atari-5200',
  'atari-7800',
  'atari-lynx',
  'atari-jaguar',
  'commodore-64',
  'amiga',
  'pc',
  'playstation',
  'mobile',
  'other',
]

const VALID_PLATFORM_FAMILIES: PlatformFamily[] = [
  'nintendo',
  'playstation',
  'microsoft',
  'sega',
  'atari',
  'commodore',
  'pc',
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

function isValidIgdbMetadata(value: unknown): value is GameIgdbMetadata {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.id !== 'number' || !Number.isInteger(value.id) || value.id <= 0) {
    return false
  }

  if (typeof value.slug !== 'string' || value.slug.length === 0) {
    return false
  }

  if (value.name !== undefined && typeof value.name !== 'string') {
    return false
  }

  if (value.coverUrl !== undefined && typeof value.coverUrl !== 'string') {
    return false
  }

  if (value.summary !== undefined && typeof value.summary !== 'string') {
    return false
  }

  if (value.firstReleaseDate !== undefined && typeof value.firstReleaseDate !== 'string') {
    return false
  }

  if (
    value.genres !== undefined &&
    (!Array.isArray(value.genres) || value.genres.some((genre) => typeof genre !== 'string'))
  ) {
    return false
  }

  return true
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

  if (
    value.platformFamily !== undefined &&
    !VALID_PLATFORM_FAMILIES.includes(value.platformFamily as PlatformFamily)
  ) {
    return false
  }

  if (value.igdb !== undefined && !isValidIgdbMetadata(value.igdb)) {
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

  if (
    value.platformFamily !== undefined &&
    !VALID_PLATFORM_FAMILIES.includes(value.platformFamily as PlatformFamily)
  ) {
    return null
  }

  if (value.igdb !== undefined && !isValidIgdbMetadata(value.igdb)) {
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
