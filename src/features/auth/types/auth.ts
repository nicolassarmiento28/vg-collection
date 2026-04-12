export interface AuthSession {
  isAuthenticated: true
  email: string
  updatedAt: string
}

export interface LoggedOutState {
  isAuthenticated: false
}

export type AuthStorageState = AuthSession | LoggedOutState

export const defaultAuthState: LoggedOutState = {
  isAuthenticated: false,
}
