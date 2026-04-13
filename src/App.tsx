import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuthContext } from './features/auth/state/useAuthContext'
import { LoginPage } from './features/auth/ui/LoginPage'
import { CollectionPage } from './features/games/ui/CollectionPage'
import { SearchPage } from './features/games/ui/SearchPage'
import { GameDetailPage } from './features/games/ui/GameDetailPage'
import { AppLayout } from './shared/ui/AppLayout'
import { PrivateRoute } from './router'

function App() {
  const { state, logout } = useAuthContext()

  const email = state.session.isAuthenticated ? state.session.email : undefined

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route
          path="/"
          element={
            <AppLayout userEmail={email} onLogout={logout}>
              <CollectionPage />
            </AppLayout>
          }
        />
        <Route
          path="/search"
          element={
            <AppLayout userEmail={email} onLogout={logout}>
              <SearchPage />
            </AppLayout>
          }
        />
        <Route
          path="/game/:igdbId"
          element={
            <AppLayout userEmail={email} onLogout={logout}>
              <GameDetailPage />
            </AppLayout>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
