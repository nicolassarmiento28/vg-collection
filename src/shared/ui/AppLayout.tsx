// src/shared/ui/AppLayout.tsx
import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    paddingBottom: 2,
    textDecoration: 'none',
    transition: 'color 150ms, border-color 150ms',
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: 64,
          padding: '0 24px',
        }}
      >
        {/* Logo — left */}
        <Link
          to="/"
          aria-label="Ir al inicio"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: 20, lineHeight: 1 }}>▸</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--text-h)',
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            VG COLLECTION
          </span>
        </Link>

        {/* Nav tabs — center-left */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexShrink: 0 }}>
          <NavLink to="/" end style={navLinkStyle}>
            Inicio
          </NavLink>
          <NavLink to="/coleccion" style={navLinkStyle}>
            Mi Colección
          </NavLink>
          <NavLink to="/crear" style={navLinkStyle}>
            Crear Juego
          </NavLink>
        </div>

        {/* Search — pushes to right center */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <HeaderSearch />
        </div>

        {/* Login button — right */}
        <LoginButton />
      </Header>

      <Content style={{ padding: 24, background: 'var(--bg)' }}>
        {children}
      </Content>

      <AppFooter />
    </Layout>
  )
}
