import { getTwitchAccessToken } from './twitchToken'

type TokenResolver = () => Promise<string>

let resolveToken: TokenResolver = getTwitchAccessToken

function getClientId(): string {
  const clientId = process.env.TWITCH_CLIENT_ID

  if (!clientId) {
    throw new Error('Missing Twitch client id')
  }

  return clientId
}

export function setIgdbTokenResolver(resolver: TokenResolver): void {
  resolveToken = resolver
}

export async function igdbRequest<TResponse>(endpoint: string, query: string): Promise<TResponse> {
  const token = await resolveToken()
  const clientId = getClientId()

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    body: query,
  })

  if (!response.ok) {
    throw new Error(`IGDB request failed: ${response.status}`)
  }

  return (await response.json()) as TResponse
}
