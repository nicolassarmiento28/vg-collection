# Plan de implementación del rediseño Ember

> **Para trabajadores agénticos:** SUB-HABILIDAD REQUERIDA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para el seguimiento.

**Goal:** Rediseñar `vg-collection` con la estética "Ember" — carbón oscuro + rojo ember, tipografía Bebas Neue + DM Sans, un nuevo header fijo (logo + búsqueda + inicio de sesión), una sección de Juegos Populares mediante la API de IGDB, y un modal de inicio de sesión/registro.

**Architecture:** La aplicación React de una sola página existente se extiende con dos nuevos slices de features (`src/features/auth/`, `src/features/popular/`) y dos nuevos componentes de UI compartidos (`HeaderSearch`, `LoginButton`). El `ConfigProvider` de Ant Design recibe un tema oscuro con tokens rojo-ember que se propagan a todos los componentes existentes sin overrides por componente. La API de IGDB se accede mediante un proxy de desarrollo de Vite que maneja la obtención del token OAuth de Twitch enteramente en Node.js — ninguna credencial llega jamás al navegador.

**Tech Stack:** React 19, TypeScript strict, Ant Design 6, Vite 8, Vitest, Google Fonts (Bebas Neue, DM Sans, JetBrains Mono)

---

## Task 1: Google Fonts + tokens de diseño CSS

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Agregar Google Fonts a `index.html`**

Reemplaza la sección `<head>` de `index.html` por:

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

- [ ] **Step 2: Reemplazar `src/index.css` con los tokens de diseño Ember**

Sobrescribe el archivo completo:

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

- [ ] **Step 3: Verificar que la aplicación siga cargando**

Ejecuta: `npm run dev` en `C:\Users\Nicolas Sarmiento\vg-collection`

Abre `http://localhost:5173` en el navegador. La página debe verse oscura con la fuente DM Sans. Sin errores en la consola. La tabla existente debe seguir renderizando.

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat: add Ember design tokens and Google Fonts"
```

---

## Task 2: Tema oscuro de Ant Design con tokens rojo-ember

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Actualizar `src/main.tsx` para aplicar el tema oscuro ember**

Reemplaza el archivo completo:

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

- [ ] **Step 2: Verificar que se aplique el tema oscuro**

Ejecuta el servidor de desarrollo. La tabla, los botones, los inputs y el modal ahora deben usar fondos oscuros y el color primario rojo-ember. Sin errores de TypeScript (`npm run build` debe pasar).

Ejecuta: `npm run build`
Esperado: termina con código 0, sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: apply Ant Design dark ember theme via ConfigProvider"
```

---

## Task 3: Reducer y contexto de autenticación

**Files:**
- Create: `src/features/auth/state/authReducer.ts`
- Create: `src/features/auth/state/AuthContext.tsx`

- [ ] **Step 1: Crear `src/features/auth/state/authReducer.ts`**

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

- [ ] **Step 2: Crear `src/features/auth/state/AuthContext.tsx`**

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

- [ ] **Step 3: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/
git commit -m "feat: add AuthContext and authReducer"
```

---

## Task 4: Modal de inicio de sesión / registro

**Files:**
- Create: `src/features/auth/ui/LoginModal.tsx`

- [ ] **Step 1: Crear `src/features/auth/ui/LoginModal.tsx`**

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

- [ ] **Step 2: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/ui/LoginModal.tsx
git commit -m "feat: add login/register modal"
```

---

## Task 5: Componentes del header (Logo, HeaderSearch, LoginButton)

**Files:**
- Create: `src/shared/ui/HeaderSearch.tsx`
- Create: `src/shared/ui/LoginButton.tsx`

- [ ] **Step 1: Crear `src/shared/ui/HeaderSearch.tsx`**

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

- [ ] **Step 2: Crear `src/shared/ui/LoginButton.tsx`**

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

- [ ] **Step 3: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/HeaderSearch.tsx src/shared/ui/LoginButton.tsx
git commit -m "feat: add HeaderSearch and LoginButton components"
```

---

## Task 6: Reescribir AppLayout con header Ember fijo

**Files:**
- Modify: `src/shared/ui/AppLayout.tsx`

- [ ] **Step 1: Reescribir `src/shared/ui/AppLayout.tsx`**

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

- [ ] **Step 2: Verificar que el header se renderice**

Ejecuta el servidor de desarrollo, abre el navegador. Deberías ver:
- Header fijo oscuro con "▸ VG COLLECTION" a la izquierda
- Barra de búsqueda en el centro
- Botón de píldora "Login" a la derecha

Sin errores en la consola sobre contexto faltante — tanto `HeaderSearch` como `LoginButton` leen de contextos que se proveen en `App.tsx` (GamesContext) y serán provistos por AuthProvider en la siguiente tarea.

> Si obtienes un error de contexto de `LoginButton` (AuthContext aún no provisto), eso es esperado y se corregirá en la Tarea 7.

- [ ] **Step 3: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/AppLayout.tsx
git commit -m "feat: rewrite AppLayout with sticky Ember header"
```

