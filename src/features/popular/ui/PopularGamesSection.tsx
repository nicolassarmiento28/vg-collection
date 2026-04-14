import { useIgdbPopularGames } from '../hooks/useIgdbPopularGames'
import { PopularGameCard, PopularGameCardSkeleton } from './PopularGameCard'

export function PopularGamesSection() {
  const { games, loading, error } = useIgdbPopularGames()

  return (
    <section
      style={{
        marginBottom: 40,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        POPULAR AHORA
      </h2>

      {error !== null && (
        <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 8 }}>{error}</p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: 8,
        }}
      >
        {loading
          ? Array.from({ length: 8 }, (_, i) => <PopularGameCardSkeleton key={i} />)
          : games.map((game) => <PopularGameCard key={game.id} game={game} />)}
      </div>
    </section>
  )
}
