import { Layout, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
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
        <Typography.Title level={4} style={{ margin: 0 }}>
          Catalogo de Juegos
        </Typography.Title>
      </Header>
      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  )
}
