# Ember Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `vg-collection` with the "Ember" aesthetic — dark charcoal + ember red, Bebas Neue + DM Sans typography, a new sticky header (logo + search + login), a Popular Games section via IGDB API, and a login/register modal.

**Architecture:** The existing single-page React app is extended with two new feature slices (`src/features/auth/`, `src/features/popular/`) and two new shared UI components (`HeaderSearch`, `LoginButton`). The Ant Design `ConfigProvider` is given a dark theme with ember-red tokens that propagate to all existing components with no per-component overrides. The IGDB API is accessed via a Vite dev proxy that handles Twitch OAuth token fetching entirely in Node.js — no credentials ever reach the browser.

**Tech Stack:** React 19, TypeScript strict, Ant Design 6, Vite 8, Vitest, Google Fonts (Bebas Neue, DM Sans, JetBrains Mono)

---

## Task 1: Google Fonts + CSS design tokens

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts to `index.html`**

Replace the `<head>` section of `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VG Collection</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Replace `src/index.css` with Ember design tokens**

Overwrite the entire file:

```css
:root {
  --bg: #0f0e0e;
  --bg-surface: #1a1918;
  --bg-elevated: #242220;
  --accent: #e03c2f;
  --accent-dim: rgba(224, 60, 47, 0.15);
  --text: #c9c2b8;
  --text-h: #f5f0ea;
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

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  /* Noise texture overlay at 3% opacity */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

#root {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--text-h);
  margin: 0;
}

p {
  margin: 0;
}
```

- [ ] **Step 3: Verify the app still loads**

Run: `npm run dev` in `C:\Users\Nicolas Sarmiento\vg-collection`

Open `http://localhost:5173` in the browser. The page should be dark with DM Sans font. No console errors. The existing table should still render.

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: add Ember design tokens and Google Fonts"
```

---

## Task 2: Ant Design dark theme with ember-red tokens

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx` to apply the dark ember theme**

Replace the entire file:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { GamesProvider } from './features/games/state/GamesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#e03c2f',
          colorBgContainer: '#1a1918',
          colorBgElevated: '#242220',
          colorBorder: '#2e2b28',
          colorText: '#c9c2b8',
          colorTextHeading: '#f5f0ea',
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: 6,
          colorLink: '#e03c2f',
        },
      }}
    >
      <AntdApp>
        <GamesProvider>
          <App />
        </GamesProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Verify dark theme applies**

Run the dev server. The table, buttons, inputs, and modal should now use dark backgrounds and ember-red primary color. No TypeScript errors (`npm run build` should pass).

Run: `npm run build`
Expected: exits with code 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: apply Ant Design dark ember theme via ConfigProvider"
```

---

## Task 3: Auth reducer and context

**Files:**
- Create: `src/features/auth/state/authReducer.ts`
- Create: `src/features/auth/state/AuthContext.tsx`

- [ ] **Step 1: Create `src/features/auth/state/authReducer.ts`**

```ts
export interface AuthUser {
  email: string
}

export interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  isModalOpen: boolean
}

export type AuthAction =
  | { type: 'openModal' }
  | { type: 'closeModal' }
  | { type: 'login'; payload: AuthUser }
  | { type: 'logout' }

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
  isModalOpen: false,
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'openModal':
      return { ...state, isModalOpen: true }
    case 'closeModal':
      return { ...state, isModalOpen: false }
    case 'login':
      return { isLoggedIn: true, user: action.payload, isModalOpen: false }
    case 'logout':
      return { ...state, isLoggedIn: false, user: null }
    default:
      return state
  }
}
```

- [ ] **Step 2: Create `src/features/auth/state/AuthContext.tsx`**

```tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { authReducer, initialAuthState, type AuthState, type AuthAction } from './authReducer'

