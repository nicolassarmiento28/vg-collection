export interface IgdbGamePayload {
  id: number
  slug: string
  name: string
  summary?: string
  first_release_date?: number
  cover?: {
    url?: string
  }
  genres?: Array<{ name?: string }>
  platforms?: Array<{ slug?: string }>
}

export interface IgdbGameDto {
  id: number
  slug: string
  name: string
  summary?: string
  firstReleaseDate?: string
  coverUrl?: string
  genres: string[]
  platforms: string[]
}

function normalizeCoverUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined
  }

  const withProtocol = url.startsWith('//') ? `https:${url}` : url
  return withProtocol.replace('/t_thumb/', '/t_cover_big/')
}

function toIsoDate(timestamp: number | undefined): string | undefined {
  if (timestamp === undefined) {
    return undefined
  }

  return new Date(timestamp * 1000).toISOString().slice(0, 10)
}

export function mapIgdbGameToDto(payload: IgdbGamePayload): IgdbGameDto {
  return {
    id: payload.id,
    slug: payload.slug,
    name: payload.name,
    summary: payload.summary,
    firstReleaseDate: toIsoDate(payload.first_release_date),
    coverUrl: normalizeCoverUrl(payload.cover?.url),
    genres: (payload.genres ?? []).flatMap((genre) => (genre.name ? [genre.name] : [])),
    platforms: (payload.platforms ?? []).flatMap((platform) =>
      platform.slug ? [platform.slug] : [],
    ),
  }
}
