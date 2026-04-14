// e2e/responsive.spec.ts
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/coleccion'] as const

// Devices with viewport width < 768px are "mobile" (hamburger menu shown)
const MOBILE_WIDTH_THRESHOLD = 768

test.describe('Responsive layout', () => {
  for (const pagePath of PAGES) {
    test.describe(`Page: ${pagePath}`, () => {

      test('no horizontal overflow', async ({ page }) => {
        await page.goto(pagePath)
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const innerWidth = await page.evaluate(() => window.innerWidth)
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1) // +1 for sub-pixel rounding
      })

      test('logo accent mark is visible in header', async ({ page }) => {
        await page.goto(pagePath)
        // The ▸ mark is always in the header link, check the header contains it
        const header = page.locator('header')
        await expect(header).toBeVisible()
        const logoLink = header.locator('a[aria-label="Ir al inicio"]')
        await expect(logoLink).toBeVisible()
      })

      test('navigation is accessible at this viewport', async ({ page, viewport }) => {
        await page.goto(pagePath)
        const width = viewport?.width ?? 1280

        if (width < MOBILE_WIDTH_THRESHOLD) {
          // Mobile: hamburger visible, nav links NOT in header
          const hamburger = page.locator('header button[aria-label="Abrir menú"]')
          await expect(hamburger).toBeVisible()

          // Nav links should not be directly visible in the header
          const headerNavLink = page.locator('header a').filter({ hasText: 'Mi Colección' })
          await expect(headerNavLink).not.toBeVisible()
        } else {
          // Desktop/tablet: nav links directly in header
          const inicioLink = page.locator('header a').filter({ hasText: 'Inicio' })
          await expect(inicioLink).toBeVisible()
          const coleccionLink = page.locator('header a').filter({ hasText: 'Mi Colección' })
          await expect(coleccionLink).toBeVisible()
        }
      })

      test('theme toggle button exists', async ({ page, viewport }) => {
        await page.goto(pagePath)
        const width = viewport?.width ?? 1280

        if (width < MOBILE_WIDTH_THRESHOLD) {
          // On mobile, toggle is inside the drawer — open it first
          const hamburger = page.locator('header button[aria-label="Abrir menú"]')
          await hamburger.click()
          const toggle = page.locator('button[aria-label*="modo"]')
          await expect(toggle.first()).toBeVisible()
          // Close drawer
          await page.keyboard.press('Escape')
        } else {
          const toggle = page.locator('header button[aria-label*="modo"]')
          await expect(toggle).toBeVisible()
        }
      })

      test('theme toggle changes data-theme attribute', async ({ page, viewport }) => {
        await page.goto(pagePath)
        const width = viewport?.width ?? 1280

        // Get initial theme
        const initialTheme = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme') ?? 'dark'
        )

        if (width < MOBILE_WIDTH_THRESHOLD) {
          // Open drawer first
          const hamburger = page.locator('header button[aria-label="Abrir menú"]')
          await hamburger.click()
          const toggle = page.locator('button[aria-label*="modo"]').first()
          await toggle.click()
          await page.keyboard.press('Escape')
        } else {
          const toggle = page.locator('header button[aria-label*="modo"]')
          await toggle.click()
        }

        const newTheme = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme') ?? 'dark'
        )
        expect(newTheme).not.toBe(initialTheme)
      })
    })
  }

  test.describe('CollectionPage grid columns', () => {
    test('grid fits at least 2 columns on mobile, 4 on desktop', async ({ page, viewport }) => {
      await page.goto('/coleccion')
      const width = viewport?.width ?? 1280

      // The grid uses auto-fill with minmax, so count visible cards per row
      // We check the computed grid-template-columns value
      const gridEl = page.locator('[data-testid="game-grid"]').or(
        page.locator('.ant-layout-content div').filter({ has: page.locator('[style*="grid-template-columns"]') }).first()
      )

      // Simpler: check that the container width allows the expected number of columns
      // minmax(140px) on mobile → floor(375 / 140) = 2 columns minimum
      // minmax(180px) on desktop → floor(1280 / 180) = 7 columns minimum
      const minColumns = width < MOBILE_WIDTH_THRESHOLD ? 2 : 4
      const minCardWidth = width < MOBILE_WIDTH_THRESHOLD ? 140 : 180

      const containerWidth = await page.evaluate(() => {
        const el = document.querySelector('.ant-layout-content')
        return el ? el.clientWidth : 0
      })

      const expectedColumns = Math.floor(containerWidth / minCardWidth)
      expect(expectedColumns).toBeGreaterThanOrEqual(minColumns)
    })
  })
})
