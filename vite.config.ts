import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { igdbVitePlugin } from './src/server/api/igdbVitePlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), igdbVitePlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    testTimeout: 10000,
  },
})
