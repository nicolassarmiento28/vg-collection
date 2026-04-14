import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbRecentGamesResult {
  games: IgdbGame[]
  loading: boolean
  error: string | null
}

export function useIgdbRecentGames(): UseIgdbRecentGamesResult {
  const [games, setGames] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGames() {
      setLoading(true)
      setError(null)

      const nowSec = Math.floor(Date.now() / 1000)
      const twoYearsAgoSec = nowSec - 2 * 365 * 24 * 60 * 60

      const query = [
        'fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;',
        `where cover != null & first_release_date < ${nowSec} & first_release_date > ${twoYearsAgoSec};`,
        'sort first_release_date desc;',
        'limit 20;',
      ].join('\n')

      try {
        const res = await fetch('/api/igdb/games', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query,
        })
        if (!res.ok) throw new Error(`IGDB error ${res.status}`)
        const raw = (await res.json()) as unknown
        if (!Array.isArray(raw)) throw new Error('Unexpected IGDB response shape')
        const data = raw as IgdbGame[]
        if (!cancelled) setGames(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar lanzamientos recientes')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchGames()
    return () => { cancelled = true }
  }, [])

  return { games, loading, error }
}
