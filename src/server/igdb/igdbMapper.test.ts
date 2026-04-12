import { describe, expect, it } from 'vitest'

import { mapIgdbGameToDto } from './igdbMapper'

describe('mapIgdbGameToDto', () => {
  it('maps IGDB payload to app DTO with normalized fields', () => {
    const dto = mapIgdbGameToDto({
      id: 7346,
      slug: 'the-legend-of-zelda-breath-of-the-wild',
      name: 'The Legend of Zelda: Breath of the Wild',
      summary: 'Open world action-adventure.',
      first_release_date: 1488499200,
      cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/co1r7f.jpg' },
      genres: [{ name: 'Action' }, { name: 'Adventure' }],
      platforms: [{ slug: 'switch' }],
    })

    expect(dto).toEqual({
      id: 7346,
      slug: 'the-legend-of-zelda-breath-of-the-wild',
      name: 'The Legend of Zelda: Breath of the Wild',
      summary: 'Open world action-adventure.',
      firstReleaseDate: '2017-03-03',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg',
      genres: ['Action', 'Adventure'],
      platforms: ['switch'],
    })
  })

  it('keeps optional fields undefined when source data is missing', () => {
    const dto = mapIgdbGameToDto({
      id: 12,
      slug: 'minimal-game',
      name: 'Minimal Game',
    })

    expect(dto.coverUrl).toBeUndefined()
    expect(dto.summary).toBeUndefined()
    expect(dto.firstReleaseDate).toBeUndefined()
    expect(dto.genres).toEqual([])
    expect(dto.platforms).toEqual([])
  })
})
