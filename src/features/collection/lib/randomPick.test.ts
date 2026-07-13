import { describe, expect, it } from 'vitest'
import type { Game } from '../../../shared/types/game'
import { pickRandomBacklogGame } from './randomPick'

function makeGame(overrides: Partial<Game>): Game {
  return {
    id: overrides.id ?? 'g-1',
    title: overrides.title ?? 'Test Game',
    platform: 'pc',
    status: overrides.status ?? 'backlog',
    genre: 'RPG',
    year: 2020,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('pickRandomBacklogGame', () => {
  it('returns null when there are no backlog games', () => {
    const games = [makeGame({ id: '1', status: 'completed' }), makeGame({ id: '2', status: 'playing' })]
    expect(pickRandomBacklogGame(games)).toBeNull()
  })

  it('only picks among backlog games, ignoring other statuses', () => {
    const games = [
      makeGame({ id: '1', status: 'completed' }),
      makeGame({ id: '2', status: 'backlog' }),
      makeGame({ id: '3', status: 'playing' }),
    ]
    // random() always returns 0 -> picks index 0 of the *filtered* backlog array
    const result = pickRandomBacklogGame(games, () => 0)
    expect(result?.id).toBe('2')
  })

  it('uses the injected random function to select the index', () => {
    const games = [
      makeGame({ id: '1', status: 'backlog' }),
      makeGame({ id: '2', status: 'backlog' }),
      makeGame({ id: '3', status: 'backlog' }),
    ]
    expect(pickRandomBacklogGame(games, () => 0)?.id).toBe('1')
    expect(pickRandomBacklogGame(games, () => 0.5)?.id).toBe('2')
    expect(pickRandomBacklogGame(games, () => 0.99)?.id).toBe('3')
  })
})
