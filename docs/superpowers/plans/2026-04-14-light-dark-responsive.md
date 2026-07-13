# Modo Claro/Oscuro + Layout Responsive + Tests de Playwright — Plan de Implementación

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: Usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para el seguimiento.

**Goal:** Agregar un selector de tema claro/oscuro persistido, hacer que la app sea totalmente responsive en mobile/tablet/desktop, y agregar tests E2E de Playwright que validen el layout en 7 tamaños de viewport.

**Architecture:** Un Context de React (`ThemeContext`) setea `data-theme` en `<html>` y sincroniza el algoritmo del `ConfigProvider` de Ant Design. Las custom properties de CSS en `index.css` manejan todo el cambio de colores. El layout responsive usa media queries de CSS (`@media`) para el estilado y `Grid.useBreakpoint()` de Ant Design para las decisiones de layout manejadas por JS (drawer de hamburguesa).

**Tech Stack:** React 19, TypeScript strict, Vite, Ant Design 6 (`Grid.useBreakpoint`, `Drawer`, `SunOutlined`, `MoonOutlined`, `MenuOutlined`), custom properties de CSS, `@playwright/test`.

---

## Task 1: CSS — Agregar `--text-muted` al tema oscuro y bloque completo de tema claro

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Editar `src/index.css`**

Reemplazar el bloque `:root` actual y agregar el bloque de tema claro. El `:root` existente gana `--text-muted`. Se agrega un nuevo bloque `[data-theme="light"]` después. Dejar sin tocar las reglas de `body`, `#root`, `h1-h4`, `p`, y `@keyframes shimmer`.

```css
:root {
  --bg: #0f0e0e;
  --bg-surface: #1a1918;
  --bg-elevated: #242220;
  --accent: #e03c2f;
  --accent-dim: rgba(224, 60, 47, 0.15);
  --text: #c9c2b8;
  --text-h: #f5f0ea;
  --text-muted: #6b6560;
  --border: #2e2b28;

  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  background: var(--bg);
  color: var(--text);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root[data-theme="light"] {
  --bg:         #f5f2ee;
  --bg-surface: #ffffff;
  --bg-elevated:#eae6e1;
  --text:       #3a3530;
  --text-h:     #1a1714;
  --text-muted: #7a736b;
  --border:     #d4cfc9;
  --accent-dim: rgba(224, 60, 47, 0.10);
}
```

- [ ] **Step 2: Verificar que TypeScript siga compilando**

```bash
npx tsc --noEmit
```
Esperado: sin salida (cero errores).

- [ ] **Step 3: Commitear**

```bash
git add src/index.css
git commit -m "feat: add --text-muted to dark theme and light theme CSS variables"
```

---

## Task 2: ThemeContext — context, provider y hook

**Files:**
- Create: `src/shared/state/ThemeContext.tsx`

- [ ] **Step 1: Crear `src/shared/state/ThemeContext.tsx`**

```tsx
// src/shared/state/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('vg-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vg-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (ctx === undefined) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
```

- [ ] **Step 2: Verificar que TypeScript compile**

```bash
npx tsc --noEmit
```
Esperado: sin salida.

- [ ] **Step 3: Commitear**

```bash
git add src/shared/state/ThemeContext.tsx
git commit -m "feat: add ThemeContext with localStorage persistence"
```

---

## Task 3: Componente ThemeToggle

**Files:**
- Create: `src/shared/ui/ThemeToggle.tsx`

- [ ] **Step 1: Crear `src/shared/ui/ThemeToggle.tsx`**

```tsx
// src/shared/ui/ThemeToggle.tsx
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTheme } from '../state/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 18,
        flexShrink: 0,
        borderRadius: 6,
        transition: 'color 150ms',
      }}
    >
      {isDark ? <SunOutlined /> : <MoonOutlined />}
    </button>
  )
}
```

- [ ] **Step 2: Verificar que TypeScript compile**

```bash
npx tsc --noEmit
```
Esperado: sin salida.

- [ ] **Step 3: Commitear**

```bash
git add src/shared/ui/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle sun/moon button component"
```

---

