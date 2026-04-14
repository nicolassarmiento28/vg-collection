import type React from 'react'
import { useIgdbPopularGames } from '../hooks/useIgdbPopularGames'
import { useIgdbRecentGames } from '../hooks/useIgdbRecentGames'
import { PopularGameCard, PopularGameCardSkeleton } from './PopularGameCard'

interface PopularGamesSectionProps {
  title: string
  layout: 'carousel' | 'grid'
  hook: 'popular' | 'recent'
}

export function PopularGamesSection({ title, layout, hook }: PopularGamesSectionProps) {
  const popular = useIgdbPopularGames()
  const recent = useIgdbRecentGames()

  const { games, loading, error } = hook === 'popular' ? popular : recent

  const listStyle: React.CSSProperties =
    layout === 'carousel'
      ? {
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: 8,
        }
      : {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }

  return (
    <section style={{ marginBottom: 40 }}>
      {/* Shimmer keyframe defined once for all skeleton cards */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>

      {error !== null && (
        <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 8 }}>{error}</p>
      )}

      <div style={listStyle}>
        {loading
          ? Array.from({ length: 8 }, (_, i) =>
              layout === 'carousel' ? (
                <div key={i} style={{ scrollSnapAlign: 'start' }}>
                  <PopularGameCardSkeleton />
                </div>
              ) : (
                <PopularGameCardSkeleton key={i} />
              )
            )
          : games.map((game) =>
              layout === 'carousel' ? (
                <div key={game.id} style={{ scrollSnapAlign: 'start' }}>
                  <PopularGameCard game={game} />
                </div>
              ) : (
                <PopularGameCard key={game.id} game={game} />
              )
            )}
      </div>
    </section>
  )
}
