// src/features/collection/hooks/useCollectionCovers.ts
import { useEffect, useState } from 'react'
import type { Game } from '../../../shared/types/game'

interface CoverEntry {
  coverUrl: string
  igdbId: number
}

type CoversMap = Map<string, CoverEntry> // key: game.id

async function fetchCoverForGame(game: Game): Promise<[string, CoverEntry | null]> {
  const body = `search "${game.title.replace(/"/g, '')}"; fields name,cover.url,id; limit 1;`
  try {
    const res = await fetch('/api/igdb/games', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })
    if (!res.ok) return [game.id, null]
    const raw = (await res.json()) as unknown
    if (!Array.isArray(raw) || raw.length === 0) return [game.id, null]
    const hit = raw[0] as { id: number; cover?: { url: string } }
    if (!hit.cover?.url) return [game.id, null]
    const url = hit.cover.url
      .replace('t_thumb', 't_cover_big')
      .replace(/^\/\//, 'https://')
    return [game.id, { coverUrl: url, igdbId: hit.id }]
  } catch {
    return [game.id, null]
  }
}

async function fetchCoversInBatches(games: Game[], batchSize: number): Promise<CoversMap> {
  const map: CoversMap = new Map()
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(fetchCoverForGame))
    for (const [id, entry] of results) {
      if (entry !== null) map.set(id, entry)
    }
  }
  return map
}

export function useCollectionCovers(games: Game[]): CoversMap {
  const [covers, setCovers] = useState<CoversMap>(new Map())

  useEffect(() => {
    if (games.length === 0) {
      setCovers(new Map())
      return
    }

    let cancelled = false

    void fetchCoversInBatches(games, 5).then((map) => {
      if (!cancelled) setCovers(map)
    })

    return () => { cancelled = true }
  }, [games])

  return covers
}