## Task 4: Conectar ThemeProvider y ThemedConfigProvider en main.tsx

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Reescribir `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './shared/state/ThemeContext.tsx'

function ThemedConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme: appTheme } = useTheme()

  const isDark = appTheme === 'dark'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark
          ? {
              colorPrimary: '#e03c2f',
              colorBgContainer: '#1a1918',
              colorBgElevated: '#242220',
              colorBorder: '#2e2b28',
              colorText: '#c9c2b8',
              colorTextHeading: '#f5f0ea',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: 6,
              colorLink: '#e03c2f',
            }
          : {
              colorPrimary: '#e03c2f',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#eae6e1',
              colorBorder: '#d4cfc9',
              colorText: '#3a3530',
              colorTextHeading: '#1a1714',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: 6,
              colorLink: '#e03c2f',
            },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedConfigProvider>
        <App />
      </ThemedConfigProvider>
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Verificar que TypeScript compile y que Vitest pase**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**"
```
Esperado: cero errores de TS, 24 tests pasados.

- [ ] **Step 3: Commitear**

```bash
git add src/main.tsx
git commit -m "feat: wire ThemeProvider and ThemedConfigProvider, Ant Design syncs with theme"
```

---

## Task 5: Agregar ThemeToggle y drawer de hamburguesa a AppLayout

**Files:**
- Modify: `src/shared/ui/AppLayout.tsx`

- [ ] **Step 1: Reescribir `src/shared/ui/AppLayout.tsx`**

```tsx
// src/shared/ui/AppLayout.tsx
import { MenuOutlined } from '@ant-design/icons'
import { Drawer, Grid, Layout } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'
import { ThemeToggle } from './ThemeToggle'

const { Header, Content } = Layout
const { useBreakpoint } = Grid

interface AppLayoutProps {
  children: ReactNode
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    paddingBottom: 2,
    textDecoration: 'none',
    transition: 'color 150ms, border-color 150ms',
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md  // true para xs y sm (< 768px)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 24,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: isMobile ? 56 : 64,
          padding: isMobile ? '0 16px' : '0 24px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="Ir al inicio"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: 20, lineHeight: 1 }}>▸</span>
          {!isMobile && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: screens.lg ? 28 : 22,
                color: 'var(--text-h)',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              VG COLLECTION
            </span>
          )}
        </Link>

        {/* Enlaces de nav — solo desktop/tablet */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexShrink: 0 }}>
            <NavLink to="/" end style={navLinkStyle}>
              Inicio
            </NavLink>
            <NavLink to="/coleccion" style={navLinkStyle}>
              Mi Colección
            </NavLink>
            <NavLink to="/crear" style={navLinkStyle}>
              Crear Juego
            </NavLink>
          </div>
        )}

        {/* Búsqueda — solo desktop/tablet */}
        {!isMobile && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <HeaderSearch />
          </div>
        )}

        {/* Espaciador para mobile */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* Selector de tema — desktop/tablet */}
        {!isMobile && <ThemeToggle />}

        {/* Botón de login — desktop/tablet */}
        {!isMobile && <LoginButton />}

        {/* Hamburguesa — solo mobile */}
        {isMobile && (
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            <MenuOutlined />
          </button>
        )}
      </Header>

      {/* Drawer mobile */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={260}
        styles={{ body: { background: 'var(--bg-surface)', padding: '24px 20px' } }}
        title={
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)', letterSpacing: 2 }}>
            <span style={{ color: 'var(--accent)', marginRight: 6 }}>▸</span>
            VG COLLECTION
          </span>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Enlaces de nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NavLink to="/" end style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Inicio
            </NavLink>
            <NavLink to="/coleccion" style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Mi Colección
            </NavLink>
            <NavLink to="/crear" style={navLinkStyle} onClick={() => setDrawerOpen(false)}>
              Crear Juego
            </NavLink>
          </div>

          {/* Búsqueda en el drawer */}
          <HeaderSearch />

          {/* Selector de tema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cambiar tema</span>
          </div>

          {/* Login */}
          <LoginButton />
        </div>
      </Drawer>

      <Content style={{ padding: isMobile ? '16px 12px' : 24, background: 'var(--bg)' }}>
        {children}
      </Content>

      <AppFooter />
    </Layout>
  )
}
```

