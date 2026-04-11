import {
  defaultGamesState,
  type Game,
  type GameStatus,
  type GamesState,
  type Platform,
} from '../../types/game'

export const STORAGE_KEY = 'vg-collection:v1'

const VALID_PLATFORMS: Platform[] = [
  'pc',
  'playstation',
  'xbox',
  'switch',
  'mobile',
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
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
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

  return true
}

function isValidGamesState(value: unknown): value is GamesState {
  if (!isRecord(value) || !Array.isArray(value.games)) {
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
    return isValidGamesState(parsed) ? parsed : defaultGamesState
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
