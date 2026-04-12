import { useMemo, useReducer, type ReactNode } from 'react'

import { authenticateLocalUser } from '../lib/authService'
import { clearAuthState, loadAuthState, saveAuthState } from '../lib/storage/authStorage'
import { AuthContext, type AuthAction, type AuthState } from './authContextInstance'

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'loginStart':
      return { ...state, isSubmitting: true, error: undefined }
    case 'loginSuccess':
      return {
        ...state,
        isSubmitting: false,
        error: undefined,
        session: {
          isAuthenticated: true,
          email: action.payload.email,
          updatedAt: action.payload.updatedAt,
        },
      }
    case 'loginError':
      return { ...state, isSubmitting: false, error: action.payload }
    case 'logout':
      return { session: { isAuthenticated: false }, isSubmitting: false }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    session: loadAuthState(),
    isSubmitting: false,
  })

  const value = useMemo(
    () => ({
      state,
      dispatch,
      login: async (email: string, password: string) => {
        dispatch({ type: 'loginStart' })

        try {
          const user = await authenticateLocalUser({ email, password })
          const updatedAt = new Date().toISOString()

          saveAuthState({
            isAuthenticated: true,
            email: user.email,
            updatedAt,
          })

          dispatch({ type: 'loginSuccess', payload: { email: user.email, updatedAt } })
        } catch {
          dispatch({ type: 'loginError', payload: 'Credenciales invalidas' })
        }
      },
      logout: () => {
        clearAuthState()
        dispatch({ type: 'logout' })
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
