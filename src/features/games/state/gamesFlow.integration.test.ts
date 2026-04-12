import { afterEach, describe, expect, it } from 'vitest'

import { loadGamesState, saveGamesState, STORAGE_KEY } from '../../../shared/lib/storage/gamesStorage'
import { getFamilyByPlatform } from '../../../shared/constants/platforms'
import { defaultGamesState, type GamesState } from '../../../shared/types/game'
import { gamesReducer, type GamesAction } from './gamesReducer'

function applyActions(initialState: GamesState, actions: GamesAction[]): GamesState {
  return actions.reduce((state, action) => gamesReducer(state, action), initialState)
}

function filterGames(state: GamesState) {
  const searchValue = state.search.trim().toLowerCase()

  return state.games.filter((game) => {
    const matchesSearch = searchValue.length === 0 || game.title.toLowerCase().includes(searchValue)
    const gameFamily = game.platformFamily ?? getFamilyByPlatform(game.platform)
    const matchesFamily =
      state.platformFamilyFilter === 'all' || gameFamily === state.platformFamilyFilter
    const matchesPlatform = state.platformFilter === 'all' || game.platform === state.platformFilter
    const matchesStatus = state.statusFilter === 'all' || game.status === state.statusFilter

    return matchesSearch && matchesFamily && matchesPlatform && matchesStatus
  })
}

describe('games flow integration at state/storage layer', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('covers create, edit, complete, combined filter, and persistence round-trip', () => {
    const createdAt = '2026-04-11T08:00:00.000Z'
    const editedAt = '2026-04-11T09:00:00.000Z'

    const createdState = applyActions(defaultGamesState, [
      {
        type: 'addGame',
        payload: {
          id: 'g-1',
          title: 'The Legend of Zelda: Tears of the Kingdom',
          platform: 'switch',
          status: 'backlog',
          genre: 'Action Adventure',
          year: 2023,
          createdAt,
          updatedAt: createdAt,
        },
      },
      {
        type: 'addGame',
        payload: {
          id: 'g-2',
          title: 'Hades',
          platform: 'switch',
          status: 'playing',
          genre: 'Roguelike',
          year: 2020,
          createdAt,
          updatedAt: createdAt,
        },
      },
    ])

    saveGamesState(createdState)
    const loadedAfterCreate = loadGamesState()

    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadedAfterCreate.games[0]).toMatchObject({
      id: 'g-1',
      genre: 'Action Adventure',
      year: 2023,
    })

    const editedState = applyActions(loadedAfterCreate, [
      {
        type: 'editGame',
        payload: {
          id: 'g-1',
          updates: {
            title: 'Zelda TOTK',
            genre: 'Adventure',
            year: 2024,
            updatedAt: editedAt,
          },
        },
      },
    ])

    saveGamesState(editedState)
    const loadedAfterEdit = loadGamesState()

    expect(loadedAfterEdit.games.find((game) => game.id === 'g-1')).toMatchObject({
      title: 'Zelda TOTK',
      genre: 'Adventure',
      year: 2024,
      updatedAt: editedAt,
    })

    const completedAndFilteredState = applyActions(loadedAfterEdit, [
      { type: 'markGameCompleted', payload: { id: 'g-1' } },
      { type: 'setSearch', payload: 'zelda' },
      { type: 'setPlatformFamilyFilter', payload: 'nintendo' },
      { type: 'setPlatformFilter', payload: 'switch' },
      { type: 'setStatusFilter', payload: 'completed' },
    ])

    expect(completedAndFilteredState.games.find((game) => game.id === 'g-1')?.status).toBe('completed')

    const filteredGames = filterGames(completedAndFilteredState)
    expect(filteredGames.map((game) => game.id)).toEqual(['g-1'])

    saveGamesState(completedAndFilteredState)
    const reloadedState = loadGamesState()

    expect(reloadedState).toEqual(completedAndFilteredState)
  })
})
