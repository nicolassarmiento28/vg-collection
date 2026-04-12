import { igdbRequest } from '../../igdb/igdbClient'
import { mapIgdbGameToDto, type IgdbGamePayload, type IgdbGameDto } from '../../igdb/igdbMapper'

type IgdbRequestResolver = <TResponse = unknown>(endpoint: string, query: string) => Promise<TResponse>

let resolveIgdbRequest: IgdbRequestResolver = igdbRequest

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

function buildSearchQuery(term: string): string {
  return [
    'fields id,slug,name,summary,first_release_date,cover.url,genres.name,platforms.slug;',
    `search "${term.replace(/"/g, '\\"')}";`,
    'limit 10;',
  ].join(' ')
}

function buildGameByIdQuery(id: string): string {
  return [
    'fields id,slug,name,summary,first_release_date,cover.url,genres.name,platforms.slug;',
    `where id = ${id};`,
    'limit 1;',
  ].join(' ')
}

function parseId(rawId: string): number | null {
  const value = Number(rawId)

  if (!Number.isInteger(value) || value <= 0) {
    return null
  }

  return value
}

export function setIgdbRequestResolver(resolver: IgdbRequestResolver): void {
  resolveIgdbRequest = resolver
}

export async function handleIgdbSearchRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim() ?? ''

  if (query.length === 0) {
    return jsonResponse({ error: 'Missing query parameter q' }, 400)
  }

  try {
    const result = await resolveIgdbRequest<IgdbGamePayload[]>('games', buildSearchQuery(query))
    const mapped = result.map(mapIgdbGameToDto)

    return jsonResponse(mapped)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown IGDB error'
    return jsonResponse({ error: message }, 502)
  }
}

export async function handleIgdbGameByIdRequest(request: Request, gameId: string): Promise<Response> {
  void request

  if (parseId(gameId) === null) {
    return jsonResponse({ error: 'Invalid game id' }, 400)
  }

  try {
    const result = await resolveIgdbRequest<IgdbGamePayload[]>('games', buildGameByIdQuery(gameId))
    const game = result[0]

    if (game === undefined) {
      return jsonResponse({ error: 'Game not found' }, 404)
    }

    const mapped: IgdbGameDto = mapIgdbGameToDto(game)
    return jsonResponse(mapped)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown IGDB error'
    return jsonResponse({ error: message }, 502)
  }
}
