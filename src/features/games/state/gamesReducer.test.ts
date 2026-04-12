import { describe, expect, it } from 'vitest'

import { defaultGamesState, type Game } from '../../../shared/types/game'
import { gamesReducer, type GamesAction } from './gamesReducer'

const baseGame: Game = {
  id: 'g-1',
  title: 'Halo Infinite',
  platform: 'xbox',
  status: 'backlog',
  genre: 'Shooter',
  year: 2021,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function reduce(action: GamesAction) {
  return gamesReducer(defaultGamesState, action)
}

describe('gamesReducer', () => {
  it('adds a game to the collection', () => {
    const nextState = reduce({ type: 'addGame', payload: baseGame })

    expect(nextState.games).toEqual([baseGame])
  })

  it('edits a game by id and updates provided fields only', () => {
    const initialState = {
      ...defaultGamesState,
      games: [baseGame],
    }

    const nextState = gamesReducer(initialState, {
      type: 'editGame',
      payload: {
        id: 'g-1',
        updates: {
          title: 'Halo 3',
          platform: 'pc',
          genre: 'FPS',
          year: 2007,
          rating: 10,
        },
      },
    })

    expect(nextState.games).toEqual([
      {
        ...baseGame,
        title: 'Halo 3',
        platform: 'pc',
        genre: 'FPS',
        year: 2007,
        rating: 10,
      },
    ])
  })

  it('marks a game as completed', () => {
    const initialState = {
      ...defaultGamesState,
      games: [baseGame],
    }

    const nextState = gamesReducer(initialState, {
      type: 'markGameCompleted',
      payload: { id: 'g-1' },
    })

    expect(nextState.games[0]?.status).toBe('completed')
  })

  it('sets search and filter values', () => {
    let nextState = reduce({ type: 'setSearch', payload: 'halo' })
    nextState = gamesReducer(nextState, { type: 'setPlatformFamilyFilter', payload: 'microsoft' })
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbox' })
    nextState = gamesReducer(nextState, { type: 'setStatusFilter', payload: 'playing' })

    expect(nextState.search).toBe('halo')
    expect(nextState.platformFamilyFilter).toBe('microsoft')
    expect(nextState.platformFilter).toBe('xbox')
    expect(nextState.statusFilter).toBe('playing')
  })

  it('sets status filter with a valid domain value', () => {
    const nextState = gamesReducer(defaultGamesState, {
      type: 'setStatusFilter',
      payload: 'completed',
    })

    expect(nextState.statusFilter).toBe('completed')
  })

  it('supports storing IGDB metadata in games', () => {
    const gameWithIgdbMetadata: Game = {
      id: 'g-igdb-1',
      title: 'The Legend of Zelda: Breath of the Wild',
      platform: 'switch',
      status: 'completed',
      genre: 'Action Adventure',
      year: 2017,
      createdAt: '2026-04-12T12:00:00.000Z',
      updatedAt: '2026-04-12T12:00:00.000Z',
      igdb: {
        id: 7346,
        slug: 'the-legend-of-zelda-breath-of-the-wild',
        coverUrl: 'https://images.igdb.com/cover/t_thumb/co1r7f.jpg',
        summary: 'Open-world action-adventure game.',
        firstReleaseDate: '2017-03-03',
        genres: ['Action', 'Adventure'],
      },
    }

    const nextState = reduce({ type: 'addGame', payload: gameWithIgdbMetadata })

    expect(nextState.games[0]?.igdb?.id).toBe(7346)
    expect(nextState.games[0]?.igdb?.genres).toEqual(['Action', 'Adventure'])
  })
})
