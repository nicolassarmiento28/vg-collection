import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbPopularGamesResult {
  games: IgdbGame[]
  loading: boolean
  error: string | null
}

const IGDB_QUERY = `
fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
where total_rating_count > 100 & cover != null;
sort total_rating desc;
limit 20;
`.trim()

export function useIgdbPopularGames(): UseIgdbPopularGamesResult {
  const [games, setGames] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGames() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/igdb/games', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: IGDB_QUERY,
        })
        if (!res.ok) throw new Error(`IGDB error ${res.status}`)
        const raw = (await res.json()) as unknown
        if (!Array.isArray(raw)) throw new Error('Unexpected IGDB response shape')
        const data = raw as IgdbGame[]
        if (!cancelled) setGames(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar juegos populares')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchGames()
    return () => { cancelled = true }
  }, [])

  return { games, loading, error }
}
