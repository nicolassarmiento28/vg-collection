import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from '../state/AuthContext'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('validates email and password rules', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La contrasena es obligatoria')).toBeInTheDocument()
  })

  it('shows credential error for invalid login', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.type(screen.getByLabelText('Email'), 'wrong@vg.com')
    await user.type(screen.getByLabelText('Contrasena'), 'Wrong1234')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales invalidas')).toBeInTheDocument()
    })
  })
})
