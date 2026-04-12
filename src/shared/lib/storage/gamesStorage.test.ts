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

  it('keeps legacy platform values from old versions without data loss', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'legacy-ps1',
            title: 'Legacy PS1 title',
            platform: 'ps1',
            status: 'completed',
            genre: 'Action',
            year: 1998,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState().games[0]?.platform).toBe('ps1')
  })

  it('migrates legacy game preserving IGDB metadata', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'legacy-igdb',
            title: 'Legacy IGDB game',
            platform: 'switch',
            status: 'backlog',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
            igdb: {
              id: 1020,
              slug: 'legacy-igdb-game',
              genres: ['RPG'],
            },
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    const loadedGame = loadGamesState().games[0]
    expect(loadedGame?.igdb?.id).toBe(1020)
    expect(loadedGame?.igdb?.slug).toBe('legacy-igdb-game')
  })

  it('falls back to default state when IGDB metadata has invalid shape', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'legacy-igdb-invalid',
            title: 'Broken IGDB game',
            platform: 'switch',
            status: 'backlog',
            genre: 'Adventure',
            year: 2020,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
            igdb: {
              id: 'bad-id',
              slug: 'broken-igdb-game',
            },
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )

    expect(loadGamesState()).toEqual(defaultGamesState)
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
})
