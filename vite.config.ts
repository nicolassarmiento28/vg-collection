import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including those without VITE_ prefix) for server-side use
  const env = loadEnv(mode, process.cwd(), '')
  const clientId = env.TWITCH_CLIENT_ID ?? ''
  const clientSecret = env.TWITCH_CLIENT_SECRET ?? ''

  return {
  plugins: [react()],
  server: {
    proxy: {
      '/api/igdb': {
        target: 'https://api.igdb.com/v4',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/igdb/, ''),
        configure: (proxy) => {
          let cachedToken: string | null = null

          function fetchToken(): Promise<string> {
            return fetch(
              `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
              { method: 'POST' },
            )
              .then((r) => r.json() as Promise<{ access_token: string }>)
              .then((d) => {
                cachedToken = d.access_token
                return cachedToken
              })
          }

          // Pre-warm the token so it's cached before the first request arrives
          void fetchToken()

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          proxy.on('proxyReq', (proxyReq: any) => {
            if (cachedToken) {
              proxyReq.setHeader('Client-ID', clientId)
              proxyReq.setHeader('Authorization', `Bearer ${cachedToken}`)
            }
          })
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', '**/.worktrees/**'],
    testTimeout: 15000,
  },
  }
})
