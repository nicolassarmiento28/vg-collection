import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from './AuthContext'
import { useAuthContext } from './useAuthContext'

function Probe() {
  const { state, login, logout } = useAuthContext()

  return (
    <>
      <div>{state.session.isAuthenticated ? state.session.email : 'logged-out'}</div>
      <button onClick={() => void login('demo@vg.com', 'Demo1234')}>login</button>
      <button onClick={logout}>logout</button>
    </>
  )
}

describe('AuthContext', () => {
  it('logs in and logs out through context API', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByText('logged-out')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByText('demo@vg.com')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'logout' }))
    expect(screen.getByText('logged-out')).toBeInTheDocument()
  })
})
