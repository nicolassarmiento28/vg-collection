import { createContext, type Dispatch } from 'react'

import type { AuthStorageState } from '../types/auth'

export interface AuthState {
  session: AuthStorageState
  isSubmitting: boolean
  error?: string
}

export type AuthAction =
  | { type: 'loginStart' }
  | { type: 'loginSuccess'; payload: { email: string; updatedAt: string } }
  | { type: 'loginError'; payload: string }
  | { type: 'logout' }

export interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  dispatch: Dispatch<AuthAction>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