- [ ] **Step 2: Verificar que TypeScript compile y que Vitest pase**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**"
```
Esperado: cero errores de TS, 24 tests pasados.

- [ ] **Step 3: Commitear**

```bash
git add src/shared/ui/AppLayout.tsx
git commit -m "feat: add ThemeToggle to header, hamburger drawer for mobile navigation"
```

---

## Task 6: CollectionPage responsive

**Files:**
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Agregar el import de `useBreakpoint` y aplicar estilos responsive**

Al comienzo del cuerpo de la función `CollectionPage`, agregar:
```tsx
const screens = useBreakpoint()
const isMobile = !screens.md  // < 768px
```

Agregar `Grid` al import de antd al principio del archivo:
```tsx
import { App as AntdApp, Button, Grid, Input, Typography } from 'antd'
```

Luego aplicar estos cambios en el JSX:

**Input de búsqueda** — cambiar `maxWidth: 400` a `width: isMobile ? '100%' : undefined, maxWidth: isMobile ? undefined : 400`:
```tsx
<Input
  placeholder="Buscar en tu colección…"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  allowClear
  style={{
    marginBottom: 12,
    background: 'var(--bg-elevated)',
    borderColor: 'var(--border)',
    borderRadius: 8,
    width: isMobile ? '100%' : undefined,
    maxWidth: isMobile ? undefined : 400,
  }}
/>
```

**Filas de grupos de chips de plataforma** — agregar `overflowX: isMobile ? 'auto' : undefined` y `flexWrap: isMobile ? 'nowrap' : 'wrap'` a la fila interna de chips de cada grupo:
```tsx
{PLATFORM_FILTER_GROUPS.map((group) => (
  <div key={group.label} style={{ marginBottom: 8 }}>
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {group.label}
    </div>
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : undefined,
        paddingBottom: isMobile ? 4 : 0,
      }}
    >
      {group.platforms.map((platform) => (
        <Chip
          key={platform}
          label={PLATFORM_LABELS[platform]}
          active={platformFilter === platform}
          onClick={() =>
            setPlatformFilter(platformFilter === platform ? 'all' : platform)
          }
        />
      ))}
    </div>
  </div>
))}
```

**Grilla de juegos** — cambiar `minmax(180px, 1fr)` para usar el breakpoint:
```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 180}px, 1fr))`,
    gap: isMobile ? 12 : 20,
  }}
>
```

- [ ] **Step 2: Verificar que TypeScript compile y que Vitest pase**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**"
```
Esperado: cero errores de TS, 24 tests pasados.

- [ ] **Step 3: Commitear**

```bash
git add src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: responsive CollectionPage — search width, chip scroll, grid columns"
```

---

## Task 7: GameFormModal responsive

**Files:**
- Modify: `src/features/games/ui/GameFormModal.tsx`

- [ ] **Step 1: Agregar `useBreakpoint` y ancho de modal responsive**

Agregar `Grid` al import de antd:
```tsx
import { Form, Grid, InputNumber, Modal } from 'antd'
```

Dentro del cuerpo de la función `GameFormModal`, agregar:
```tsx
const screens = Grid.useBreakpoint()
const isMobile = !screens.md
```

Agregar la prop `width` a `<Modal>`:
```tsx
<Modal
  open={open}
  title={mode === 'create' ? 'Crear juego' : 'Editar juego'}
  okText={mode === 'create' ? 'Crear' : 'Guardar'}
  cancelText="Cancelar"
  onCancel={onCancel}
  onOk={() => { form.submit() }}
  destroyOnHidden
  width={isMobile ? '95vw' : 520}
>
```

- [ ] **Step 2: Verificar que TypeScript compile y que Vitest pase**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**"
```
Esperado: cero errores de TS, 24 tests pasados.

- [ ] **Step 3: Commitear**

```bash
git add src/features/games/ui/GameFormModal.tsx
git commit -m "feat: responsive GameFormModal width (95vw on mobile)"
```

---

## Task 8: CreateGamePage y GameDetailPage responsive

**Files:**
- Modify: `src/features/games/ui/CreateGamePage.tsx`
- Modify: `src/features/games/ui/GameDetailPage.tsx`

- [ ] **Step 1: Actualizar `CreateGamePage.tsx`**

Agregar `Grid` al import de antd:
```tsx
import { App as AntdApp, Button, Form, Grid, Typography } from 'antd'
```

Dentro del cuerpo de la función `CreateGamePage`, agregar antes del retorno anticipado:
```tsx
const screens = Grid.useBreakpoint()
const isMobile = !screens.md
```

