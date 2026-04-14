// src/features/games/hooks/useIgdbGameDetail.ts
import { useEffect, useState } from 'react'
import type { IgdbGame } from '../../popular/types'

interface UseIgdbGameDetailResult {
  game: IgdbGame | null
  loading: boolean
  error: string | null
}

export function useIgdbGameDetail(id: string): UseIgdbGameDetailResult {
  const [game, setGame] = useState<IgdbGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setGame(null)
    setLoading(true)
    setError(null)

    const body = [
      'fields name,cover.url,first_release_date,platforms.abbreviation,',
      'total_rating,total_rating_count,summary,genres.name,',
      'involved_companies.company.name,involved_companies.developer;',
      `where id = ${id};`,
      'limit 1;',
    ].join('')

    fetch('/api/igdb/games', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`IGDB ${r.status}`)
        return r.json() as Promise<unknown>
      })
      .then((raw) => {
        if (!Array.isArray(raw) || raw.length === 0) throw new Error('Juego no encontrado')
        if (!cancelled) setGame(raw[0] as IgdbGame)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { game, loading, error }
}
