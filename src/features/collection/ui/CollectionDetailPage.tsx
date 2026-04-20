// src/features/collection/ui/CollectionDetailPage.tsx
import { ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons'
import { App as AntdApp, Button, Card, Divider, Grid, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeOptionalRating } from '../../../shared/utils/rating'
import { GameFormModal, type GameFormValues } from '../../games/ui/GameFormModal'
import { useGamesContext } from '../../games/state/GamesContext'
import { useIgdbGameDetail } from '../../games/hooks/useIgdbGameDetail'
import { PLATFORM_LABELS } from '../../../shared/types/game'
import type { Game } from '../../../shared/types/game'
import { STATUS_LABELS, STATUS_TAG_COLORS } from '../../../shared/constants/gameStatus'

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

function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

function GameDetailSkeleton() {
  return (
    <div>
      <div
        style={{
          height: 220,
          background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 8,
          marginBottom: 40,
        }}
      />
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[200, 400, 300].map((w, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: w,
              background: 'var(--bg-elevated)',
              borderRadius: 4,
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Sub-component: layout when igdbId is present ───────────────────────────

interface IgdbEnrichedViewProps {
  game: Game
  isMobile: boolean
  onEdit: () => void
  onDelete: () => void
}

function IgdbEnrichedView({ game, isMobile, onEdit, onDelete }: IgdbEnrichedViewProps) {
  const { game: igdbGame, loading, error } = useIgdbGameDetail(String(game.igdbId))

  // "En tu colección" user section — always visible, even while IGDB loads
  const userSection = (
    <>
      <Divider style={{ margin: '32px 0 24px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(39,174,96,0.12)',
            border: '1px solid #27ae60',
            borderRadius: 6,
            padding: '6px 16px',
            color: '#27ae60',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <CheckCircleFilled />
          En tu colección
        </span>
      </Divider>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <Tag color={STATUS_TAG_COLORS[game.status]}>{STATUS_LABELS[game.status]}</Tag>
        {game.rating !== undefined && <Tag color="gold">★ {game.rating}</Tag>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Button onClick={onEdit}>Editar</Button>
        <Button danger onClick={onDelete}>Eliminar</Button>
      </div>

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
    </>
  )

  if (loading) {
    return (
      <>
        <GameDetailSkeleton />
        {userSection}
      </>
    )
  }

  if (error !== null || igdbGame === null) {
    // IGDB failed — fall back to plain layout + show user data
    return (
      <>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          No se pudo cargar la información de IGDB.
        </p>
        {userSection}
      </>
    )
  }

  const igdbCoverUrl = igdbGame.cover?.url ? getCoverUrl(igdbGame.cover.url) : null
  const igdbYear = igdbGame.first_release_date
    ? new Date(igdbGame.first_release_date * 1000).getFullYear()
    : null
  const developer =
    igdbGame.involved_companies?.find((c) => c.developer)?.company.name ?? null
  const igdbRating =
    igdbGame.total_rating !== undefined
      ? Math.round(igdbGame.total_rating * 10) / 10
      : null
  const platformLabels = igdbGame.platforms?.map((p) => p.abbreviation).join(', ') ?? null
  const genreLabels = igdbGame.genres?.map((g) => g.name).join(', ') ?? null

  return (
    <>
      {/* Banner hero */}
      <div
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 8,
          background: `linear-gradient(135deg, var(--bg-surface) 0%, rgba(192,57,43,0.3) 100%)`,
          marginBottom: 40,
          overflow: 'visible',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: isMobile ? 12 : 32,
            width: isMobile ? 80 : 120,
            height: isMobile ? 110 : 170,
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}
        >
          {igdbCoverUrl ? (
            <img
              src={igdbCoverUrl}
              alt={igdbGame.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                color: 'var(--text-muted)',
              }}
            >
              🎮
            </div>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: isMobile ? 108 : 176,
            right: isMobile ? 12 : 24,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--text-h)',
              letterSpacing: 1,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {igdbGame.name}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {[developer, igdbYear].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ paddingLeft: isMobile ? 0 : 32, maxWidth: isMobile ? '100%' : 800 }}>
        {igdbGame.summary && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Descripción
            </div>
            <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              {igdbGame.summary}
            </p>
          </div>
        )}

        {/* Stats grid 2×2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 28,
            maxWidth: 500,
          }}
        >
          {[
            { label: 'Rating', value: igdbRating !== null ? `⭐ ${igdbRating}` : '—' },
            { label: 'Plataforma', value: platformLabels ?? '—' },
            { label: 'Lanzamiento', value: igdbYear !== null ? String(igdbYear) : '—' },
            { label: 'Género', value: genreLabels ?? '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 15, color: 'var(--text-h)', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Platform tags */}
        {igdbGame.platforms && igdbGame.platforms.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {igdbGame.platforms.map((p) => (
              <Tag
                key={p.abbreviation}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {p.abbreviation}
              </Tag>
            ))}
          </div>
        )}

        {userSection}
      </div>
    </>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

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

      {/* Enriched layout (IGDB) or plain layout */}
      {game.igdbId !== undefined ? (
        <IgdbEnrichedView
          game={game}
          isMobile={isMobile}
          onEdit={() => setIsEditOpen(true)}
          onDelete={handleDelete}
        />
      ) : (
        <>
          {/* Plain layout — no igdbId */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 24,
              marginBottom: 32,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ width: isMobile ? '100%' : 200, flexShrink: 0 }}>
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

              <Typography.Text
                style={{ color: 'var(--text-muted)', fontSize: 15, display: 'block', marginBottom: 12 }}
              >
                {PLATFORM_LABELS[game.platform]} · {game.year} · {game.genre}
              </Typography.Text>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Tag color={STATUS_TAG_COLORS[game.status]}>{STATUS_LABELS[game.status]}</Tag>
                {game.rating !== undefined && <Tag color="gold">★ {game.rating}</Tag>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button onClick={() => setIsEditOpen(true)}>Editar</Button>
                <Button danger onClick={handleDelete}>Eliminar</Button>
              </div>
            </div>
          </div>

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
        </>
      )}

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
