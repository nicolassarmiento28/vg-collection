// e2e/what-to-play.spec.ts
import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'vg-collection:v1'

const backlogGame = {
  id: 'e2e-wtp-1',
  title: 'Hollow Knight',
  platform: 'switch',
  status: 'backlog',
  genre: 'Metroidvania',
  year: 2017,
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

test.describe('What to play', () => {
  test('spins and lands on a backlog game, with a working "Ir al detalle" CTA', async ({ page, viewport }) => {
    await page.addInitScript(
      ({ key, game }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ games: [game], search: '', platformFilter: 'all', statusFilter: 'all' }),
        )
      },
      { key: STORAGE_KEY, game: backlogGame },
    )

    await page.goto('/coleccion')
    await login(page, (viewport?.width ?? 1280) < 768)

    await page.getByRole('button', { name: '¿Qué juego hoy?' }).click()

    // Only one backlog game exists, so the spin must land on it.
    const dialog = page.getByRole('dialog')
    const detailCta = dialog.getByRole('button', { name: 'Ir al detalle' })
    await expect(detailCta).toBeVisible({ timeout: 10000 })
    await expect(dialog.getByText('Hollow Knight')).toBeVisible()

    await detailCta.click()
    await expect(page).toHaveURL(`/coleccion/${backlogGame.id}`)
  })

  test('shows a clear message when the backlog is empty', async ({ page, viewport }) => {
    const completedGame = { ...backlogGame, id: 'e2e-wtp-2', status: 'completed' }
    await page.addInitScript(
      ({ key, game }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({ games: [game], search: '', platformFilter: 'all', statusFilter: 'all' }),
        )
      },
      { key: STORAGE_KEY, game: completedGame },
    )

    await page.goto('/coleccion')
    await login(page, (viewport?.width ?? 1280) < 768)

    await page.getByRole('button', { name: '¿Qué juego hoy?' }).click()
    await expect(page.getByText('No tienes juegos pendientes en tu backlog.')).toBeVisible()
  })
})
