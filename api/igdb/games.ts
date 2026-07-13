type VercelRequest = {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

interface TwitchTokenResponse {
  access_token: string
  expires_in: number
}

let cachedToken: string | null = null
let tokenExpiresAtMs = 0

function getEnv(name: string): string {
  const value = process.env[name]
  return typeof value === 'string' ? value : ''
}

async function fetchTwitchToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now()

  if (cachedToken !== null && now < tokenExpiresAtMs) {
    return cachedToken
  }

  const tokenUrl =
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`

  const tokenRes = await fetch(tokenUrl, { method: 'POST' })
  if (!tokenRes.ok) {
    throw new Error(`Twitch token error ${tokenRes.status}`)
  }

  const tokenData = (await tokenRes.json()) as TwitchTokenResponse
  cachedToken = tokenData.access_token

  // Refresh 60 seconds before expiration.
  tokenExpiresAtMs = now + Math.max((tokenData.expires_in - 60) * 1000, 0)

  return cachedToken
}

function parseBody(body: unknown): string {
  if (typeof body === 'string') {
    return body
  }

  if (body === null || body === undefined) {
    return ''
  }

  if (typeof body === 'object') {
    return JSON.stringify(body)
  }

  return String(body)
}

const MAX_QUERY_LENGTH = 500
// ponytail: allowlist of chars an APICalypse query needs; blocks control chars / query-breaking injection
const VALID_QUERY_PATTERN = /^[\w\s"'.,;:=<>!&|()*_-]+$/

function isValidQuery(query: string): boolean {
  return query.length <= MAX_QUERY_LENGTH && VALID_QUERY_PATTERN.test(query)
}

// ponytail: in-memory sliding window, per-instance only; move to Vercel KV/Upstash if traffic outgrows a single instance
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 30
const requestLog = new Map<string, number[]>()

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers?.['x-forwarded-for']
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return value?.split(',')[0]?.trim() ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (isRateLimited(getClientIp(req))) {
    res.status(429).json({ error: 'Demasiadas solicitudes, esperá un momento e intentá de nuevo' })
    return
  }

  const clientId = getEnv('TWITCH_CLIENT_ID')
  const clientSecret = getEnv('TWITCH_CLIENT_SECRET')

  if (clientId.length === 0 || clientSecret.length === 0) {
    res.status(500).json({ error: 'Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET' })
    return
  }

  const query = parseBody(req.body).trim()
  if (query.length === 0) {
    res.status(400).json({ error: 'Empty IGDB query body' })
    return
  }

  if (!isValidQuery(query)) {
    res.status(400).json({ error: 'Invalid IGDB query body' })
    return
  }

  try {
    const accessToken = await fetchTwitchToken(clientId, clientSecret)

    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    })

    const text = await igdbRes.text()

    if (!igdbRes.ok) {
      res.status(igdbRes.status).json({ error: 'IGDB request failed', details: text })
      return
    }

    try {
      const json = JSON.parse(text) as unknown
      res.status(200).json(json)
    } catch {
      res.status(502).json({ error: 'Invalid JSON from IGDB', details: text })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
}
