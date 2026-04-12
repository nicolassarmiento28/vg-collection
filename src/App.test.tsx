import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'
import { AuthProvider } from './features/auth/state/AuthContext'
import { AUTH_STORAGE_KEY } from './features/auth/lib/storage/authStorage'
import { GamesProvider } from './features/games/state/GamesContext'

function renderWithProviders() {
  return render(
    <AuthProvider>
      <GamesProvider>
        <App />
      </GamesProvider>
    </AuthProvider>,
  )
}

describe('App auth gate', () => {
  it('shows login screen when unauthenticated', () => {
    renderWithProviders()

    expect(screen.getByRole('button', { name: 'Iniciar sesion' })).toBeInTheDocument()
  })

  it('logs out and returns to login screen', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: true,
        email: 'demo@vg.com',
        updatedAt: '2026-04-12T00:00:00.000Z',
      }),
    )

    renderWithProviders()

    expect(screen.getByRole('button', { name: 'Cerrar sesion' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesion' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar sesion' })).toBeInTheDocument()
    })
  })
})
