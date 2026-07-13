// e2e/collection-import-export.spec.ts
import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'vg-collection:v1'

const seedGame = {
  id: 'e2e-seed-1',
  title: 'Chrono Trigger',
  platform: 'snes',
  status: 'backlog',
  genre: 'RPG',
  year: 1995,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

async function login(page: import('@playwright/test').Page, isMobile: boolean) {
  if (isMobile) {
    await page.locator('header button[aria-label="Abrir menú"]').click()
    await page.locator('.ant-drawer-body').getByRole('button', { name: 'Iniciar sesión' }).click()
  } else {
    await page.locator('header').getByRole('button', { name: 'Iniciar sesión' }).click()
  }
  await page.getByLabel('Email').fill('demo@vgcollection.app')
  await page.getByLabel('Contraseña').fill('demo1234')
  await page.getByRole('button', { name: 'Iniciar sesión' }).last().click()
  await expect(page.getByLabel('Email')).not.toBeVisible()
  if (isMobile) {
    await page.keyboard.press('Escape') // close the drawer opened to reach the login button
  }
}

test.describe('Collection import/export', () => {
  test('exporting and re-importing the same file restores the collection', async ({ page, viewport }) => {
    await page.addInitScript(
      ({ key, game }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            games: [game],
            search: '',
            platformFilter: 'all',
            statusFilter: 'all',
          }),
        )
      },
      { key: STORAGE_KEY, game: seedGame },
    )

    await page.goto('/coleccion')
    await login(page, (viewport?.width ?? 1280) < 768)

    await expect(page.getByText('Chrono Trigger')).toBeVisible()

    // Export
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar colección' }).click(),
    ])
    const exportedPath = await download.path()
    expect(exportedPath).toBeTruthy()

    // Delete the game from the UI so we can prove import restores it.
    // The card's action buttons only mount on hover (and the card has a
    // hover scale transition), so hover it and let the transition settle
    // before clicking to avoid a flaky "element is not stable" wait.
    await page.getByText('Chrono Trigger').first().hover()
    const verDetalle = page.getByRole('button', { name: 'Ver detalle' })
    await verDetalle.waitFor({ state: 'visible' })
    await page.waitForTimeout(250)
    await verDetalle.click({ force: true })
    await page.getByRole('button', { name: 'Eliminar' }).click()
    await page.getByRole('button', { name: 'Eliminar' }).last().click()
    await expect(page.getByText('Chrono Trigger')).not.toBeVisible()

    // Import the previously exported file back
    await page.locator('input[type="file"]').setInputFiles(exportedPath!)
    await expect(page.getByText(/Se importaron/)).toBeVisible()
    await expect(page.getByText('Chrono Trigger')).toBeVisible()
  })

  test('importing a malformed file shows an error and keeps the collection intact', async ({ page, viewport }) => {
    await page.addInitScript(
      ({ key, game }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            games: [game],
            search: '',
            platformFilter: 'all',
            statusFilter: 'all',
          }),
        )
      },
      { key: STORAGE_KEY, game: seedGame },
    )

    await page.goto('/coleccion')
    await login(page, (viewport?.width ?? 1280) < 768)

    const buffer = Buffer.from(JSON.stringify({ not: 'a valid collection' }))
    await page.locator('input[type="file"]').setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer,
    })

    await expect(page.getByText(/no tiene el formato esperado/)).toBeVisible()
    await expect(page.getByText('Chrono Trigger')).toBeVisible()
  })
})
