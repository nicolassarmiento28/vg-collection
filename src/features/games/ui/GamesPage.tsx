import { App as AntdApp, Card, Space } from 'antd'
import { useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getFamilyByPlatform } from '../../../shared/constants/platforms'
import { useGamesContext } from '../state/useGamesContext'
import type { Game } from '../../../shared/types/game'
import { GameFormModal, type GameFormValues } from './GameFormModal'
import { GamesTable } from './GamesTable'
import { GamesToolbar } from './GamesToolbar'
import { normalizeOptionalRating } from './normalizeOptionalRating'

type ModalMode = 'create' | 'edit'

export function GamesPage() {
  const { message } = AntdApp.useApp()
  const { state, dispatch } = useGamesContext()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [editingGame, setEditingGame] = useState<Game | undefined>(undefined)

  const filteredGames = useMemo(() => {
    const searchValue = state.search.trim().toLowerCase()

    return state.games.filter((game) => {
      const matchesSearch =
        searchValue.length === 0 || game.title.toLowerCase().includes(searchValue)
      const gameFamily = game.platformFamily ?? getFamilyByPlatform(game.platform)
      const matchesFamily =
        state.platformFamilyFilter === 'all' || gameFamily === state.platformFamilyFilter
      const matchesPlatform =
        state.platformFilter === 'all' || game.platform === state.platformFilter
      const matchesStatus = state.statusFilter === 'all' || game.status === state.statusFilter

      return matchesSearch && matchesFamily && matchesPlatform && matchesStatus
    })
  }, [
    state.games,
    state.platformFamilyFilter,
    state.platformFilter,
    state.search,
    state.statusFilter,
  ])

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGame(undefined)
  }

  const handleCreate = () => {
    setModalMode('create')
    setEditingGame(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (game: Game) => {
    setModalMode('edit')
    setEditingGame(game)
    setIsModalOpen(true)
  }

  const handleComplete = (id: string) => {
    dispatch({ type: 'markGameCompleted', payload: { id } })
    void message.success('Juego marcado como completado')
  }

  const handleSubmit = (values: GameFormValues) => {
    const rating = normalizeOptionalRating(values.rating)

    if (modalMode === 'create') {
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
      return
    }

    if (editingGame === undefined) {
      return
    }

    dispatch({
      type: 'editGame',
      payload: {
        id: editingGame.id,
        updates: {
          title: values.title,
          platform: values.platform,
          status: values.status,
          genre: values.genre,
          year: values.year,
          rating,
          notes: values.notes,
          updatedAt: new Date().toISOString(),
        },
      },
    })

    void message.success('Juego actualizado correctamente')
    closeModal()
  }

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <GamesToolbar
          search={state.search}
          platformFamilyFilter={state.platformFamilyFilter}
          platformFilter={state.platformFilter}
          statusFilter={state.statusFilter}
          onSearchChange={(value) => dispatch({ type: 'setSearch', payload: value })}
          onPlatformFamilyFilterChange={(value) =>
            dispatch({ type: 'setPlatformFamilyFilter', payload: value })
          }
          onPlatformFilterChange={(value) =>
            dispatch({ type: 'setPlatformFilter', payload: value })
          }
          onStatusFilterChange={(value) => dispatch({ type: 'setStatusFilter', payload: value })}
          onCreate={handleCreate}
        />

        <GamesTable games={filteredGames} onEdit={handleEdit} onComplete={handleComplete} />
      </Space>

      <GameFormModal
        open={isModalOpen}
        mode={modalMode}
        game={editingGame}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Card>
  )
}
