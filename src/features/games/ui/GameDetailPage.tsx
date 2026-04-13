import { Button, Input, InputNumber, Modal, Select, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { PLATFORM_CATALOG } from '../../../shared/constants/platforms'
import type { Game, GameStatus, Platform } from '../../../shared/types/game'
import { fetchIgdbGameById } from '../api/igdbApi'
import type { IgdbGameDto } from '../api/igdbApi'
import { useGamesContext } from '../state/useGamesContext'

const STATUS_OPTIONS: { label: string; value: GameStatus }[] = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

const ALL_PLATFORMS: Platform[] = Object.values(PLATFORM_CATALOG).flat()

interface AddFormState {
  platform: Platform | undefined
  status: GameStatus
  rating: number | undefined
  notes: string
}

export function GameDetailPage() {
  const { igdbId: igdbIdParam } = useParams<{ igdbId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useGamesContext()

  const igdbId = igdbIdParam !== undefined ? parseInt(igdbIdParam, 10) : NaN

  const [game, setGame] = useState<IgdbGameDto | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<AddFormState>({
    platform: undefined,
    status: 'backlog',
    rating: undefined,
    notes: '',
  })

  const isInCollection = state.games.some((g) => g.igdb?.id === igdbId)

  useEffect(() => {
    if (isNaN(igdbId)) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(undefined)

      try {
        const data = await fetchIgdbGameById(igdbId)
        if (!cancelled) setGame(data)
      } catch {
        if (!cancelled) setError('Error al cargar el juego.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [igdbId])

  if (isNaN(igdbId)) {
    return (
      <div style={{ padding: 24, color: '#a0a0a0' }}>Juego no encontrado</div>
    )
  }

  if (loading) {
    return (
      <div data-testid="loading-spinner" style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error !== undefined || game === undefined) {
    return (
      <div style={{ padding: 24, color: '#a0a0a0' }}>
        <p style={{ marginBottom: 16 }}>{error ?? 'Error al cargar el juego.'}</p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    )
  }

  const year = game.firstReleaseDate
    ? new Date(game.firstReleaseDate).getUTCFullYear()
    : undefined

  const handleConfirmAdd = () => {
    if (form.platform === undefined) return

    const now = new Date().toISOString()

    const newGame: Game = {
      id: uuidv4(),
      title: game.name,
      platform: form.platform,
      status: form.status,
      genre: game.genres?.[0] ?? '', // Use first genre or empty string if not available
      year: year ?? new Date().getFullYear(),
      rating: form.rating,
      notes: form.notes || undefined,
      igdb: {
        id: game.id,
        slug: game.slug ?? '', // IGDB always provides slug for valid games
        name: game.name,
        coverUrl: game.coverUrl,
        summary: game.summary,
        firstReleaseDate: game.firstReleaseDate,
        genres: game.genres,
      },
      createdAt: now,
      updatedAt: now,
    }

    dispatch({ type: 'addGame', payload: newGame })
    setModalOpen(false)
    navigate('/')
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Two-column layout */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {/* Cover */}
        <div style={{ flexShrink: 0 }}>
          {game.coverUrl !== undefined ? (
            <img
              src={game.coverUrl}
              alt={game.name}
              style={{
                width: 300,
                maxWidth: '100%',
                borderRadius: 6,
                border: '1px solid #1a4a1a',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: 300,
                maxWidth: '100%',
                aspectRatio: '3/4',
                background: '#0a1f0a',
                border: '1px solid #1a4a1a',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                color: '#1a4a1a',
              }}
            >
              🎮
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ color: '#a0a0a0', marginBottom: 12 }}>{game.name}</h1>

          <div style={{ marginBottom: 12, color: '#606060', fontSize: 13 }}>
            {[year, ...(game.genres ?? [])].filter(Boolean).map((item) => (
              <Tag key={String(item)} style={{ marginBottom: 4 }}>
                {item}
              </Tag>
            ))}
          </div>

          {game.platforms !== undefined && game.platforms.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {game.platforms.map((p) => (
                <Tag key={p} style={{ marginBottom: 4, color: '#606060' }}>
                  {p}
                </Tag>
              ))}
            </div>
          )}

          {game.summary !== undefined && (
            <p style={{ color: '#707070', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              {game.summary}
            </p>
          )}

          <Button
            type="default"
            disabled={isInCollection}
            onClick={() => setModalOpen(true)}
          >
            {isInCollection ? 'Ya en tu coleccion' : 'Agregar a mi coleccion'}
          </Button>
        </div>
      </div>

      {/* Add to collection modal */}
      <Modal
        title="Agregar a coleccion"
        open={modalOpen}
        onOk={handleConfirmAdd}
        onCancel={() => setModalOpen(false)}
        okText="Agregar"
        cancelText="Cancelar"
        okButtonProps={{ disabled: form.platform === undefined }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div>
            <label
              htmlFor="detail-platform"
              style={{ display: 'block', marginBottom: 4, color: '#a0a0a0', fontSize: 13 }}
            >
              Plataforma *
            </label>
            <Select
              id="detail-platform"
              style={{ width: '100%' }}
              placeholder="Selecciona una plataforma"
              value={form.platform}
              onChange={(v: Platform) => setForm((f) => ({ ...f, platform: v }))}
              options={ALL_PLATFORMS.map((p) => ({ label: p, value: p }))}
              showSearch
            />
          </div>

          <div>
            <label
              htmlFor="detail-status"
              style={{ display: 'block', marginBottom: 4, color: '#a0a0a0', fontSize: 13 }}
            >
              Estado *
            </label>
            <Select
              id="detail-status"
              style={{ width: '100%' }}
              value={form.status}
              onChange={(v: GameStatus) => setForm((f) => ({ ...f, status: v }))}
              options={STATUS_OPTIONS}
            />
          </div>

          <div>
            <label
              htmlFor="detail-rating"
              style={{ display: 'block', marginBottom: 4, color: '#a0a0a0', fontSize: 13 }}
            >
              Rating (0–10)
            </label>
            <InputNumber
              id="detail-rating"
              min={0}
              max={10}
              style={{ width: '100%' }}
              value={form.rating}
              onChange={(v) => setForm((f) => ({ ...f, rating: v ?? undefined }))}
            />
          </div>

          <div>
            <label
              htmlFor="detail-notes"
              style={{ display: 'block', marginBottom: 4, color: '#a0a0a0', fontSize: 13 }}
            >
              Notas
            </label>
            <Input.TextArea
              id="detail-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
