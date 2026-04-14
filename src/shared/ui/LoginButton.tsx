import { Avatar, Button } from 'antd'
import { useState } from 'react'
import { useAuthContext } from '../../features/auth/state/AuthContext'

export function LoginButton() {
  const { state, dispatch } = useAuthContext()
  const [hovered, setHovered] = useState(false)

  if (state.isLoggedIn && state.user !== null) {
    const initial = (state.user.email[0] ?? '?').toUpperCase()
    return (
      <span title={`Cerrar sesión (${state.user.email})`}>
        <Avatar
          style={{
            background: 'var(--accent)',
            color: 'var(--text-h)',
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={() => dispatch({ type: 'logout' })}
        >
          {initial}
        </Avatar>
      </span>
    )
  }

  return (
    <Button
      onClick={() => dispatch({ type: 'openModal' })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderColor: 'var(--accent)',
        color: hovered ? 'var(--text-h)' : 'var(--accent)',
        background: hovered ? 'var(--accent)' : 'transparent',
        borderRadius: 20,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        padding: '0 20px',
        flexShrink: 0,
        transition: 'background 150ms, color 150ms',
      }}
    >
      Iniciar sesión
    </Button>
  )
}
