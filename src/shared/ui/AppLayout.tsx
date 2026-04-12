import { Button, Layout, Space, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
  userEmail?: string
  onLogout?: () => void
}

export function AppLayout({ children, userEmail, onLogout }: AppLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Catalogo de Juegos
          </Typography.Title>

          <Space>
            {userEmail !== undefined && <Typography.Text>{userEmail}</Typography.Text>}
            {onLogout !== undefined && (
              <Button onClick={onLogout}>
                Cerrar sesion
              </Button>
            )}
          </Space>
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  )
}
