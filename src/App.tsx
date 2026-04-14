import { LockOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { AuthProvider, useAuthContext } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { PopularGamesSection } from './features/popular/ui/PopularGamesSection'
import { AppLayout } from './shared/ui/AppLayout'

function CollectionGatePlaceholder() {
  const { dispatch } = useAuthContext()
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
        TU COLECCIÓN
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '64px 24px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
        }}
      >
        <LockOutlined style={{ fontSize: 40, color: 'var(--text-muted)' }} />
        <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para ver tu colección
        </Typography.Text>
        <Button type="primary" onClick={() => dispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    </>
  )
}

function AppInner() {
  const { state } = useAuthContext()
  return (
    <AppLayout>
      <PopularGamesSection />
      {state.isLoggedIn ? <GamesPage /> : <CollectionGatePlaceholder />}
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
      <LoginModal />
    </AuthProvider>
  )
}

export default App
