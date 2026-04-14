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
import { CollectionPage } from './features/collection/ui/CollectionPage'
import { CollectionDetailPage } from './features/collection/ui/CollectionDetailPage'
import { CreateGamePage } from './features/games/ui/CreateGamePage'
import { AppLayout } from './shared/ui/AppLayout'

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
        igdbId: values.igdbId,
        coverUrl: values.coverUrl,
        coverBase64: values.coverBase64,
        pros: values.pros,
        cons: values.cons,
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
        <Route path="/coleccion" element={<CollectionPage />} />
        <Route path="/coleccion/:id" element={<CollectionDetailPage />} />
        <Route path="/crear" element={<CreateGamePage />} />
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
