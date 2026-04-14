import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
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
              `https://id.twitch.tv/oauth2/token?client_id=${process.env.VITE_IGDB_CLIENT_ID}&client_secret=${process.env.VITE_IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
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
              proxyReq.setHeader('Client-ID', process.env.VITE_IGDB_CLIENT_ID ?? '')
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
  },
})