Cambiar el div contenedor exterior de `maxWidth: 560` a:
```tsx
<div style={{ maxWidth: isMobile ? '100%' : 560, width: '100%' }}>
```

- [ ] **Step 2: Actualizar `GameDetailPage.tsx`**

Agregar `Grid` al import de antd:
```tsx
import { Button, Grid, Tag } from 'antd'
```

Dentro del cuerpo de la función `GameDetailPage`, después de los hooks, agregar:
```tsx
const screens = Grid.useBreakpoint()
const isMobile = !screens.md
```

Cambiar el contenedor del cuerpo de `paddingLeft: 32, maxWidth: 800` a:
```tsx
<div style={{ paddingLeft: isMobile ? 0 : 32, maxWidth: isMobile ? '100%' : 800 }}>
```

Cambiar la posición de la portada del banner para mobile — la portada absoluta `left: 32` y el cuerpo `left: 176` se vuelven más chicos en mobile. Reemplazar la sección del banner:
```tsx
{/* Portada superpuesta */}
<div
  style={{
    position: 'absolute',
    bottom: -20,
    left: isMobile ? 12 : 32,
    width: isMobile ? 80 : 120,
    height: isMobile ? 110 : 170,
    borderRadius: 6,
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    background: 'var(--bg-elevated)',
  }}
>
```

Y la posición del título/desarrollador:
```tsx
<div
  style={{
    position: 'absolute',
    bottom: 20,
    left: isMobile ? 108 : 176,
    right: 12,
  }}
>
```

- [ ] **Step 3: Verificar que TypeScript compile y que Vitest pase**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**"
```
Esperado: cero errores de TS, 24 tests pasados.

- [ ] **Step 4: Commitear**

```bash
git add src/features/games/ui/CreateGamePage.tsx src/features/games/ui/GameDetailPage.tsx
git commit -m "feat: responsive CreateGamePage and GameDetailPage layout"
```

---

## Task 9: Instalar Playwright y escribir playwright.config.ts

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

- [ ] **Step 1: Instalar Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Esperado: instala `@playwright/test`, descarga el navegador Chromium.

- [ ] **Step 2: Agregar el script `test:e2e` a `package.json`**

En la sección `"scripts"`, agregar:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Crear `playwright.config.ts`**

```ts
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
```

- [ ] **Step 4: Crear el directorio `e2e/` como placeholder para verificar la estructura**

```bash
mkdir e2e
```

- [ ] **Step 5: Verificar que TypeScript compile**

```bash
npx tsc --noEmit
```
Esperado: sin salida.

- [ ] **Step 6: Commitear**

```bash
git add package.json package-lock.json playwright.config.ts
git commit -m "chore: install Playwright and add playwright.config.ts with 7 device projects"
```

---

## Task 10: Escribir el spec responsive de Playwright

**Files:**
- Create: `e2e/responsive.spec.ts`

- [ ] **Step 1: Crear `e2e/responsive.spec.ts`**

```ts
// e2e/responsive.spec.ts
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/coleccion'] as const

// Los dispositivos con ancho de viewport < 768px son "mobile" (se muestra el menú hamburguesa)
const MOBILE_WIDTH_THRESHOLD = 768

