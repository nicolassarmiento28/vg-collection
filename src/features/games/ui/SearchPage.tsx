import { Button, Input, Spin } from 'antd'
import { useEffect, useState } from 'react'

import { searchIgdbGames } from '../api/igdbApi'
import type { IgdbGameDto } from '../api/igdbApi'
import { GameCard } from './GameCard'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [results, setResults] = useState<IgdbGameDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (submittedQuery.trim().length === 0) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(undefined)
      setResults([])

      try {
        const data = await searchIgdbGames(submittedQuery)
        if (!cancelled) setResults(data)
      } catch {
        if (!cancelled) setError('Error al buscar juegos. Intenta de nuevo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [submittedQuery])

  const handleSubmit = () => {
    const trimmed = query.trim()
    if (trimmed.length === 0) return
    setSubmittedQuery(trimmed)
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Search bar */}
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto 32px',
          display: 'flex',
          gap: 8,
        }}
      >
        <Input
          placeholder="Buscar juego en IGDB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSubmit}
          style={{ flex: 1 }}
        />
        <Button type="primary" onClick={handleSubmit}>
          Buscar
        </Button>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {error !== undefined && (
        <div style={{ textAlign: 'center', color: '#cc2200', padding: 16 }}>{error}</div>
      )}

      {!loading && error === undefined && submittedQuery.length > 0 && results.length === 0 && (
        <div style={{ textAlign: 'center', color: '#707070', padding: 16 }}>
          No se encontraron resultados para «{submittedQuery}»
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
