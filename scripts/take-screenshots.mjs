import { chromium } from 'playwright'

const SCREENSHOTS = 'C:\\Users\\Nicolas Sarmiento\\vg-collection\\screenshots'

const MOCK_GAMES = [
  { id: '1', title: 'The Legend of Zelda: Ocarina of Time', platform: 'n64', status: 'completed', genre: 'Action-Adventure', year: 1998, rating: 10, pros: 'Nivel de diseño magistral\nBanda sonora inolvidable', cons: 'Gráficos algo dated', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: '2', title: 'Chrono Trigger', platform: 'snes', status: 'completed', genre: 'RPG', year: 1995, rating: 10, pros: 'Historia increíble\nMúsica de Yasunori Mitsuda', cons: '', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
  { id: '3', title: 'Hollow Knight', platform: 'pc', status: 'playing', genre: 'Metroidvania', year: 2017, rating: 9, pros: 'Arte hermoso\nGameplay preciso', cons: 'Mapa confuso al principio', createdAt: '2025-01-03T00:00:00Z', updatedAt: '2025-01-03T00:00:00Z' },
  { id: '4', title: 'Resident Evil 4', platform: 'ps2', status: 'backlog', genre: 'Survival Horror', year: 2005, notes: 'Clásico pendiente, ver remake después', createdAt: '2025-01-04T00:00:00Z', updatedAt: '2025-01-04T00:00:00Z' },
  { id: '5', title: 'Persona 5 Royal', platform: 'ps4', status: 'backlog', genre: 'RPG', year: 2017, rating: 9, notes: '100+ horas, preparar tiempo', createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z' },
  { id: '6', title: 'Half-Life 2', platform: 'pc', status: 'completed', genre: 'FPS', year: 2004, rating: 10, pros: 'Física revolucionaria\nNarrativa ambiental', cons: 'Esperar HL3 duele', createdAt: '2025-01-06T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z' },
  { id: '7', title: 'Super Metroid', platform: 'snes', status: 'completed', genre: 'Metroidvania', year: 1994, rating: 9, createdAt: '2025-01-07T00:00:00Z', updatedAt: '2025-01-07T00:00:00Z' },
  { id: '8', title: 'Elden Ring', platform: 'ps5', status: 'playing', genre: 'Action RPG', year: 2022, rating: 10, pros: 'Mundo abierto magistral\nJefes épicos', cons: 'Dificultad punitiva a veces', createdAt: '2025-01-08T00:00:00Z', updatedAt: '2025-01-08T00:00:00Z' },
  { id: '9', title: 'Fire Emblem: Three Houses', platform: 'switch', status: 'paused', genre: 'Tactical RPG', year: 2019, rating: 8, notes: 'Llegué a la mitad, retomar pronto', createdAt: '2025-01-09T00:00:00Z', updatedAt: '2025-01-09T00:00:00Z' },
  { id: '10', title: 'Sonic the Hedgehog 2', platform: 'sega-md', status: 'completed', genre: 'Platformer', year: 1992, rating: 8, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  { id: '11', title: 'Dark Souls', platform: 'ps3', status: 'dropped', genre: 'Action RPG', year: 2011, rating: 7, cons: 'Demasiado castigo para mí', createdAt: '2025-01-11T00:00:00Z', updatedAt: '2025-01-11T00:00:00Z' },
  { id: '12', title: 'Castlevania: SOTN', platform: 'ps1', status: 'backlog', genre: 'Metroidvania', year: 1997, notes: 'El papá del metroidvania moderno', createdAt: '2025-01-12T00:00:00Z', updatedAt: '2025-01-12T00:00:00Z' },
]

const MOCK_STATE = {
  games: MOCK_GAMES,
  search: '',
  platformFilter: 'all',
  statusFilter: 'all',
  isCreateModalOpen: false,
  createModalPrefill: undefined,
}

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOTS}/${name}.png`, fullPage: true })
  console.log(`  ✓ ${name}.png`)
}

/** Login via demo account using the in-page login modal */
async function login(page) {
  const loginBtn = page.locator('button', { hasText: 'Iniciar sesión' }).first()
  await loginBtn.waitFor({ state: 'visible', timeout: 5000 })
  await loginBtn.click()
  await page.waitForTimeout(600)
  const useDemoBtn = page.locator('button', { hasText: 'Usar demo' })
  await useDemoBtn.click()
  await page.waitForTimeout(400)
  const submitBtn = page.locator('.ant-modal .ant-btn-primary').first()
  await submitBtn.click()
  await page.waitForTimeout(1500)
}

/** Click an SPA link by href to navigate without losing auth */
async function spaNavigate(page, href) {
  await page.locator(`a[href="${href}"]`).first().click()
  await page.waitForTimeout(1000)
}

async function waitForIgdbSettled(page) {
  await page.waitForTimeout(5000)
  try {
    await page.waitForFunction(() =>
      document.querySelectorAll('.skeleton-shimmer, .ant-skeleton').length === 0,
    { timeout: 10000 })
  } catch { /* proceed */ }
  await page.waitForTimeout(1000)
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  try {
    // ——————————————— 1. HOME DARK ———————————————
    console.log('1/8  home-dark')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => localStorage.setItem('vg-theme', 'dark'))
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
      await waitForIgdbSettled(page)
      await screenshot(page, 'home-dark')
      await ctx.close()
    }

    // ——————————————— 2. HOME LIGHT ———————————————
    console.log('2/8  home-light')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => localStorage.setItem('vg-theme', 'light'))
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
      await waitForIgdbSettled(page)
      await screenshot(page, 'home-light')
      await ctx.close()
    }

    // ——————————————— 3. COLLECTION DASHBOARD ———————————————
    console.log('3/8  collection-dashboard')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      // Inject theme + games BEFORE React loads
      await page.addInitScript(() => {
        localStorage.setItem('vg-theme', 'dark')
        localStorage.setItem('vg-collection:v1', JSON.stringify({
          games: [
            { id: '1', title: 'The Legend of Zelda: Ocarina of Time', platform: 'n64', status: 'completed', genre: 'Action-Adventure', year: 1998, rating: 10, pros: 'Nivel de diseño magistral\nBanda sonora inolvidable', cons: 'Gráficos algo dated', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
            { id: '2', title: 'Chrono Trigger', platform: 'snes', status: 'completed', genre: 'RPG', year: 1995, rating: 10, pros: 'Historia increíble\nMúsica de Yasunori Mitsuda', cons: '', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
            { id: '3', title: 'Hollow Knight', platform: 'pc', status: 'playing', genre: 'Metroidvania', year: 2017, rating: 9, pros: 'Arte hermoso\nGameplay preciso', cons: 'Mapa confuso al principio', createdAt: '2025-01-03T00:00:00Z', updatedAt: '2025-01-03T00:00:00Z' },
            { id: '4', title: 'Resident Evil 4', platform: 'ps2', status: 'backlog', genre: 'Survival Horror', year: 2005, notes: 'Clásico pendiente, ver remake después', createdAt: '2025-01-04T00:00:00Z', updatedAt: '2025-01-04T00:00:00Z' },
            { id: '5', title: 'Persona 5 Royal', platform: 'ps4', status: 'backlog', genre: 'RPG', year: 2017, rating: 9, notes: '100+ horas, preparar tiempo', createdAt: '2025-01-05T00:00:00Z', updatedAt: '2025-01-05T00:00:00Z' },
            { id: '6', title: 'Half-Life 2', platform: 'pc', status: 'completed', genre: 'FPS', year: 2004, rating: 10, pros: 'Física revolucionaria\nNarrativa ambiental', cons: 'Esperar HL3 duele', createdAt: '2025-01-06T00:00:00Z', updatedAt: '2025-01-06T00:00:00Z' },
            { id: '7', title: 'Super Metroid', platform: 'snes', status: 'completed', genre: 'Metroidvania', year: 1994, rating: 9, createdAt: '2025-01-07T00:00:00Z', updatedAt: '2025-01-07T00:00:00Z' },
            { id: '8', title: 'Elden Ring', platform: 'ps5', status: 'playing', genre: 'Action RPG', year: 2022, rating: 10, pros: 'Mundo abierto magistral\nJefes épicos', cons: 'Dificultad punitiva a veces', createdAt: '2025-01-08T00:00:00Z', updatedAt: '2025-01-08T00:00:00Z' },
            { id: '9', title: 'Fire Emblem: Three Houses', platform: 'switch', status: 'paused', genre: 'Tactical RPG', year: 2019, rating: 8, notes: 'Llegué a la mitad, retomar pronto', createdAt: '2025-01-09T00:00:00Z', updatedAt: '2025-01-09T00:00:00Z' },
            { id: '10', title: 'Sonic the Hedgehog 2', platform: 'sega-md', status: 'completed', genre: 'Platformer', year: 1992, rating: 8, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
            { id: '11', title: 'Dark Souls', platform: 'ps3', status: 'dropped', genre: 'Action RPG', year: 2011, rating: 7, cons: 'Demasiado castigo para mí', createdAt: '2025-01-11T00:00:00Z', updatedAt: '2025-01-11T00:00:00Z' },
            { id: '12', title: 'Castlevania: SOTN', platform: 'ps1', status: 'backlog', genre: 'Metroidvania', year: 1997, notes: 'El papá del metroidvania moderno', createdAt: '2025-01-12T00:00:00Z', updatedAt: '2025-01-12T00:00:00Z' },
          ],
          search: '',
          platformFilter: 'all',
          statusFilter: 'all',
          isCreateModalOpen: false,
          createModalPrefill: undefined,
        }))
      })
      await page.goto('http://localhost:5173/coleccion', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(2000)
      await screenshot(page, 'collection-dashboard')
      await ctx.close()
    }

    // ——————————————— 4. COLLECTION DETAIL IGDB ———————————————
    console.log('4/8  collection-detail-igdb')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => {
        localStorage.setItem('vg-theme', 'dark')
        localStorage.setItem('vg-collection:v1', JSON.stringify({
          games: MOCK_GAMES,
          search: '',
          platformFilter: 'all',
          statusFilter: 'all',
          isCreateModalOpen: false,
          createModalPrefill: undefined,
        }))
      })
      // Start on collection page, login, then SPA-navigate to detail
      await page.goto('http://localhost:5173/coleccion', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(1500)
      // Navigate directly to detail page — need to login again after full navigation
      await page.goto('http://localhost:5173/coleccion/1', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(3000)
      await page.waitForTimeout(3000)
      await screenshot(page, 'collection-detail-igdb')
      await ctx.close()
    }

    // ——————————————— 5. GAME DETAIL IGDB ———————————————
    console.log('5/8  game-detail-igdb')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => localStorage.setItem('vg-theme', 'dark'))
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      // Login first so "Agregar a mi colección" is available
      await login(page)
      // Now navigate to IGDB game detail 1026 (Ocarina of Time) via SPA
      await page.goto('http://localhost:5173/juego/1026', { waitUntil: 'domcontentloaded' })
      // Need to re-login since goto is a full navigation
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(6000)
      try {
        await page.waitForFunction(() =>
          document.querySelectorAll('.skeleton-shimmer').length === 0,
        { timeout: 10000 })
      } catch { /* ok */ }
      await page.waitForTimeout(1000)
      await screenshot(page, 'game-detail-igdb')
      await ctx.close()
    }

    // ——————————————— 6. COMMAND PALETTE ———————————————
    console.log('6/8  command-palette')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => localStorage.setItem('vg-theme', 'dark'))
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.keyboard.press('Control+k')
      await page.waitForTimeout(800)
      await page.keyboard.type('zelda', { delay: 80 })
      await page.waitForTimeout(2500)
      await screenshot(page, 'command-palette')
      await ctx.close()
    }

    // ——————————————— 7. WHAT TO PLAY ———————————————
    console.log('7/8  what-to-play')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => {
        localStorage.setItem('vg-theme', 'dark')
        localStorage.setItem('vg-collection:v1', JSON.stringify({
          games: MOCK_GAMES,
          search: '',
          platformFilter: 'all',
          statusFilter: 'all',
          isCreateModalOpen: false,
          createModalPrefill: undefined,
        }))
      })
      await page.goto('http://localhost:5173/coleccion', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(1500)

      // Click "¿Qué juego hoy?" button
      const whatToPlayBtn = page.locator('button', { hasText: 'Qué juego hoy' })
      await whatToPlayBtn.waitFor({ state: 'visible', timeout: 5000 })
      await whatToPlayBtn.click()
      await page.waitForTimeout(500)

      // Wait for spin animation
      await page.waitForTimeout(4000)

      await screenshot(page, 'what-to-play')
      await ctx.close()
    }

    // ——————————————— 8. COLLECTION MOBILE ———————————————
    console.log('8/8  collection-mobile')
    {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
      const page = await ctx.newPage()
      await page.addInitScript(() => {
        localStorage.setItem('vg-theme', 'dark')
        localStorage.setItem('vg-collection:v1', JSON.stringify({
          games: MOCK_GAMES,
          search: '',
          platformFilter: 'all',
          statusFilter: 'all',
          isCreateModalOpen: false,
          createModalPrefill: undefined,
        }))
      })
      await page.goto('http://localhost:5173/coleccion', { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await login(page)
      await page.waitForTimeout(1500)

      // Open hamburger menu
      const menuBtn = page.locator('button[aria-label="Abrir menú"]')
      await menuBtn.waitFor({ state: 'visible', timeout: 5000 })
      await menuBtn.click()
      await page.waitForTimeout(800)

      await screenshot(page, 'collection-mobile')
      await ctx.close()
    }

    console.log('\n✅ All 8 screenshots captured!')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
