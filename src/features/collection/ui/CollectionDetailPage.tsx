// src/features/collection/ui/CollectionDetailPage.tsx
import { ArrowLeftOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Card, Divider, Grid, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeOptionalRating } from '../../games/ui/GamesPage'
import { GameFormModal, type GameFormValues } from '../../games/ui/GameFormModal'
import { useGamesContext } from '../../games/state/GamesContext'
import { PLATFORM_LABELS } from '../../../shared/types/game'
import type { Game, GameStatus } from '../../../shared/types/game'

const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

const STATUS_COLORS: Record<GameStatus, string> = {
  backlog: 'default',
  playing: 'orange',
  completed: 'green',
  paused: 'blue',
  dropped: 'red',
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function parseLines(text: string | undefined): string[] {
  if (!text) return []
  return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
}

function OpinionCard({ game }: { game: Game }) {
  const pros = parseLines(game.pros)
  const cons = parseLines(game.cons)

  if (pros.length === 0 && cons.length === 0) return null

  return (
    <Card title="Mi opinión" style={{ flex: 1, minWidth: 200 }}>
      {pros.length > 0 && (
        <div>
          <Typography.Text strong style={{ color: '#27ae60' }}>
            ✓ Puntos positivos
          </Typography.Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            {pros.map((p, i) => (
              <li key={i} style={{ color: 'var(--text-body)', marginBottom: 4 }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pros.length > 0 && cons.length > 0 && <Divider style={{ margin: '16px 0' }} />}

      {cons.length > 0 && (
        <div>
          <Typography.Text strong style={{ color: '#c0392b' }}>
            ✗ Puntos negativos
          </Typography.Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            {cons.map((c, i) => (
              <li key={i} style={{ color: 'var(--text-body)', marginBottom: 4 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, dispatch } = useGamesContext()
  const navigate = useNavigate()
  const { modal, message } = AntdApp.useApp()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const [isEditOpen, setIsEditOpen] = useState(false)

  const gameFound = state.games.find((g) => g.id === id)

  if (gameFound === undefined) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Typography.Text>Juego no encontrado.</Typography.Text>
        <br />
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/coleccion')}
          style={{ marginTop: 16 }}
        >
          Volver a mi colección
        </Button>
      </div>
    )
  }

  const game: Game = gameFound

  const displayCover = game.coverBase64 ?? game.coverUrl

  function handleDelete() {
    modal.confirm({
      title: '¿Eliminar juego?',
      content: `"${game.title}" será eliminado de tu colección.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        dispatch({ type: 'removeGame', payload: { id: game.id } })
        void message.success('Juego eliminado')
        navigate('/coleccion')
      },
    })
  }

  function handleEditSubmit(values: GameFormValues) {
    const rating = normalizeOptionalRating(values.rating)
    dispatch({
      type: 'editGame',
      payload: {
        id: game.id,
        updates: {
          title: values.title,
          platform: values.platform,
          status: values.status,
          genre: values.genre,
          year: values.year,
          rating,
          notes: values.notes,
          coverUrl: values.coverUrl,
          coverBase64: values.coverBase64,
          pros: values.pros,
          cons: values.cons,
          updatedAt: new Date().toISOString(),
        },
      },
    })
    void message.success('Juego actualizado correctamente')
    setIsEditOpen(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '16px 0' : '16px 24px' }}>
      {/* Back link */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/coleccion')}
        style={{ paddingLeft: 0, marginBottom: 24, color: 'var(--text-muted)' }}
      >
        Volver a mi colección
      </Button>

      {/* Header: cover + title/meta */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          marginBottom: 32,
          alignItems: isMobile ? 'flex-start' : 'flex-start',
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: isMobile ? '100%' : 200,
            flexShrink: 0,
          }}
        >
          {displayCover ? (
            <img
              src={displayCover}
              alt={game.title}
              style={{
                width: isMobile ? '100%' : 200,
                maxHeight: isMobile ? 260 : 280,
                objectFit: 'cover',
                borderRadius: 8,
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? '100%' : 200,
                height: 260,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-muted)',
                letterSpacing: 2,
                border: '1px solid var(--border)',
              }}
            >
              {getInitials(game.title)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ flex: 1 }}>
          <Typography.Title
            level={2}
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-h)',
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            {game.title}
          </Typography.Title>

          <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15, display: 'block', marginBottom: 12 }}>
            {PLATFORM_LABELS[game.platform]} · {game.year} · {game.genre}
          </Typography.Text>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag color={STATUS_COLORS[game.status]}>{STATUS_LABELS[game.status]}</Tag>
            {game.rating !== undefined && (
              <Tag color="gold">★ {game.rating}</Tag>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setIsEditOpen(true)}>Editar</Button>
            <Button danger onClick={handleDelete}>Eliminar</Button>
          </div>
        </div>
      </div>

      {/* Opinion + Notes cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <OpinionCard game={game} />

        {game.notes && game.notes.trim().length > 0 && (
          <Card title="Notas" style={{ flex: 1, minWidth: 200 }}>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {game.notes}
            </Typography.Paragraph>
          </Card>
        )}
      </div>

      {/* Edit modal */}
      <GameFormModal
        open={isEditOpen}
        mode="edit"
        game={game}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
