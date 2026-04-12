// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

import { igdbRequest, setIgdbTokenResolver } from './igdbClient'

describe('igdbRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls IGDB endpoint with Twitch auth headers', async () => {
    setIgdbTokenResolver(async () => 'server-token')
    process.env.TWITCH_CLIENT_ID = 'client-id'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, name: 'Halo' }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await igdbRequest<{ id: number; name: string }[]>('games', 'fields id,name; limit 1;')

    expect(result).toEqual([{ id: 1, name: 'Halo' }])
    expect(fetchSpy).toHaveBeenCalledWith('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': 'client-id',
        Authorization: 'Bearer server-token',
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: 'fields id,name; limit 1;',
    })
  })

  it('throws on non-OK IGDB responses', async () => {
    setIgdbTokenResolver(async () => 'server-token')
    process.env.TWITCH_CLIENT_ID = 'client-id'

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('blocked', {
        status: 403,
      }),
    )

    await expect(igdbRequest('games', 'fields id; limit 1;')).rejects.toThrow(
      'IGDB request failed: 403',
    )
  })
})