interface AuthContextValue {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/
git commit -m "feat: add AuthContext and authReducer"
```

---

## Task 4: Login / Register modal

**Files:**
- Create: `src/features/auth/ui/LoginModal.tsx`

- [ ] **Step 1: Create `src/features/auth/ui/LoginModal.tsx`**

```tsx
import { App as AntdApp, Button, Form, Input, Modal, Typography } from 'antd'
import { useState } from 'react'
import { useAuthContext } from '../state/AuthContext'

type ModalView = 'login' | 'register'

interface LoginFormValues {
  email: string
  password: string
}

interface RegisterFormValues {
  username: string
  email: string
  password: string
}

export function LoginModal() {
  const { state, dispatch } = useAuthContext()
  const { message } = AntdApp.useApp()
  const [view, setView] = useState<ModalView>('login')
  const [loginForm] = Form.useForm<LoginFormValues>()
  const [registerForm] = Form.useForm<RegisterFormValues>()

  function handleClose() {
    dispatch({ type: 'closeModal' })
    setView('login')
    loginForm.resetFields()
    registerForm.resetFields()
  }

  function handleLoginSubmit(values: LoginFormValues) {
    dispatch({ type: 'login', payload: { email: values.email } })
    void message.success('¡Bienvenido!')
  }

  function handleRegisterSubmit(values: RegisterFormValues) {
    dispatch({ type: 'login', payload: { email: values.email } })
    void message.success('¡Bienvenido!')
  }

  return (
    <Modal
      open={state.isModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={420}
      destroyOnHidden
      styles={{
        content: {
          background: 'var(--bg-surface)',
          borderTop: '4px solid var(--accent)',
          borderRadius: 8,
          padding: '32px 36px',
        },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title
          level={3}
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-h)',
            letterSpacing: 2,
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 6 }}>▸</span>
          VG COLLECTION
        </Typography.Title>
      </div>

      {view === 'login' ? (
        <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email válido' },
            ]}
          >
            <Input placeholder="tu@email.com" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'La contraseña es obligatoria' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block>
              Iniciar sesión
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text style={{ color: 'var(--text)', fontSize: 13 }}>
              ¿No tienes cuenta?{' '}
              <Typography.Link
                onClick={() => setView('register')}
                style={{ color: 'var(--accent)' }}
              >
                Regístrate
              </Typography.Link>
            </Typography.Text>
          </div>
        </Form>
      ) : (
        <Form form={registerForm} layout="vertical" onFinish={handleRegisterSubmit}>
          <Form.Item
            label="Nombre de usuario"
            name="username"
            rules={[{ required: true, message: 'El nombre de usuario es obligatorio' }]}
          >
            <Input placeholder="GamerXYZ" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email válido' },
            ]}
          >
            <Input placeholder="tu@email.com" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'La contraseña es obligatoria' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block>
              Crear cuenta
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text style={{ color: 'var(--text)', fontSize: 13 }}>
              ¿Ya tienes cuenta?{' '}
              <Typography.Link
                onClick={() => setView('login')}
                style={{ color: 'var(--accent)' }}
              >
                Inicia sesión
              </Typography.Link>
            </Typography.Text>
          </div>
        </Form>
      )}
    </Modal>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/ui/LoginModal.tsx
git commit -m "feat: add login/register modal"
```

---

## Task 5: Header components (Logo, HeaderSearch, LoginButton)

**Files:**
- Create: `src/shared/ui/HeaderSearch.tsx`
- Create: `src/shared/ui/LoginButton.tsx`

- [ ] **Step 1: Create `src/shared/ui/HeaderSearch.tsx`**

```tsx
import { Input } from 'antd'
import { useGamesContext } from '../../features/games/state/GamesContext'

export function HeaderSearch() {
  const { state, dispatch } = useGamesContext()

  return (
    <Input.Search
      value={state.search}
      onChange={(e) => dispatch({ type: 'setSearch', payload: e.target.value })}
      onSearch={(value) => dispatch({ type: 'setSearch', payload: value })}
      placeholder="Buscar juegos, géneros, plataformas…"
      allowClear
      style={{
        width: 380,
        borderRadius: 24,
      }}
      styles={{
        affixWrapper: {
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          borderRadius: 24,
        },
      }}
    />
  )
}
```

- [ ] **Step 2: Create `src/shared/ui/LoginButton.tsx`**

```tsx
import { Avatar, Button } from 'antd'
import { useAuthContext } from '../../features/auth/state/AuthContext'

