import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { authReducer, initialAuthState, type AuthState, type AuthAction } from './authReducer'

interface AuthContextValue {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
