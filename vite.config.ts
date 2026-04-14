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

          async function getToken(): Promise<string> {
            if (cachedToken) return cachedToken
            const res = await fetch(
              `https://id.twitch.tv/oauth2/token?client_id=${process.env.VITE_IGDB_CLIENT_ID}&client_secret=${process.env.VITE_IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
              { method: 'POST' },
            )
            const data = (await res.json()) as { access_token: string }
            cachedToken = data.access_token
            return cachedToken
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          proxy.on('proxyReq', (proxyReq: any) => {
            void getToken().then((token) => {
              proxyReq.setHeader('Client-ID', process.env.VITE_IGDB_CLIENT_ID ?? '')
              proxyReq.setHeader('Authorization', `Bearer ${token}`)
            })
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
