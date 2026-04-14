export interface AuthUser {
  email: string
}

export interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  isModalOpen: boolean
}

export type AuthAction =
  | { type: 'openModal' }
  | { type: 'closeModal' }
  | { type: 'login'; payload: AuthUser }
  | { type: 'logout' }

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
  isModalOpen: false,
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'openModal':
      return { ...state, isModalOpen: true }
    case 'closeModal':
      return { ...state, isModalOpen: false }
    case 'login':
      return { isLoggedIn: true, user: action.payload, isModalOpen: false }
    case 'logout':
      return { ...state, isLoggedIn: false, user: null }
    default:
      return state
  }
}
