import { Button, Layout, Space, Typography } from 'antd'
import type { CSSProperties, ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
  userEmail?: string
  onLogout?: () => void
}

const navLinkStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  color: isActive ? '#39ff14' : '#a0a0a0',
  textDecoration: 'none',
  borderBottom: isActive ? '2px solid #39ff14' : '2px solid transparent',
  paddingBottom: 2,
  fontFamily: "'Courier New', Consolas, monospace",
  fontSize: 13,
  letterSpacing: 1,
  transition: 'color 0.15s',
})

export function AppLayout({ children, userEmail, onLogout }: AppLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout?.()
    void navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#050f05',
          borderBottom: '1px solid #1a4a1a',
          padding: '0 24px',
          gap: 24,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: '#39ff14', letterSpacing: 2 }}>
          Catalogo de Juegos
        </Typography.Title>

        <Space size={24} style={{ flex: 1 }}>
          <NavLink to="/" end style={navLinkStyle}>
            Mi Coleccion
          </NavLink>
          <NavLink to="/search" style={navLinkStyle}>
            Buscar juegos
          </NavLink>
        </Space>

        <Space>
          {userEmail !== undefined && (
            <Typography.Text style={{ color: '#707070' }}>{userEmail}</Typography.Text>
          )}
          {onLogout !== undefined && (
            <Button onClick={handleLogout}>Cerrar sesion</Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  )
}
