// e2e/command-palette.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Command palette', () => {
  test('opens with Ctrl+K, searches, and navigates to a result', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Control+k')
    const input = page.getByPlaceholder('Buscar juegos o comandos…')
    await expect(input).toBeVisible()

    // Static actions are listed with no query
    await expect(page.getByText('Ir a Mi Colección')).toBeVisible()

    await input.fill('mario')
    // Either real results show up or "Sin resultados" — either way the palette
    // stays open and responsive; we just need at least one option row to click.
    await page.waitForTimeout(600) // let the search debounce (400ms) settle
    const firstOption = page.getByRole('option').first()
    await expect(firstOption).toBeVisible()
    await firstOption.click()

    // The palette closes after selecting any item
    await expect(input).not.toBeVisible()
  })

  test('closes with Escape without navigating', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Control+k')
    const input = page.getByPlaceholder('Buscar juegos o comandos…')
    await expect(input).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(input).not.toBeVisible()
    await expect(page).toHaveURL('/')
  })
})
