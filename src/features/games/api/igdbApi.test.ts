import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchIgdbGameById, searchIgdbGames } from './igdbApi'

describe('igdbApi client', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('searches games through /api/igdb/search endpoint', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, name: 'Halo' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await searchIgdbGames('halo')

    expect(result).toEqual([{ id: 1, name: 'Halo' }])
    expect(fetch).toHaveBeenCalledWith('/api/igdb/search?q=halo', { method: 'GET' })
  })

  it('fetches game details through /api/igdb/game/:id endpoint', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 99, name: 'Metroid Prime' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await fetchIgdbGameById(99)

    expect(result).toEqual({ id: 99, name: 'Metroid Prime' })
    expect(fetch).toHaveBeenCalledWith('/api/igdb/game/99', { method: 'GET' })
  })
})
