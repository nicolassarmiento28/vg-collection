import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    if (layout !== 'carousel') return
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [layout, updateArrows, loading])

  function scrollBy(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 196
    el.scrollBy({ left: direction === 'left' ? -(cardWidth * 3) : cardWidth * 3, behavior: 'smooth' })
  }

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

  const arrowStyle = (visible: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 22,
    lineHeight: 1,
    cursor: visible ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transition: 'opacity 0.2s',
  })

  return (
    <section style={{ marginBottom: 40 }}>
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

      <div style={{ position: 'relative' }}>
        {layout === 'carousel' && (
          <button
            aria-label="Anterior"
            tabIndex={canScrollLeft ? 0 : -1}
            style={{ ...arrowStyle(canScrollLeft), left: 8 }}
            onClick={() => scrollBy('left')}
          >
            ‹
          </button>
        )}

        <div ref={layout === 'carousel' ? scrollRef : undefined} style={listStyle}>
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

        {layout === 'carousel' && (
          <button
            aria-label="Siguiente"
            tabIndex={canScrollRight ? 0 : -1}
            style={{ ...arrowStyle(canScrollRight), right: 8 }}
            onClick={() => scrollBy('right')}
          >
            ›
          </button>
        )}
      </div>
    </section>
  )
}
