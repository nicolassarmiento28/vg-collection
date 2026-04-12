// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

import type { IgdbGamePayload } from '../../igdb/igdbMapper'
import { handleIgdbGameByIdRequest, handleIgdbSearchRequest, setIgdbRequestResolver } from './handlers'

function createResolver(result: IgdbGamePayload[]) {
  return async <TResponse>() => result as TResponse
}

describe('IGDB API handlers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns mapped search results from /api/igdb/search', async () => {
    setIgdbRequestResolver(createResolver([
      {
        id: 7346,
        slug: 'zelda-botw',
        name: 'The Legend of Zelda: Breath of the Wild',
        first_release_date: 1488499200,
      } satisfies IgdbGamePayload,
    ]))

    const response = await handleIgdbSearchRequest(new Request('http://localhost/api/igdb/search?q=zelda'))
    const payload = (await response.json()) as Array<{ id: number; name: string }>

    expect(response.status).toBe(200)
    expect(payload).toEqual([
      {
        id: 7346,
        slug: 'zelda-botw',
        name: 'The Legend of Zelda: Breath of the Wild',
        firstReleaseDate: '2017-03-03',
        genres: [],
        platforms: [],
      },
    ])
  })

  it('returns 400 when search query is missing', async () => {
    const response = await handleIgdbSearchRequest(new Request('http://localhost/api/igdb/search'))

    expect(response.status).toBe(400)
  })

  it('returns mapped game from /api/igdb/game/:id', async () => {
    setIgdbRequestResolver(createResolver([
      {
        id: 1,
        slug: 'halo-combat-evolved',
        name: 'Halo: Combat Evolved',
        genres: [{ name: 'Shooter' }],
      } satisfies IgdbGamePayload,
    ]))

    const response = await handleIgdbGameByIdRequest(
      new Request('http://localhost/api/igdb/game/1'),
      '1',
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      id: 1,
      slug: 'halo-combat-evolved',
      genres: ['Shooter'],
    })
  })
})