---

## Task 7: Conectar AuthProvider y LoginModal a la App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Actualizar `src/App.tsx`**

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

- [ ] **Step 2: Verificar que el flujo de inicio de sesión funcione de punta a punta**

Ejecuta el servidor de desarrollo. Haz clic en "Login" — el modal debe abrirse con el borde superior rojo-ember y el logo VG COLLECTION. Completa cualquier email + contraseña y envía. El modal se cierra, aparece un toast de éxito, y el botón Login del header se convierte en un avatar rojo con la inicial del email. Al hacer clic en el avatar se cierra sesión y se restaura el botón "Login".

- [ ] **Step 3: Verificar que los tests sigan pasando**

Ejecuta: `npm test`
Esperado: todos los tests pasan (o `No test files found` si aún no existen). Código de salida 0.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire AuthProvider and LoginModal into App"
```

---

## Task 8: Proxy de Vite para IGDB

**Files:**
- Modify: `vite.config.ts`
- Create: `.env.local` (manualmente por el usuario — ver nota)

- [ ] **Step 1: Nota sobre `.env.local`**

Antes de ejecutar el servidor de desarrollo después de esta tarea, tú (o el usuario) deben crear `.env.local` en la raíz del proyecto con credenciales reales:

```
VITE_IGDB_CLIENT_ID=your_client_id_here
VITE_IGDB_CLIENT_SECRET=your_client_secret_here
```

Obtén las credenciales en: https://dev.twitch.tv/console/apps — crea una app, configura la categoría como "Application Integration", la URL de redirección como `http://localhost`. El Client ID y el Client Secret aparecen en la página de detalle de la app. `.env.local` ya está cubierto por `*.local` en `.gitignore`.

- [ ] **Step 2: Actualizar `vite.config.ts` con el proxy de IGDB**

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

> **Nota de TypeScript sobre el tipo del proxy:** Si `import('http-proxy').Server` causa un error de tipo, reemplaza el tipo del parámetro `configure` por `(proxy: import('vite').ProxyServer) => void` o simplemente usa `// @ts-expect-error` arriba de la línea `configure`. El proxy corre en Node.js solo en tiempo de desarrollo — la precisión de tipos aquí es de baja prioridad.

- [ ] **Step 3: Verificar que el proxy funcione (requiere que `.env.local` esté configurado)**

Con `.env.local` en su lugar, ejecuta `npm run dev`. Abre la pestaña Network de las DevTools del navegador. La sección de Juegos Populares (agregada en la Tarea 9) disparará `POST /api/igdb/games`. Si las credenciales son válidas, verás una respuesta 200. Si `.env.local` falta, el proxy igual arranca pero IGDB devuelve 401 — la UI muestra el estado de error de forma elegante.

- [ ] **Step 4: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts
git commit -m "feat: add Vite IGDB proxy with Twitch OAuth token caching"
```

---

## Task 9: Tipos de IGDB y hook de obtención de datos

**Files:**
- Create: `src/features/popular/types.ts`
- Create: `src/features/popular/hooks/useIgdbPopularGames.ts`

- [ ] **Step 1: Crear `src/features/popular/types.ts`**

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

- [ ] **Step 2: Crear `src/features/popular/hooks/useIgdbPopularGames.ts`**

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

- [ ] **Step 3: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/popular/
git commit -m "feat: add IgdbGame types and useIgdbPopularGames hook"
```

---

## Task 10: PopularGameCard y skeleton

**Files:**
- Create: `src/features/popular/ui/PopularGameCard.tsx`

- [ ] **Step 1: Crear `src/features/popular/ui/PopularGameCard.tsx`**

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

