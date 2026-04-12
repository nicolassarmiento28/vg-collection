import { afterEach, describe, expect, it, vi } from 'vitest'

import { AUTH_STORAGE_KEY, clearAuthState, loadAuthState, saveAuthState } from './authStorage'

describe('authStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('returns logged-out default when key is missing', () => {
    expect(loadAuthState()).toEqual({ isAuthenticated: false })
  })

  it('loads a valid persisted session', () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: true,
        email: 'demo@vg.com',
        updatedAt: '2026-04-12T00:00:00.000Z',
      }),
    )

    expect(loadAuthState()).toEqual({
      isAuthenticated: true,
      email: 'demo@vg.com',
      updatedAt: '2026-04-12T00:00:00.000Z',
    })
  })

  it('returns logged-out default for malformed payload', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{invalid')

    expect(loadAuthState()).toEqual({ isAuthenticated: false })
  })

  it('does not throw when save fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failure')
    })

    expect(() =>
      saveAuthState({
        isAuthenticated: true,
        email: 'demo@vg.com',
        updatedAt: '2026-04-12T00:00:00.000Z',
      }),
    ).not.toThrow()
  })

  it('clears stored session', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{}')
    clearAuthState()

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
