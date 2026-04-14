// src/features/popular/ui/PopularGameCard.tsx
import { useNavigate } from 'react-router-dom'
import type { IgdbGame } from '../types'

/** Converts IGDB cover URL from t_thumb to t_cover_big (264×374) */
function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

interface PopularGameCardProps {
  game: IgdbGame
}

export function PopularGameCard({ game }: PopularGameCardProps) {
  const navigate = useNavigate()
  const coverUrl = getCoverUrl(game.cover.url)
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${game.name}`}
      onClick={() => navigate(`/juego/${game.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/juego/${game.id}`) }}
      style={{
        width: 180,
        flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.04)'
        el.style.boxShadow = '0 0 18px var(--accent-dim)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
        el.style.boxShadow = 'none'
      }}
    >
      <img
        src={coverUrl}
        alt={game.name}
        width={180}
        height={240}
        style={{ display: 'block', objectFit: 'cover', width: '100%', height: 240 }}
        loading="lazy"
      />
      {/* Title overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(15,14,14,0.95))',
          padding: '20px 10px 10px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            color: 'var(--text-h)',
            lineHeight: 1.2,
            letterSpacing: 0.5,
          }}
        >
          {game.name}
        </div>
        {year !== null && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text)',
              marginTop: 2,
            }}
          >
            {year}
          </div>
        )}
      </div>
    </div>
  )
}

/** Skeleton card shown while IGDB data is loading */
export function PopularGameCardSkeleton() {
  return (
    <div
      style={{
        width: 180,
        height: 240,
        flexShrink: 0,
        borderRadius: 8,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(
            90deg,
            var(--bg-surface) 25%,
            var(--bg-elevated) 50%,
            var(--bg-surface) 75%
          )`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  )
}
