import { Avatar, Button } from 'antd'
import { useAuthContext } from '../../features/auth/state/AuthContext'

export function LoginButton() {
  const { state, dispatch } = useAuthContext()

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
      style={{
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'transparent',
        borderRadius: 20,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        padding: '0 20px',
        flexShrink: 0,
        transition: 'background 150ms, color 150ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--accent)'
        el.style.color = 'var(--text-h)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.color = 'var(--accent)'
      }}
    >
      Login
    </Button>
  )
}
