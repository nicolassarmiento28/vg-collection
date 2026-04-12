interface CachedToken {
  accessToken: string
  expiresAt: number
}

const CACHE_BUFFER_MS = 60_000

let cachedToken: CachedToken | null = null
let pendingRequest: Promise<string> | null = null

function getRequiredEnv(name: 'TWITCH_CLIENT_ID' | 'TWITCH_CLIENT_SECRET'): string {
  const value = process.env[name]

  if (!value) {
    throw new Error('Missing Twitch credentials')
  }

  return value
}

function isCachedTokenValid(now: number): boolean {
  if (cachedToken === null) {
    return false
  }

  return now < cachedToken.expiresAt - CACHE_BUFFER_MS
}

async function requestTokenFromTwitch(): Promise<string> {
  const clientId = getRequiredEnv('TWITCH_CLIENT_ID')
  const clientSecret = getRequiredEnv('TWITCH_CLIENT_SECRET')

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Twitch token: ${response.status}`)
  }

  const payload: unknown = await response.json()

  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as Record<string, unknown>).access_token !== 'string' ||
    typeof (payload as Record<string, unknown>).expires_in !== 'number'
  ) {
    throw new Error('Invalid Twitch token response')
  }

  const accessToken = (payload as Record<string, unknown>).access_token as string
  const expiresIn = (payload as Record<string, unknown>).expires_in as number

  cachedToken = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  return accessToken
}

export async function getTwitchAccessToken(): Promise<string> {
  const now = Date.now()

  if (isCachedTokenValid(now)) {
    return cachedToken!.accessToken
  }

  if (pendingRequest !== null) {
    return pendingRequest
  }

  pendingRequest = requestTokenFromTwitch().finally(() => {
    pendingRequest = null
  })

  return pendingRequest
}

export function resetTwitchTokenCacheForTests(): void {
  cachedToken = null
  pendingRequest = null
}
