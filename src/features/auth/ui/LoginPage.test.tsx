import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { AuthProvider } from '../state/AuthContext'
import { LoginPage } from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Collection page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  it('validates email and password rules', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La contrasena es obligatoria')).toBeInTheDocument()
  })

  it('shows credential error for invalid login', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'wrong@vg.com')
    await user.type(screen.getByLabelText('Contrasena'), 'Wrong1234')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales invalidas')).toBeInTheDocument()
    })
  }, 10000)

  it('navigates to / on successful login', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'demo@vg.com')
    await user.type(screen.getByLabelText('Contrasena'), 'Demo1234')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    await waitFor(() => {
      expect(screen.getByText('Collection page')).toBeInTheDocument()
    })
  }, 10000)

  it('does not render a canvas element', () => {
    renderLoginPage()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('shows demo credentials hint', () => {
    renderLoginPage()
    expect(screen.getByText('demo@vg.com')).toBeInTheDocument()
    expect(screen.getByText('Demo1234')).toBeInTheDocument()
  })
})