export function LoginButton() {
  const { state, dispatch } = useAuthContext()

  if (state.isLoggedIn && state.user !== null) {
    const initial = state.user.email[0].toUpperCase()
    return (
      <Avatar
        style={{
          background: 'var(--accent)',
          color: 'var(--text-h)',
          fontFamily: 'var(--font-display)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => dispatch({ type: 'logout' })}
        title={`Cerrar sesión (${state.user.email})`}
      >
        {initial}
      </Avatar>
    )
  }

  return (
    <Button
      onClick={() => dispatch({ type: 'openModal' })}
      style={{
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'transparent',
        borderRadius: 20,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        padding: '0 20px',
        flexShrink: 0,
        transition: 'background 150ms, color 150ms',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--accent)'
        el.style.color = 'var(--text-h)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.color = 'var(--accent)'
      }}
    >
      Login
    </Button>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/HeaderSearch.tsx src/shared/ui/LoginButton.tsx
git commit -m "feat: add HeaderSearch and LoginButton components"
```

---

## Task 6: Rewrite AppLayout with sticky Ember header

**Files:**
- Modify: `src/shared/ui/AppLayout.tsx`

- [ ] **Step 1: Rewrite `src/shared/ui/AppLayout.tsx`**

```tsx
import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'

const { Header, Content } = Layout

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: 64,
          padding: '0 24px',
        }}
      >
        {/* Logo — left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            flexShrink: 0,
            textDecoration: 'none',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span
            style={{
              color: 'var(--accent)',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ▸
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--text-h)',
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            VG COLLECTION
          </span>
        </div>

        {/* Spacer — pushes search to center */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <HeaderSearch />
        </div>

        {/* Login button — right */}
        <LoginButton />
      </Header>

      <Content style={{ padding: 24, background: 'var(--bg)' }}>
        {children}
      </Content>
    </Layout>
  )
}
```

- [ ] **Step 2: Verify the header renders**

Run dev server, open browser. You should see:
- Dark sticky header with "▸ VG COLLECTION" on the left
- Search bar in the center
- "Login" pill button on the right

No console errors about missing context — `HeaderSearch` and `LoginButton` both read from contexts that are provided in `App.tsx` (GamesContext) and will be provided by AuthProvider in the next task.

> If you get a context error from `LoginButton` (AuthContext not yet provided), that is expected and will be fixed in Task 7.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/AppLayout.tsx
git commit -m "feat: rewrite AppLayout with sticky Ember header"
```

---

## Task 7: Wire AuthProvider and LoginModal into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx`**

```tsx
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <GamesPage />
      </AppLayout>
      <LoginModal />
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 2: Verify login flow works end to end**

Run dev server. Click "Login" — the modal should open with the ember-red top border and the VG COLLECTION logo. Fill in any email + password and submit. The modal closes, a success toast appears, and the header Login button becomes a red avatar with the email initial. Clicking the avatar logs out and restores the "Login" button.

- [ ] **Step 3: Verify tests still pass**

Run: `npm test`
Expected: all tests pass (or `No test files found` if none exist yet). Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire AuthProvider and LoginModal into App"
```

---

## Task 8: IGDB Vite proxy

**Files:**
- Modify: `vite.config.ts`
- Create: `.env.local` (manually by user — see note)

- [ ] **Step 1: Note on `.env.local`**

Before running the dev server after this task, you (or the user) must create `.env.local` in the project root with real credentials:

```
VITE_IGDB_CLIENT_ID=your_client_id_here
VITE_IGDB_CLIENT_SECRET=your_client_secret_here
```

Get credentials from: https://dev.twitch.tv/console/apps — create an app, set category to "Application Integration", redirect URL to `http://localhost`. The Client ID and Client Secret appear on the app detail page. `.env.local` is already covered by `*.local` in `.gitignore`.

- [ ] **Step 2: Update `vite.config.ts` with the IGDB proxy**

```ts
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
        configure: (proxy: import('http-proxy').Server) => {
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

          proxy.on('proxyReq', (proxyReq) => {
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
```

> **TypeScript note for the proxy type:** If `import('http-proxy').Server` causes a type error, replace the `configure` parameter type with `(proxy: import('vite').ProxyServer) => void` or simply use `// @ts-expect-error` above the `configure` line. The proxy runs in Node.js at dev time only — type precision here is low priority.

- [ ] **Step 3: Verify proxy works (requires `.env.local` to be set)**

With `.env.local` in place, run `npm run dev`. Open the browser DevTools Network tab. The Popular Games section (added in Task 9) will trigger `POST /api/igdb/games`. If credentials are valid, you'll see a 200 response. If `.env.local` is missing, the proxy still starts but IGDB returns 401 — the UI shows the error state gracefully.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts
git commit -m "feat: add Vite IGDB proxy with Twitch OAuth token caching"
```

---

## Task 9: IGDB types and data-fetching hook

**Files:**
- Create: `src/features/popular/types.ts`
- Create: `src/features/popular/hooks/useIgdbPopularGames.ts`

- [ ] **Step 1: Create `src/features/popular/types.ts`**

```ts
export interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number // Unix timestamp in seconds
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
}
```

- [ ] **Step 2: Create `src/features/popular/hooks/useIgdbPopularGames.ts`**

```ts
import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbPopularGamesResult {
  games: IgdbGame[]
  loading: boolean
  error: string | null
}

