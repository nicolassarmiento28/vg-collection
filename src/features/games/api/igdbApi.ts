export interface IgdbGameDto {
  id: number
  slug?: string
  name: string
  summary?: string
  firstReleaseDate?: string
  coverUrl?: string
  genres?: string[]
  platforms?: string[]
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.status}`)
  }

  return (await response.json()) as T
}

export async function searchIgdbGames(query: string): Promise<IgdbGameDto[]> {
  const encodedQuery = encodeURIComponent(query.trim())
  const response = await fetch(`/api/igdb/search?q=${encodedQuery}`, { method: 'GET' })

  return readJsonResponse<IgdbGameDto[]>(response)
}

export async function fetchIgdbGameById(id: number): Promise<IgdbGameDto> {
  const response = await fetch(`/api/igdb/game/${id}`, { method: 'GET' })

  return readJsonResponse<IgdbGameDto>(response)
}
