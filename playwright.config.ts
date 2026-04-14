// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    {
      name: 'mobile-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'mobile-14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-pixel',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'tablet-mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'tablet-pro',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'desktop-hd',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
})
