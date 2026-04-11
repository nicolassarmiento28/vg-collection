import { describe, expect, it } from 'vitest'

import { defaultGamesState, type Game } from '../../../shared/types/game'
import { gamesReducer, type GamesAction } from './gamesReducer'

const baseGame: Game = {
  id: 'g-1',
  title: 'Halo Infinite',
  platform: 'xbox',
  status: 'backlog',
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
          rating: 10,
        },
      },
    })

    expect(nextState.games).toEqual([
      {
        ...baseGame,
        title: 'Halo 3',
        platform: 'pc',
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
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbox' })
    nextState = gamesReducer(nextState, { type: 'setStatusFilter', payload: 'playing' })

    expect(nextState.search).toBe('halo')
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
})
