// src/shared/ui/AppFooter.tsx
import { Grid, Layout } from 'antd'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../features/auth/state/AuthContext'

const { Footer } = Layout
const { useBreakpoint } = Grid

export function AppFooter() {
  const { state, dispatch } = useAuthContext()
  const screens = useBreakpoint()
  const isMobile = screens.md === false // same rule as AppLayout's header/content

  return (
    <Footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: isMobile ? '32px 16px 20px' : '32px 24px 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'space-between',
        }}
      >
        {/* Brand block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 220 }}>
          <Link
            to="/"
            aria-label="Ir al inicio"
            className="brand-logo-link"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', width: 'fit-content' }}
          >
            <span style={{ color: 'var(--accent)', fontSize: 18, lineHeight: 1 }}>▸</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--text-h)',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              VG COLLECTION
            </span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, maxWidth: 280 }}>
            Tu colección de videojuegos, organizada y con onda retro.
          </p>
        </div>

        {/* Nav block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Navegación
          </span>
          <Link to="/coleccion" style={{ color: 'var(--text)', fontSize: 14, textDecoration: 'none' }}>
            Mi Colección
          </Link>
          <Link to="/crear" style={{ color: 'var(--text)', fontSize: 14, textDecoration: 'none' }}>
            Crear Juego
          </Link>
          {state.isLoggedIn && state.user !== null ? (
            <button
              type="button"
              onClick={() => dispatch({ type: 'logout' })}
              style={{
                color: 'var(--text)',
                fontSize: 14,
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Cerrar sesión ({state.user.email})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: 'openModal' })}
              style={{
                color: 'var(--text)',
                fontSize: 14,
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 12,
          marginTop: 28,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
        }}
      >
        © 2026 Nicolás Sarmiento. Todos los derechos reservados.
      </div>
    </Footer>
  )
}
