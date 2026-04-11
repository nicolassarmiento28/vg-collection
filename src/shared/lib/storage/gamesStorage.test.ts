import { afterEach, describe, expect, it, vi } from 'vitest'

import { defaultGamesState } from '../../types/game'
import { loadGamesState, saveGamesState, STORAGE_KEY } from './gamesStorage'

describe('gamesStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('returns default state when key is missing', () => {
    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('loads valid JSON state', () => {
    const state = {
      games: [
        {
          id: 'g-1',
          title: 'Metroid Prime',
          platform: 'switch',
          status: 'backlog',
          rating: 9,
          notes: 'Replay before 4',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    expect(loadGamesState()).toEqual(state)
  })

  it('falls back to default state on invalid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{invalid')

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('does not throw when save fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failure')
    })

    expect(() => saveGamesState(defaultGamesState)).not.toThrow()
  })
})
