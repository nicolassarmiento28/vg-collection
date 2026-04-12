import { defaultAuthState, type AuthStorageState } from '../../types/auth'

export const AUTH_STORAGE_KEY = 'vg-collection:auth:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidAuthState(value: unknown): value is AuthStorageState {
  if (!isRecord(value) || typeof value.isAuthenticated !== 'boolean') {
    return false
  }

  if (!value.isAuthenticated) {
    return true
  }

  return typeof value.email === 'string' && typeof value.updatedAt === 'string'
}

export function loadAuthState(): AuthStorageState {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (raw === null) {
    return defaultAuthState
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isValidAuthState(parsed) ? parsed : defaultAuthState
  } catch {
    return defaultAuthState
  }
}

export function saveAuthState(state: AuthStorageState): void {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // no-op
  }
}

export function clearAuthState(): void {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // no-op
  }
}
