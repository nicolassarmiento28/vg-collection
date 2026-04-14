import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <GamesPage />
      </AppLayout>
      <LoginModal />
    </AuthProvider>
  )
}

export default App
