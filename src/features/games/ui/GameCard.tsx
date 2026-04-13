import type { CSSProperties, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import type { IgdbGameDto } from '../api/igdbApi'

interface GameCardProps {
  game: IgdbGameDto
}

export function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate()
  const year = game.firstReleaseDate !== undefined
    ? new Date(game.firstReleaseDate).getUTCFullYear()
    : undefined
  const platform = game.platforms?.[0]

  const meta = [year, platform].filter((v): v is string | number => v !== undefined).join(' · ')

  const handleClick = () => {
    void navigate(`/game/${game.id}`)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') void navigate(`/game/${game.id}`)
  }

  const cardStyle: CSSProperties = {
    background: '#0a1f0a',
    border: '1px solid #1a4a1a',
    borderRadius: 6,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={game.name}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={cardStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(57, 255, 20, 0.5)'
        el.style.boxShadow = '0 0 12px rgba(57, 255, 20, 0.15)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = '#1a4a1a'
        el.style.boxShadow = 'none'
      }}
    >
      {game.coverUrl !== undefined ? (
        <img
          src={game.coverUrl}
          alt={game.name}
          style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            aspectRatio: '3/4',
            background: '#051005',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a4a1a',
            fontSize: 40,
          }}
        >
          🎮
        </div>
      )}

      <div style={{ padding: 12 }}>
        <div
          style={{
            color: '#a0a0a0',
            fontSize: 13,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 4,
            fontFamily: "'Courier New', Consolas, monospace",
          }}
        >
          {game.name}
        </div>
        {meta.length > 0 && (
          <div
            style={{
              color: '#606060',
              fontSize: 12,
              fontFamily: "'Courier New', Consolas, monospace",
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  )
}
