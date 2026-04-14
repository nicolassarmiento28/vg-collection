// src/features/collection/ui/CollectionPage.tsx
import { LockOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Grid, Input, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../auth/state/AuthContext'
import { useGamesContext } from '../../games/state/GamesContext'
import { GameFormModal, type GameFormValues } from '../../games/ui/GameFormModal'
import { normalizeOptionalRating } from '../../games/ui/GamesPage'
import { useCollectionCovers } from '../hooks/useCollectionCovers'
import { PLATFORM_LABELS } from '../../../shared/types/game'
import type { Game, GameStatus, Platform } from '../../../shared/types/game'

// --- Status badge colors ---
const STATUS_COLORS: Record<GameStatus, { bg: string; text: string; label: string }> = {
  backlog:   { bg: 'rgba(127,140,141,0.2)', text: '#7f8c8d', label: 'Backlog' },
  playing:   { bg: 'rgba(230,126,34,0.2)',  text: '#e67e22', label: 'Jugando' },
  completed: { bg: 'rgba(39,174,96,0.2)',   text: '#27ae60', label: 'Completado' },
  paused:    { bg: 'rgba(52,152,219,0.2)',  text: '#3498db', label: 'Pausado' },
  dropped:   { bg: 'rgba(192,57,43,0.2)',   text: '#c0392b', label: 'Abandonado' },
}

const STATUS_OPTIONS: Array<{ value: GameStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'playing', label: 'Jugando' },
  { value: 'completed', label: 'Completado' },
  { value: 'paused', label: 'Pausado' },
  { value: 'dropped', label: 'Abandonado' },
]

type PlatformFilter = Platform | 'all'

const PLATFORM_FILTER_GROUPS: Array<{ label: string; platforms: Platform[] }> = [
  { label: 'Sega',        platforms: ['sega-ms', 'sega-md', 'sega-saturn', 'sega-dc'] },
  { label: 'Nintendo',    platforms: ['nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch', 'gameboy', 'gbc', 'gba', 'nds', '3ds'] },
  { label: 'PlayStation', platforms: ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'psp', 'psvita'] },
  { label: 'Microsoft',   platforms: ['xbox', 'xbox360', 'xbone', 'xbsx'] },
  { label: 'PC',          platforms: ['pc'] },
  { label: 'Commodore',   platforms: ['c64', 'amiga'] },
  { label: 'Otra',        platforms: ['other'] },
]

// --- Chip component ---
interface ChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 14px',
        borderRadius: 16,
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'rgba(192,57,43,0.12)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  )
}

// --- Game card initials fallback ---
function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// --- CollectionCard ---
interface CollectionCardProps {
  game: Game
  coverUrl: string | undefined
  igdbId: number | undefined
  onEdit: (game: Game) => void
  onComplete: (id: string) => void
}