- [ ] **Step 2: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/ui/PopularGameCard.tsx
git commit -m "feat: add PopularGameCard and skeleton component"
```

---

## Task 11: PopularGamesSection

**Files:**
- Create: `src/features/popular/ui/PopularGamesSection.tsx`

- [ ] **Step 1: Crear `src/features/popular/ui/PopularGamesSection.tsx`**

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

- [ ] **Step 2: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/ui/PopularGamesSection.tsx
git commit -m "feat: add PopularGamesSection with horizontal scroll card row"
```

---

## Task 12: Agregar PopularGamesSection a la App y agregar el encabezado de colección

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/games/ui/GamesPage.tsx`

- [ ] **Step 1: Actualizar `src/App.tsx` para incluir `PopularGamesSection`**

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

- [ ] **Step 2: Agregar el encabezado de sección "TU COLECCIÓN" sobre la tarjeta en `GamesPage.tsx`**

En `src/features/games/ui/GamesPage.tsx`, busca la sentencia `return (` y agrega un encabezado antes del `<Card>`:

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

El bloque `return` completo actualizado para `GamesPage.tsx`:

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

- [ ] **Step 3: Verificar que la página se renderice correctamente**

Ejecuta el servidor de desarrollo. La página debe mostrar:
1. Header fijo oscuro con logo, búsqueda, botón de inicio de sesión
2. Sección "POPULAR AHORA" con 8 tarjetas skeleton (o tarjetas reales si `.env.local` está configurado)
3. Encabezado "▸ TU COLECCIÓN"
4. La tarjeta de colección existente con toolbar y tabla

- [ ] **Step 4: Verificar que los tests sigan pasando**

Ejecuta: `npm test`
Esperado: todos los tests existentes pasan, código de salida 0.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/features/games/ui/GamesPage.tsx
git commit -m "feat: wire PopularGamesSection and add TU COLECCIÓN heading"
```

---

## Task 13: Actualizar la paleta ember de StatusTag

**Files:**
- Modify: `src/shared/ui/StatusTag.tsx`

- [ ] **Step 1: Actualizar `src/shared/ui/StatusTag.tsx`**

Reemplaza el archivo completo:

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

- [ ] **Step 2: Verificar visualmente**

Ejecuta el servidor de desarrollo. Agrega un juego (o usa los existentes). Las etiquetas de estado en la tabla deben renderizarse con los colores de la paleta ember contra el fondo oscuro.

- [ ] **Step 3: Verificar que TypeScript compile**

Ejecuta: `npm run build`
Esperado: termina con código 0.

- [ ] **Step 4: Ejecutar la suite completa de tests**

Ejecuta: `npm test`
Esperado: todos los tests pasan, código de salida 0.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/StatusTag.tsx
git commit -m "feat: update StatusTag colors to ember palette"
```

---

## Lista de autorrevisión

Después de que todas las tareas estén confirmadas (commit), verifica que se cumplan los siguientes requisitos de la especificación:

| Requisito de la especificación | Tarea | Estado |
|---|---|---|
| Tokens de diseño CSS (--bg, --accent, etc.) | Tarea 1 | ✓ |
| Google Fonts (Bebas Neue, DM Sans, JetBrains Mono) | Tarea 1 | ✓ |
| Textura de ruido en el body | Tarea 1 | ✓ |
| Algoritmo oscuro de Ant Design + tokens ember | Tarea 2 | ✓ |
| AuthReducer + AuthContext | Tarea 3 | ✓ |
| Modal de inicio de sesión/registro con alternancia de vista | Tarea 4 | ✓ |
| HeaderSearch (despacha a GamesContext) | Tarea 5 | ✓ |
| LoginButton (avatar cuando hay sesión iniciada) | Tarea 5 | ✓ |
| Header fijo con 3 zonas | Tarea 6 | ✓ |
| AuthProvider + LoginModal conectados a la App | Tarea 7 | ✓ |
| Proxy de Vite para IGDB con caché de token | Tarea 8 | ✓ |
| Tipo IgdbGame + hook useIgdbPopularGames | Tarea 9 | ✓ |
| PopularGameCard con brillo al pasar el mouse | Tarea 10 | ✓ |
| Estado de carga skeleton (8 tarjetas) | Tarea 10 | ✓ |
| PopularGamesSection con scroll horizontal | Tarea 11 | ✓ |
| Mensaje de estado de error | Tarea 11 | ✓ |
| PopularGamesSection montado en la App | Tarea 12 | ✓ |
| Encabezado "TU COLECCIÓN" en GamesPage | Tarea 12 | ✓ |
| Colores de la paleta ember en StatusTag | Tarea 13 | ✓ |
