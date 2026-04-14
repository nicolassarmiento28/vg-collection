import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbSearchResult {
  results: IgdbGame[]
  loading: boolean
}

export function useIgdbSearch(query: string): UseIgdbSearchResult {
  const [results, setResults] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let debounceTimer: ReturnType<typeof setTimeout>

    debounceTimer = setTimeout(() => {
      setLoading(true)
      const body = `search "${trimmed}"; fields name,cover.url,first_release_date,platforms.abbreviation; limit 8;`

      fetch('/api/igdb/games', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`IGDB ${r.status}`)
          return r.json() as Promise<unknown>
        })
        .then((raw) => {
          if (Array.isArray(raw)) setResults(raw as IgdbGame[])
        })
        .catch((err) => {
          if ((err as Error).name !== 'AbortError') setResults([])
        })
        .finally(() => setLoading(false))
    }, 400)

    return () => {
      clearTimeout(debounceTimer)
      controller.abort()
    }
  }, [query])

  return { results, loading }
}
