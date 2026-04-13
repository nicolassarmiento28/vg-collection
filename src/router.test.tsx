import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

// Mock AuthContext so we can control isAuthenticated
vi.mock('./features/auth/state/useAuthContext', () => ({
  useAuthContext: vi.fn(),
}))

import { useAuthContext } from './features/auth/state/useAuthContext'
import type { AuthStorageState } from './features/auth/types/auth'
import { PrivateRoute } from './router'

const mockUseAuthContext = vi.mocked(useAuthContext)

function renderPrivateRoute(isAuthenticated: boolean, path = '/') {
  const session = { isAuthenticated } as AuthStorageState
  mockUseAuthContext.mockReturnValue({
    state: {
      session,
      isSubmitting: false,
    },
    login: vi.fn(),
    logout: vi.fn(),
    dispatch: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<div>Protected content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('PrivateRoute', () => {
  it('renders child route when authenticated', () => {
    renderPrivateRoute(true, '/')
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderPrivateRoute(false, '/')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
