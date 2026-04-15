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
          genre: 'FPS',
          year: 2002,
          rating: 9,
          notes: 'Replay before 4',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: 'metroid',
      platformFilter: 'switch',
      statusFilter: 'all',
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    expect(loadGamesState()).toEqual(state)
  })

  it('falls back to default state when stored search is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [],
        search: 42,
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when required filters are missing', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [],
        search: '',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when platform filter is invalid', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [],
        search: '',
        platformFilter: 'steamdeck',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when status filter is invalid', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [],
        search: '',
        platformFilter: 'all',
        statusFilter: 'wishlist',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state on invalid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{invalid')

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when stored game has empty id', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: '',
            title: 'Invalid entry',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2010,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('migrates legacy game when genre and year are missing', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-2',
            title: 'Legacy entry',
            platform: 'pc',
            status: 'backlog',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual({
      games: [
        {
          id: 'g-2',
          title: 'Legacy entry',
          platform: 'pc',
          status: 'backlog',
          genre: 'Sin genero',
          year: 2000,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: '',
      platformFilter: 'all',
      statusFilter: 'all',
    })
  })

  it('falls back to default state when stored game has invalid year', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-3',
            title: 'Invalid entry',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: '2010',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('does not throw when save fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failure')
    })

    expect(() => saveGamesState(defaultGamesState)).not.toThrow()
  })

  it('loads game with all four new optional fields', () => {
    const state = {
      games: [
        {
          id: 'g-new',
          title: 'Super Mario World',
          platform: 'snes',
          status: 'completed',
          genre: 'Platform',
          year: 1990,
          coverUrl: 'https://example.com/cover.jpg',
          coverBase64: 'data:image/png;base64,abc',
          pros: 'Great controls\nBeautiful levels',
          cons: 'Too easy',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: '',
      platformFilter: 'all',
      statusFilter: 'all',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    expect(loadGamesState()).toEqual(state)
  })

  it('loads game without new optional fields (they remain undefined)', () => {
    const stored = {
      games: [
        {
          id: 'g-old',
          title: 'Tetris',
          platform: 'gameboy',
          status: 'completed',
          genre: 'Puzzle',
          year: 1989,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: '',
      platformFilter: 'all',
      statusFilter: 'all',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const result = loadGamesState()
    const loadedGame = result.games[0]
    expect(loadedGame).toBeDefined()
    if (loadedGame === undefined) {
      throw new Error('Expected one migrated game in storage state')
    }
    expect(loadedGame.coverUrl).toBeUndefined()
    expect(loadedGame.coverBase64).toBeUndefined()
    expect(loadedGame.pros).toBeUndefined()
    expect(loadedGame.cons).toBeUndefined()
  })

  it('falls back to default state when coverUrl field is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-bad2',
            title: 'Bad Game',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2020,
            coverUrl: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )
    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when pros field is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-bad',
            title: 'Bad Game',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2020,
            pros: 42,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )
    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when cons field is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-bad3',
            title: 'Bad Game',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2020,
            cons: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )
    expect(loadGamesState()).toEqual(defaultGamesState)
  })

  it('falls back to default state when coverBase64 field is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-bad4',
            title: 'Bad Game',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2020,
            coverBase64: 123,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )
    expect(loadGamesState()).toEqual(defaultGamesState)
  })
})
