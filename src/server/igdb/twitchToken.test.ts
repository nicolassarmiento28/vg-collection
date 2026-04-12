// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

import { getTwitchAccessToken, resetTwitchTokenCacheForTests } from './twitchToken'

describe('getTwitchAccessToken', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    resetTwitchTokenCacheForTests()
    delete process.env.TWITCH_CLIENT_ID
    delete process.env.TWITCH_CLIENT_SECRET
  })

  it('requests a new token from Twitch when cache is empty', async () => {
    process.env.TWITCH_CLIENT_ID = 'client-id'
    process.env.TWITCH_CLIENT_SECRET = 'client-secret'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'token-1', expires_in: 3600 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const token = await getTwitchAccessToken()

    expect(token).toBe('token-1')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('reuses token from cache until expiration window', async () => {
    process.env.TWITCH_CLIENT_ID = 'client-id'
    process.env.TWITCH_CLIENT_SECRET = 'client-secret'

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'token-2', expires_in: 3600 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const first = await getTwitchAccessToken()
    const second = await getTwitchAccessToken()

    expect(first).toBe('token-2')
    expect(second).toBe('token-2')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('throws when credentials are missing', async () => {
    await expect(getTwitchAccessToken()).rejects.toThrow('Missing Twitch credentials')
  })
})
