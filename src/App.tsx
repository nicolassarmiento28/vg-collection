// src/App.tsx
import { App as AntdApp } from 'antd'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { HomePage } from './features/home/ui/HomePage'
import { GamesProvider } from './features/games/state/GamesContext'
import { AppLayout } from './shared/ui/AppLayout'

// Lazy placeholders — replaced in later tasks
function CollectionPagePlaceholder() {
  return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Mi Colección — próximamente</div>
}

function GameDetailPagePlaceholder() {
  return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Detalle de juego — próximamente</div>
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coleccion" element={<CollectionPagePlaceholder />} />
        <Route path="/juego/:id" element={<GameDetailPagePlaceholder />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GamesProvider>
          <AntdApp>
            <AppRoutes />
            <LoginModal />
          </AntdApp>
        </GamesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
