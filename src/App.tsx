import { useAuthContext } from './features/auth/state/useAuthContext'
import { LoginPage } from './features/auth/ui/LoginPage'
import { GamesPage } from './features/games/ui/GamesPage'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  const { state, logout } = useAuthContext()

  if (!state.session.isAuthenticated) {
    return <LoginPage />
  }

  return (
    <AppLayout userEmail={state.session.email} onLogout={logout}>
      <GamesPage />
    </AppLayout>
  )
}

export default App
