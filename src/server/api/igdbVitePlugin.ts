import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv } from 'vite'

import { handleIgdbGameByIdRequest, handleIgdbSearchRequest } from './igdb/handlers'

const SEARCH_PATH = '/api/igdb/search'
const GAME_PATH_RE = /^\/api\/igdb\/game\/([^/?#]+)/

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const protocol = 'http'
  const host = req.headers.host ?? 'localhost'
  const url = `${protocol}://${host}${req.url ?? '/'}`
  return new Request(url, { method: req.method ?? 'GET' })
}

async function sendWebResponse(res: ServerResponse, webRes: Response): Promise<void> {
  res.statusCode = webRes.status
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  const body = await webRes.text()
  res.end(body)
}

export function igdbVitePlugin(): Plugin {
  return {
    name: 'igdb-api',
    configResolved(config) {
      // Load .env vars into process.env so server-side middleware can read them
      const env = loadEnv(config.mode, config.root, '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
          process.env[key] = value
        }
      }
    },
    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url ?? ''

          if (url === SEARCH_PATH || url.startsWith(SEARCH_PATH + '?')) {
            const webReq = await toWebRequest(req)
            const webRes = await handleIgdbSearchRequest(webReq)
            await sendWebResponse(res, webRes)
            return
          }

          const gameMatch = GAME_PATH_RE.exec(url)
          if (gameMatch !== null) {
            const gameId = gameMatch[1] ?? ''
            const webReq = await toWebRequest(req)
            const webRes = await handleIgdbGameByIdRequest(webReq, gameId)
            await sendWebResponse(res, webRes)
            return
          }

          next()
        },
      )
    },
  }
}
