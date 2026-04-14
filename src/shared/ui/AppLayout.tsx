import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
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
          gap: 16,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: 64,
          padding: '0 24px',
        }}
      >
        {/* Logo — left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            flexShrink: 0,
            textDecoration: 'none',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span
            style={{
              color: 'var(--accent)',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ▸
          </span>
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
        </div>

        {/* Spacer — pushes search to center */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <HeaderSearch />
        </div>

        {/* Login button — right */}
        <LoginButton />
      </Header>

      <Content style={{ padding: 24, background: 'var(--bg)' }}>
        {children}
      </Content>
    </Layout>
  )
}
