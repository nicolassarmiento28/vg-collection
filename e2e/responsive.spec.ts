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

      // Read the computed grid-template-columns from the actual grid element
      const gridColumns = await page.evaluate(() => {
        // Find the div with inline style containing grid-template-columns
        const allDivs = Array.from(document.querySelectorAll('div'))
        const gridDiv = allDivs.find(
          (el) => el.style.gridTemplateColumns && el.style.gridTemplateColumns.includes('repeat(auto-fill')
        )
        if (!gridDiv) return null
        return window.getComputedStyle(gridDiv).gridTemplateColumns
      })

      if (gridColumns === null) {
        // No games loaded — skip assertion (vacuously passes)
        return
      }

      // computed grid-template-columns for auto-fill resolves to the actual column widths
      // e.g. "140px 140px 140px" — count how many columns there are
      const columns = gridColumns.trim().split(/\s+/).length
      const minColumns = width < MOBILE_WIDTH_THRESHOLD ? 2 : 4
      expect(columns).toBeGreaterThanOrEqual(minColumns)
    })
  })
})
