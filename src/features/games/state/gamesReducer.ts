import type { Game, GameStatus, GamesState, Platform, PlatformFamily } from '../../../shared/types/game'

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
  | { type: 'setPlatformFamilyFilter'; payload: PlatformFamily | 'all' }
  | { type: 'setPlatformFilter'; payload: Platform | 'all' }
  | { type: 'setStatusFilter'; payload: GameStatus | 'all' }

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
    case 'setPlatformFamilyFilter':
      return {
        ...state,
        platformFamilyFilter: action.payload,
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
    default:
      return state
  }
}