function CollectionCard({ game, coverUrl, igdbId, onEdit, onComplete }: CollectionCardProps) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const status = STATUS_COLORS[game.status]

  return (
    <div
      style={{
        width: 180,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        cursor: 'default',
        transition: 'transform 200ms, box-shadow 200ms',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hovered ? '0 0 18px var(--accent-dim)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image / fallback */}
      <div style={{ width: 180, height: 240, position: 'relative', overflow: 'hidden' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={game.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-muted)',
              letterSpacing: 2,
            }}
          >
            {getInitials(game.title)}
          </div>
        )}

        {/* Status badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: status.bg,
            color: status.text,
            border: `1px solid ${status.text}`,
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 4,
          }}
        >
          {status.label}
        </div>

        {/* Hover overlay */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 12,
            }}
          >
            <Button size="small" block onClick={() => onEdit(game)}>
              Editar
            </Button>
            {igdbId !== undefined && (
              <Button size="small" block onClick={() => navigate(`/juego/${igdbId}`)}>
                Ver detalle
              </Button>
            )}
            {game.status !== 'completed' && (
              <Button size="small" block type="primary" onClick={() => onComplete(game.id)}>
                Completar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info below image */}
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            color: 'var(--text-h)',
            lineHeight: 1.3,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {game.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {PLATFORM_LABELS[game.platform]} · {game.year}
        </div>
        {game.rating !== undefined && (
          <div style={{ fontSize: 12, color: '#f39c12', marginTop: 2 }}>
            ★ {game.rating}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Gate placeholder ---
function CollectionGatePlaceholder() {
  const { dispatch } = useAuthContext()
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
        MI COLECCIÓN
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '64px 24px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
        }}
      >
        <LockOutlined style={{ fontSize: 40, color: 'var(--text-muted)' }} />
        <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para ver tu colección
        </Typography.Text>
        <Button type="primary" onClick={() => dispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    </>
  )
}

// --- Main CollectionPage ---
export function CollectionPage() {
  const { state: authState } = useAuthContext()
  const { state, dispatch } = useGamesContext()
  const { message } = AntdApp.useApp()

  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md  // < 768px

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')

  // Edit modal state
  const [editingGame, setEditingGame] = useState<Game | undefined>(undefined)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const covers = useCollectionCovers(state.games)

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase()
    return state.games.filter((g) => {
      const matchSearch = q.length === 0 || g.title.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || g.status === statusFilter
      const matchPlatform = platformFilter === 'all' || g.platform === platformFilter
      return matchSearch && matchStatus && matchPlatform
    })
  }, [state.games, search, statusFilter, platformFilter])

  function handleEdit(game: Game) {
    setEditingGame(game)
    setIsEditModalOpen(true)
  }

  function handleComplete(id: string) {
    dispatch({ type: 'markGameCompleted', payload: { id } })
    void message.success('Juego marcado como completado')
  }

  function handleEditSubmit(values: GameFormValues) {
    if (editingGame === undefined) return
    const rating = normalizeOptionalRating(values.rating)
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
    setIsEditModalOpen(false)
    setEditingGame(undefined)
  }

  // Add game via GlobalGameFormModal (triggered by openCreateModal)
  function handleAddGame() {
    dispatch({ type: 'openCreateModal', payload: undefined })
  }

  if (!authState.isLoggedIn) return <CollectionGatePlaceholder />

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: 'var(--text-h)',
            letterSpacing: 3,
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
          MI COLECCIÓN
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddGame}
        >
          Agregar juego
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar en tu colección…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{
          marginBottom: 12,
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          borderRadius: 8,
          width: isMobile ? '100%' : undefined,
          maxWidth: isMobile ? undefined : 400,
        }}
      />

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {STATUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={statusFilter === opt.value}
            onClick={() => setStatusFilter(statusFilter === opt.value && opt.value !== 'all' ? 'all' : opt.value)}
          />
        ))}
      </div>

      {/* Platform chips */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <Chip
            label="Todas"
            active={platformFilter === 'all'}
            onClick={() => setPlatformFilter('all')}
          />
        </div>
        {PLATFORM_FILTER_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              {group.label}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : undefined, paddingBottom: isMobile ? 4 : 0 }}>
              {group.platforms.map((platform) => (
                <Chip
                  key={platform}
                  label={PLATFORM_LABELS[platform]}
                  active={platformFilter === platform}
                  onClick={() =>
                    setPlatformFilter(platformFilter === platform ? 'all' : platform)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredGames.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border)',
            borderRadius: 8,
          }}
        >
          {state.games.length === 0
            ? 'Tu colección está vacía. ¡Agregá tu primer juego!'
            : 'Sin resultados para los filtros aplicados.'}
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 180}px, 1fr))`,
          gap: isMobile ? 12 : 20,
        }}
      >
        {filteredGames.map((game) => {
          const coverEntry = covers.get(game.id)
          return (
            <CollectionCard
              key={game.id}
              game={game}
              coverUrl={coverEntry?.coverUrl}
              igdbId={coverEntry?.igdbId}
              onEdit={handleEdit}
              onComplete={handleComplete}
            />
          )
        })}
      </div>

      {/* Edit modal */}
      <GameFormModal
        open={isEditModalOpen}
        mode="edit"
        game={editingGame}
        onCancel={() => { setIsEditModalOpen(false); setEditingGame(undefined) }}
        onSubmit={handleEditSubmit}
      />
    </>
  )
}