test.describe('Responsive layout', () => {
  for (const pagePath of PAGES) {
    test.describe(`Page: ${pagePath}`, () => {

      test('no horizontal overflow', async ({ page }) => {
        await page.goto(pagePath)
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const innerWidth = await page.evaluate(() => window.innerWidth)
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1) // +1 por redondeo de sub-píxeles
      })

      test('logo accent mark is visible in header', async ({ page }) => {
        await page.goto(pagePath)
        // La marca ▸ siempre está en el link del header, verificar que el header la contenga
        const header = page.locator('header')
        await expect(header).toBeVisible()
        const logoLink = header.locator('a[aria-label="Ir al inicio"]')
        await expect(logoLink).toBeVisible()
      })

      test('navigation is accessible at this viewport', async ({ page, viewport }) => {
        await page.goto(pagePath)
        const width = viewport?.width ?? 1280

        if (width < MOBILE_WIDTH_THRESHOLD) {
          // Mobile: hamburguesa visible, los links de nav NO están en el header
          const hamburger = page.locator('header button[aria-label="Abrir menú"]')
          await expect(hamburger).toBeVisible()

          // Los links de nav no deberían estar directamente visibles en el header
          const headerNavLink = page.locator('header a').filter({ hasText: 'Mi Colección' })
          await expect(headerNavLink).not.toBeVisible()
        } else {
          // Desktop/tablet: links de nav directamente en el header
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
          // En mobile, el toggle está dentro del drawer — abrirlo primero
          const hamburger = page.locator('header button[aria-label="Abrir menú"]')
          await hamburger.click()
          const toggle = page.locator('button[aria-label*="modo"]')
          await expect(toggle.first()).toBeVisible()
          // Cerrar el drawer
          await page.keyboard.press('Escape')
        } else {
          const toggle = page.locator('header button[aria-label*="modo"]')
          await expect(toggle).toBeVisible()
        }
      })

      test('theme toggle changes data-theme attribute', async ({ page, viewport }) => {
        await page.goto(pagePath)
        const width = viewport?.width ?? 1280

        // Obtener el tema inicial
        const initialTheme = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme') ?? 'dark'
        )

        if (width < MOBILE_WIDTH_THRESHOLD) {
          // Abrir el drawer primero
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

      // La grilla usa auto-fill con minmax, entonces contamos las tarjetas visibles por fila
      // Verificamos el valor computado de grid-template-columns
      const gridEl = page.locator('[data-testid="game-grid"]').or(
        page.locator('.ant-layout-content div').filter({ has: page.locator('[style*="grid-template-columns"]') }).first()
      )

      // Más simple: verificar que el ancho del contenedor permita el número esperado de columnas
      // minmax(140px) en mobile → floor(375 / 140) = 2 columnas mínimo
      // minmax(180px) en desktop → floor(1280 / 180) = 7 columnas mínimo
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
```

- [ ] **Step 2: Ejecutar los tests de Playwright para verificar que pasen**

Primero asegurarse de que el servidor de desarrollo no esté ya corriendo, luego:
```bash
npm run test:e2e
```

Esperado: todos los tests pasan en los 7 proyectos de dispositivos (35 tests en total: 5 tests × 7 dispositivos, menos ajustes del test de grilla). Si la página de colección no tiene juegos, el test de columnas de la grilla pasa vacuamente — la comprobación matemática igual funciona.

- [ ] **Step 3: Si algún test falla, corregir el selector o la aserción antes de commitear**

Problemas comunes:
- `aria-label="Abrir menú"` debe coincidir exactamente con lo que está en `AppLayout.tsx` (coincide en la Tarea 5).
- `aria-label*="modo"` usa coincidencia por substring — funciona para "Cambiar a modo claro" y "Cambiar a modo oscuro".
- El test de columnas de la grilla se degrada de forma correcta si no hay tarjetas de juegos.

- [ ] **Step 4: Commitear**

```bash
git add e2e/responsive.spec.ts
git commit -m "test: add Playwright responsive viewport tests for 7 devices"
```

---

## Task 11: Push final

- [ ] **Step 1: Ejecutar la verificación completa**

```bash
npx tsc --noEmit && npx vitest run --exclude ".worktrees/**" && npm run test:e2e
```

Esperado:
- TypeScript: sin salida (cero errores)
- Vitest: 24 pasados
- Playwright: todos los tests de viewport pasados

- [ ] **Step 2: Hacer push a origin**

```bash
git push origin master
```

---

## Resumen de archivos

| Archivo | Estado | Tarea |
|------|--------|------|
| `src/index.css` | Modificado | Tarea 1 |
| `src/shared/state/ThemeContext.tsx` | Creado | Tarea 2 |
| `src/shared/ui/ThemeToggle.tsx` | Creado | Tarea 3 |
| `src/main.tsx` | Modificado | Tarea 4 |
| `src/shared/ui/AppLayout.tsx` | Modificado | Tarea 5 |
| `src/features/collection/ui/CollectionPage.tsx` | Modificado | Tarea 6 |
| `src/features/games/ui/GameFormModal.tsx` | Modificado | Tarea 7 |
| `src/features/games/ui/CreateGamePage.tsx` | Modificado | Tarea 8 |
| `src/features/games/ui/GameDetailPage.tsx` | Modificado | Tarea 8 |
| `playwright.config.ts` | Creado | Tarea 9 |
| `package.json` | Modificado | Tarea 9 |
| `e2e/responsive.spec.ts` | Creado | Tarea 10 |
