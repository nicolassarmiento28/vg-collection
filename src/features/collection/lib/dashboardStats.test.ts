import { describe, expect, it } from 'vitest'
import type { Game } from '../../../shared/types/game'
import { computeCompletionStats, countByGenre, countByPlatform, countByStatus, countByYear } from './dashboardStats'

function makeGame(overrides: Partial<Game>): Game {
  return {
    id: overrides.id ?? 'g-1',
    title: overrides.title ?? 'Test Game',
    platform: overrides.platform ?? 'pc',
    status: overrides.status ?? 'backlog',
    genre: overrides.genre ?? 'RPG',
    year: overrides.year ?? 2020,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('countByPlatform', () => {
  it('groups by platform label and sorts descending by count', () => {
    const games = [
      makeGame({ id: '1', platform: 'ps5' }),
      makeGame({ id: '2', platform: 'ps5' }),
      makeGame({ id: '3', platform: 'switch' }),
    ]
    expect(countByPlatform(games)).toEqual([
      { label: 'PlayStation 5', count: 2 },
      { label: 'Nintendo Switch', count: 1 },
    ])
  })
})

describe('countByGenre', () => {
  it('groups by genre, treating blank genre as "Sin género"', () => {
    const games = [
      makeGame({ id: '1', genre: 'RPG' }),
      makeGame({ id: '2', genre: '  ' }),
      makeGame({ id: '3', genre: 'RPG' }),
    ]
    expect(countByGenre(games)).toEqual([
      { label: 'RPG', count: 2 },
      { label: 'Sin género', count: 1 },
    ])
  })
})

describe('countByYear', () => {
  it('groups by year and sorts ascending by year', () => {
    const games = [
      makeGame({ id: '1', year: 2021 }),
      makeGame({ id: '2', year: 1998 }),
      makeGame({ id: '3', year: 2021 }),
    ]
    expect(countByYear(games)).toEqual([
      { label: '1998', count: 1 },
      { label: '2021', count: 2 },
    ])
  })
})

describe('computeCompletionStats', () => {
  it('computes completed count and rounded percentage', () => {
    const games = [
      makeGame({ id: '1', status: 'completed' }),
      makeGame({ id: '2', status: 'completed' }),
      makeGame({ id: '3', status: 'backlog' }),
    ]
    expect(computeCompletionStats(games)).toEqual({ completed: 2, total: 3, percentCompleted: 67 })
  })

  it('returns 0% for an empty collection without dividing by zero', () => {
    expect(computeCompletionStats([])).toEqual({ completed: 0, total: 0, percentCompleted: 0 })
  })

  it('only counts status === "completed", not other non-backlog statuses', () => {
    const games = [
      makeGame({ id: '1', status: 'playing' }),
      makeGame({ id: '2', status: 'paused' }),
      makeGame({ id: '3', status: 'dropped' }),
    ]
    expect(computeCompletionStats(games)).toEqual({ completed: 0, total: 3, percentCompleted: 0 })
  })
})

describe('countByStatus', () => {
  it('breaks down by every status present, in a fixed order, omitting zero-count statuses', () => {
    const games = [
      makeGame({ id: '1', status: 'backlog' }),
      makeGame({ id: '2', status: 'completed' }),
      makeGame({ id: '3', status: 'completed' }),
      makeGame({ id: '4', status: 'playing' }),
    ]
    expect(countByStatus(games)).toEqual([
      { status: 'completed', label: 'Completado', count: 2 },
      { status: 'playing', label: 'Jugando', count: 1 },
      { status: 'backlog', label: 'Backlog', count: 1 },
    ])
  })

  it('returns an empty array for an empty collection', () => {
    expect(countByStatus([])).toEqual([])
  })
})
