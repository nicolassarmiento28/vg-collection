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

  it('falls back to default state when stored game is missing genre', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-2',
            title: 'Invalid entry',
            platform: 'pc',
            status: 'backlog',
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