const IGDB_QUERY = `
fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
where total_rating_count > 100 & cover != null;
sort total_rating desc;
limit 20;
`.trim()

export function useIgdbPopularGames(): UseIgdbPopularGamesResult {
  const [games, setGames] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGames() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/igdb/games', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: IGDB_QUERY,
        })
        if (!res.ok) throw new Error(`IGDB error ${res.status}`)
        const data = (await res.json()) as IgdbGame[]
        if (!cancelled) setGames(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar juegos populares')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchGames()
    return () => { cancelled = true }
  }, [])

  return { games, loading, error }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/popular/
git commit -m "feat: add IgdbGame types and useIgdbPopularGames hook"
```

---

## Task 10: PopularGameCard and skeleton

**Files:**
- Create: `src/features/popular/ui/PopularGameCard.tsx`

- [ ] **Step 1: Create `src/features/popular/ui/PopularGameCard.tsx`**

```tsx
import type { IgdbGame } from '../types'

/** Converts IGDB cover URL from t_thumb to t_cover_big (264×374) */
function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

interface PopularGameCardProps {
  game: IgdbGame
}

export function PopularGameCard({ game }: PopularGameCardProps) {
  const coverUrl = getCoverUrl(game.cover.url)
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null

  return (
    <div
      style={{
        width: 180,
        flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        cursor: 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.04)'
        el.style.boxShadow = '0 0 18px var(--accent-dim)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
        el.style.boxShadow = 'none'
      }}
    >
      <img
        src={coverUrl}
        alt={game.name}
        width={180}
        height={240}
        style={{ display: 'block', objectFit: 'cover', width: '100%', height: 240 }}
        loading="lazy"
      />
      {/* Title overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(15,14,14,0.95))',
          padding: '20px 10px 10px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            color: 'var(--text-h)',
            lineHeight: 1.2,
            letterSpacing: 0.5,
          }}
        >
          {game.name}
        </div>
        {year !== null && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text)',
              marginTop: 2,
            }}
          >
            {year}
          </div>
        )}
      </div>
    </div>
  )
}

/** Skeleton card shown while IGDB data is loading */
export function PopularGameCardSkeleton() {
  return (
    <div
      style={{
        width: 180,
        height: 260,
        flexShrink: 0,
        borderRadius: 8,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(
            90deg,
            var(--bg-surface) 25%,
            var(--bg-elevated) 50%,
            var(--bg-surface) 75%
          )`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/ui/PopularGameCard.tsx
git commit -m "feat: add PopularGameCard and skeleton component"
```

---

## Task 11: PopularGamesSection

**Files:**
- Create: `src/features/popular/ui/PopularGamesSection.tsx`

- [ ] **Step 1: Create `src/features/popular/ui/PopularGamesSection.tsx`**

```tsx
import { useIgdbPopularGames } from '../hooks/useIgdbPopularGames'
import { PopularGameCard, PopularGameCardSkeleton } from './PopularGameCard'

export function PopularGamesSection() {
  const { games, loading, error } = useIgdbPopularGames()

  return (
    <section
      style={{
        marginBottom: 40,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        POPULAR AHORA
      </h2>

      {error !== null && (
        <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 8 }}>{error}</p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: 8,
        }}
      >
        {loading
          ? Array.from({ length: 8 }, (_, i) => <PopularGameCardSkeleton key={i} />)
          : games.map((game) => <PopularGameCard key={game.id} game={game} />)}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/ui/PopularGamesSection.tsx
git commit -m "feat: add PopularGamesSection with horizontal scroll card row"
```

---

## Task 12: Add PopularGamesSection to App and add collection heading

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/games/ui/GamesPage.tsx`

- [ ] **Step 1: Update `src/App.tsx` to include `PopularGamesSection`**

```tsx
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { PopularGamesSection } from './features/popular/ui/PopularGamesSection'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <PopularGamesSection />
        <GamesPage />
      </AppLayout>
      <LoginModal />
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 2: Add "TU COLECCIÓN" section heading above the card in `GamesPage.tsx`**

In `src/features/games/ui/GamesPage.tsx`, find the `return (` statement and add a heading before the `<Card>`:

```tsx
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
        TU COLECCIÓN
      </h2>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* ... rest of existing JSX unchanged ... */}
        </Space>

        <GameFormModal
          open={isModalOpen}
          mode={modalMode}
          game={editingGame}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Card>
    </>
  )
```

The full updated `return` block for `GamesPage.tsx`:

```tsx
  return (
    <>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
        TU COLECCIÓN
      </h2>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <GamesToolbar
            search={state.search}
            platformFilter={state.platformFilter}
            statusFilter={state.statusFilter}
            onSearchChange={(value) => dispatch({ type: 'setSearch', payload: value })}
            onPlatformFilterChange={(value) =>
              dispatch({ type: 'setPlatformFilter', payload: value })
            }
            onStatusFilterChange={(value) =>
              dispatch({ type: 'setStatusFilter', payload: value })
            }
            onCreate={handleCreate}
          />

          <GamesTable games={filteredGames} onEdit={handleEdit} onComplete={handleComplete} />
        </Space>

        <GameFormModal
          open={isModalOpen}
          mode={modalMode}
          game={editingGame}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Card>
    </>
  )
```

- [ ] **Step 3: Verify the page renders correctly**

Run dev server. The page should show:
1. Sticky dark header with logo, search, login button
2. "POPULAR AHORA" section with 8 skeleton cards (or real cards if `.env.local` is set)
3. "▸ TU COLECCIÓN" heading
4. The existing collection card with toolbar and table

- [ ] **Step 4: Verify tests still pass**

Run: `npm test`
Expected: all existing tests pass, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/features/games/ui/GamesPage.tsx
git commit -m "feat: wire PopularGamesSection and add TU COLECCIÓN heading"
```

---

## Task 13: Update StatusTag ember palette

**Files:**
- Modify: `src/shared/ui/StatusTag.tsx`

- [ ] **Step 1: Update `src/shared/ui/StatusTag.tsx`**

Replace the entire file:

```tsx
import { Tag } from 'antd'
import type { GameStatus } from '../types/game'

const statusLabels: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

// Hex colors that work on the dark ember theme background
const statusColors: Record<GameStatus, string> = {
  backlog: '#3a3836',    // dark warm gray
  playing: '#e07a2f',   // ember orange
  completed: '#2e7d52', // forest green
  paused: '#8a7a2f',    // muted gold
  dropped: '#7a2e2e',   // muted crimson
}

interface StatusTagProps {
  status: GameStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return (
    <Tag
      color={statusColors[status]}
      style={{ fontFamily: 'var(--font-body)', fontSize: 12, border: 'none' }}
    >
      {statusLabels[status]}
    </Tag>
  )
}
```

- [ ] **Step 2: Verify visually**

Run dev server. Add a game (or use existing ones). Status tags in the table should render in ember-palette colors against the dark background.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: exits with code 0.

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: all tests pass, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/StatusTag.tsx
git commit -m "feat: update StatusTag colors to ember palette"
```

---

## Self-Review Checklist

After all tasks are committed, verify the following spec requirements are met:

| Spec requirement | Task | Status |
|---|---|---|
| CSS design tokens (--bg, --accent, etc.) | Task 1 | ✓ |
| Google Fonts (Bebas Neue, DM Sans, JetBrains Mono) | Task 1 | ✓ |
| Noise texture on body | Task 1 | ✓ |
| Ant Design dark algorithm + ember tokens | Task 2 | ✓ |
| AuthReducer + AuthContext | Task 3 | ✓ |
| Login/Register modal with view toggle | Task 4 | ✓ |
| HeaderSearch (dispatches to GamesContext) | Task 5 | ✓ |
| LoginButton (avatar when logged in) | Task 5 | ✓ |
| Sticky header with 3 zones | Task 6 | ✓ |
| AuthProvider + LoginModal wired into App | Task 7 | ✓ |
| Vite IGDB proxy with token caching | Task 8 | ✓ |
| IgdbGame type + useIgdbPopularGames hook | Task 9 | ✓ |
| PopularGameCard with hover glow | Task 10 | ✓ |
| Skeleton loading state (8 cards) | Task 10 | ✓ |
| PopularGamesSection with horizontal scroll | Task 11 | ✓ |
| Error state message | Task 11 | ✓ |
| PopularGamesSection mounted in App | Task 12 | ✓ |
| "TU COLECCIÓN" heading in GamesPage | Task 12 | ✓ |
| StatusTag ember palette colors | Task 13 | ✓ |
| .gitignore covers .env.local (*.local) | Pre-existing | ✓ |
