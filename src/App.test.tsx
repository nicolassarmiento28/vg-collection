import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import { AuthProvider } from './features/auth/state/AuthContext'

describe('App auth gate', () => {
  it('shows login screen when unauthenticated', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )

    expect(screen.getByRole('button', { name: 'Iniciar sesion' })).toBeInTheDocument()
  })
})
