// src/features/games/ui/GameDetailPage.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Tag } from 'antd'
import { ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons'
import { useIgdbGameDetail } from '../hooks/useIgdbGameDetail'
import { useGamesContext } from '../state/GamesContext'
import { useAuthContext } from '../../auth/state/AuthContext'
import type { GameFormPrefill, Platform } from '../../../shared/types/game'

const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  PS1: 'ps1', PS2: 'ps2', PS3: 'ps3',
  PS4: 'ps4', PS5: 'ps5',
  XB: 'xbox', X360: 'xbox360', XONE: 'xbone', XSX: 'xbsx',
  NS: 'switch',
  iOS: 'other', Android: 'other',
}

function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

function GameDetailSkeleton() {
  return (
    <div>
      {/* Banner skeleton */}
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
      {/* Body skeleton */}
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

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { game, loading, error } = useIgdbGameDetail(id ?? '')
  const { state: gamesState, dispatch } = useGamesContext()
  const { state: authState, dispatch: authDispatch } = useAuthContext()

  if (loading) return <GameDetailSkeleton />

  if (error || game === null) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          No se pudo cargar el juego
        </div>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Volver
        </Button>
      </div>
    )
  }

  const coverUrl = game.cover?.url ? getCoverUrl(game.cover.url) : null
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null

  const developer = game.involved_companies?.find((c) => c.developer)?.company.name ?? null

  const rating = game.total_rating !== undefined
    ? Math.round(game.total_rating * 10) / 10
    : null

  const platformLabels = game.platforms?.map((p) => p.abbreviation).join(', ') ?? null
  const genreLabels = game.genres?.map((g) => g.name).join(', ') ?? null

  // Check if game already in collection (by title, case-insensitive)
  const alreadyInCollection = gamesState.games.some(
    (g) => g.title.toLowerCase() === game.name.toLowerCase()
  )

  function handleAddToCollection() {
    if (!authState.isLoggedIn) {
      authDispatch({ type: 'openModal' })
      return
    }

    const platform: Platform =
      game.platforms
        ?.map((p) => IGDB_PLATFORM_MAP[p.abbreviation])
        .find((p) => p !== undefined) ?? 'other'

    const prefill: Partial<GameFormPrefill> = {
      title: game.name,
      ...(year !== null ? { year } : {}),
      platform,
    }

    dispatch({ type: 'openCreateModal', payload: prefill })
  }

  return (
    <>
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ color: 'var(--text-muted)', marginBottom: 16, paddingLeft: 0 }}
      >
        Volver
      </Button>

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
        {/* Portada superpuesta — emerge hacia abajo */}
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: 32,
            width: 120,
            height: 170,
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game.name}
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

        {/* Título y desarrollador en el banner */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 176,
            right: 24,
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
            {game.name}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {[developer, year].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {/* Body — con padding para dejar espacio a la portada superpuesta */}
      <div style={{ paddingLeft: 32, maxWidth: 800 }}>
        {/* Descripción */}
        {game.summary && (
          <p
            style={{
              color: 'var(--text)',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 28,
              marginTop: 0,
            }}
          >
            {game.summary}
          </p>
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
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Rating</div>
            <div style={{ fontSize: 18, color: 'var(--text-h)', fontWeight: 600 }}>
              {rating !== null ? `⭐ ${rating}` : '—'}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Plataforma</div>
            <div style={{ fontSize: 14, color: 'var(--text-h)' }}>{platformLabels ?? '—'}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Lanzamiento</div>
            <div style={{ fontSize: 18, color: 'var(--text-h)', fontWeight: 600 }}>{year ?? '—'}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Género</div>
            <div style={{ fontSize: 14, color: 'var(--text-h)' }}>{genreLabels ?? '—'}</div>
          </div>
        </div>

        {/* Plataformas como tags */}
        {game.platforms && game.platforms.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {game.platforms.map((p) => (
              <Tag key={p.abbreviation} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {p.abbreviation}
              </Tag>
            ))}
          </div>
        )}

        {/* Botón agregar / badge ya en colección */}
        {alreadyInCollection ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(39,174,96,0.12)',
              border: '1px solid #27ae60',
              borderRadius: 6,
              padding: '10px 20px',
              color: '#27ae60',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <CheckCircleFilled />
            Ya en tu colección
          </div>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={handleAddToCollection}
            style={{ borderRadius: 6 }}
          >
            + Agregar a mi colección
          </Button>
        )}
      </div>
    </>
  )
}
