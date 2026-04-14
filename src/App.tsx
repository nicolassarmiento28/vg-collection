// src/App.tsx
import { App as AntdApp } from 'antd'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { HomePage } from './features/home/ui/HomePage'
import { GamesProvider, useGamesContext } from './features/games/state/GamesContext'
import { GameDetailPage } from './features/games/ui/GameDetailPage'
import { GameFormModal, type GameFormValues } from './features/games/ui/GameFormModal'
import { normalizeOptionalRating } from './features/games/ui/GamesPage'
import { AppLayout } from './shared/ui/AppLayout'

// Lazy placeholder — replaced in Task 7
function CollectionPagePlaceholder() {
  return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Mi Colección — próximamente</div>
}

function GlobalGameFormModal() {
  const { message } = AntdApp.useApp()
  const { state, dispatch } = useGamesContext()

  const isOpen = state.isCreateModalOpen
  const prefill = state.createModalPrefill

  function closeModal() {
    dispatch({ type: 'closeCreateModal' })
  }

  function handleSubmit(values: GameFormValues) {
    const rating = normalizeOptionalRating(values.rating)
    const now = new Date().toISOString()
    dispatch({
      type: 'addGame',
      payload: {
        id: uuidv4(),
        title: values.title,
        platform: values.platform,
        status: values.status,
        genre: values.genre,
        year: values.year,
        rating,
        notes: values.notes,
        createdAt: now,
        updatedAt: now,
      },
    })
    void message.success('Juego creado correctamente')
    closeModal()
  }

  return (
    <GameFormModal
      open={isOpen}
      mode="create"
      prefill={prefill}
      onCancel={closeModal}
      onSubmit={handleSubmit}
    />
  )
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coleccion" element={<CollectionPagePlaceholder />} />
        <Route path="/juego/:id" element={<GameDetailPage />} />
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
            <GlobalGameFormModal />
          </AntdApp>
        </GamesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
