import type { Game, GameFormPrefill, GameStatus, GamesState, Platform } from '../../../shared/types/game'

export type GamesAction =
  | { type: 'addGame'; payload: Game }
  | {
      type: 'editGame'
      payload: {
        id: string
        updates: Partial<Omit<Game, 'id' | 'createdAt'>>
      }
    }
  | { type: 'markGameCompleted'; payload: { id: string } }
  | { type: 'setSearch'; payload: string }
  | { type: 'setPlatformFilter'; payload: Platform | 'all' }
  | { type: 'setStatusFilter'; payload: GameStatus | 'all' }
  | { type: 'openCreateModal'; payload: Partial<GameFormPrefill> | undefined }
  | { type: 'closeCreateModal' }
  | { type: 'removeGame'; payload: { id: string } }

export function gamesReducer(state: GamesState, action: GamesAction): GamesState {
  switch (action.type) {
    case 'addGame':
      return {
        ...state,
        games: [...state.games, action.payload],
      }
    case 'editGame':
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.id ? { ...game, ...action.payload.updates } : game,
        ),
      }
    case 'markGameCompleted':
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.payload.id ? { ...game, status: 'completed' } : game,
        ),
      }
    case 'setSearch':
      return {
        ...state,
        search: action.payload,
      }
    case 'setPlatformFilter':
      return {
        ...state,
        platformFilter: action.payload,
      }
    case 'setStatusFilter':
      return {
        ...state,
        statusFilter: action.payload,
      }
    case 'openCreateModal':
      return { ...state, isCreateModalOpen: true, createModalPrefill: action.payload }
    case 'closeCreateModal':
      return { ...state, isCreateModalOpen: false, createModalPrefill: undefined }
    case 'removeGame':
      return {
        ...state,
        games: state.games.filter((game) => game.id !== action.payload.id),
      }
    default:
      return state
  }
}
