// src/shared/ui/AppLayout.tsx
import { MenuOutlined } from '@ant-design/icons'
import { Drawer, Grid, Layout } from 'antd'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'
import { ThemeToggle } from './ThemeToggle'

const { Header, Content } = Layout
const { useBreakpoint } = Grid

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
  const screens = useBreakpoint()
  const isMobile = !screens.md  // true for xs and sm (< 768px)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false)
  }, [isMobile])

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 24,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: isMobile ? 56 : 64,
          padding: isMobile ? '0 16px' : '0 24px',
        }}
      >
        {/* Logo */}
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
          {!isMobile && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: screens.lg ? 28 : 22,
                color: 'var(--text-h)',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              VG COLLECTION
            </span>
          )}
        </Link>

        {/* Nav links — desktop/tablet only */}
        {!isMobile && (
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
        )}

        {/* Search — desktop/tablet only */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <HeaderSearch />
          </div>
        )}

        {/* Spacer for mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* Theme toggle — desktop/tablet */}
        {!isMobile && <ThemeToggle />}

        {/* Login button — desktop/tablet */}
        {!isMobile && <LoginButton />}

        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            <MenuOutlined />
          </button>
        )}
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={260}
        styles={{
          header: { background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' },
          body: { background: 'var(--bg-surface)', padding: '24px 20px' },
        }}
        title={
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)', letterSpacing: 2 }}>
            <span style={{ color: 'var(--accent)', marginRight: 6 }}>▸</span>
            VG COLLECTION
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NavLink to="/" end style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Inicio
            </NavLink>
            <NavLink to="/coleccion" style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Mi Colección
            </NavLink>
            <NavLink to="/crear" style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Crear Juego
            </NavLink>
          </div>

          {/* Search in drawer */}
          <HeaderSearch />

          {/* Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cambiar tema</span>
          </div>

          {/* Login */}
          <LoginButton />
        </div>
      </Drawer>

      <Content style={{ padding: isMobile ? '16px 12px' : 24, background: 'var(--bg)' }}>
        {children}
      </Content>

      <AppFooter />
    </Layout>
  )
}
