import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { PopularGamesSection } from './features/popular/ui/PopularGamesSection'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <PopularGamesSection />
        <GamesPage />
      </AppLayout>
      <LoginModal />
    </AuthProvider>
  )
}

export default App
