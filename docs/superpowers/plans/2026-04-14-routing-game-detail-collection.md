# Routing, Game Detail Page & Enriched Collection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar React Router v7 con tres rutas (`/`, `/coleccion`, `/juego/:id`), una pantalla de detalle de juego con banner inmersivo, y una colección enriquecida con grid de tarjetas con portadas reales de IGDB.

**Architecture:** React Router v7 monta tres páginas dentro del `AppLayout` existente. `GameDetailPage` fetch IGDB por id y renderiza el banner inmersivo. `CollectionPage` reemplaza visualmente a `GamesPage` con un grid de tarjetas y `useCollectionCovers` para obtener portadas por título. `GamesPage` queda en el árbol solo para no romper tests.

**Tech Stack:** React 19, TypeScript strict, React Router DOM v7, Ant Design 6, Vite 8, Vitest

---

## File Map

| Archivo | Acción | Propósito |
|---|---|---|
| `package.json` | Modificar | Agregar `react-router-dom` |
| `src/App.tsx` | Modificar | `<BrowserRouter>` + `<Routes>` con 3 rutas |
| `src/shared/ui/AppLayout.tsx` | Modificar | Logo como `<Link>`, tabs `<NavLink>` en centro |
| `src/features/popular/types.ts` | Modificar | Agregar `summary`, `genres`, `involved_companies` |
| `src/features/popular/ui/PopularGameCard.tsx` | Modificar | Clickeable, navega a `/juego/:id` |
| `src/shared/ui/HeaderSearch.tsx` | Modificar | Al seleccionar navega a `/juego/:id` |
| `src/features/home/ui/HomePage.tsx` | Crear | `PopularGamesSection` — página home |
| `src/features/games/hooks/useIgdbGameDetail.ts` | Crear | Fetch IGDB por id con campos extendidos |
| `src/features/games/ui/GameDetailPage.tsx` | Crear | Detalle de juego con banner inmersivo |
| `src/features/collection/hooks/useCollectionCovers.ts` | Crear | Portadas IGDB para juegos de la colección |
| `src/features/collection/ui/CollectionPage.tsx` | Crear | Grid enriquecido con portadas y chips de filtro |

---

## Task 1: Instalar React Router y configurar rutas base

**Files:**
- Modify: `package.json`
- Modify: `src/App.tsx`
- Create: `src/features/home/ui/HomePage.tsx`

- [ ] **Step 1: Instalar react-router-dom**

```bash
npm install react-router-dom
```

Expected: se agrega `react-router-dom` a `dependencies` en `package.json`.

- [ ] **Step 2: Crear `HomePage.tsx`**

```tsx
// src/features/home/ui/HomePage.tsx
import { PopularGamesSection } from '../../popular/ui/PopularGamesSection'

export function HomePage() {
  return (
    <>
      <PopularGamesSection />
    </>
  )
}
```

- [ ] **Step 3: Reescribir `App.tsx` con BrowserRouter y tres rutas**

```tsx
// src/App.tsx
import { App as AntdApp } from 'antd'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { HomePage } from './features/home/ui/HomePage'
import { GamesProvider } from './features/games/state/GamesContext'
import { AppLayout } from './shared/ui/AppLayout'

// Lazy placeholders — replaced in later tasks
function CollectionPagePlaceholder() {
  return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Mi Colección — próximamente</div>
}

function GameDetailPagePlaceholder() {
  return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Detalle de juego — próximamente</div>
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coleccion" element={<CollectionPagePlaceholder />} />
        <Route path="/juego/:id" element={<GameDetailPagePlaceholder />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GamesProvider>
          <AntdApp>
            <AppRoutes />
            <LoginModal />
          </AntdApp>
        </GamesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
```

> **Nota:** `GamesProvider` sube a `App.tsx` para que `CollectionPage` y `GameDetailPage` puedan acceder al contexto. Verificar que `main.tsx` no lo esté envolviendo también — si lo hace, eliminar el duplicado de `main.tsx`.

- [ ] **Step 4: Verificar `main.tsx` — eliminar GamesProvider duplicado si existe**

Leer `src/main.tsx`. Si hay un `<GamesProvider>` ahí, eliminarlo — ya está en `App.tsx`. Dejar solo `<App />`.

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 6: Verificar en browser**

Navegar a `http://localhost:5173`. Confirmar:
- Página carga con `PopularGamesSection`.
- Navegar a `http://localhost:5173/coleccion` muestra el placeholder.
- Navegar a `http://localhost:5173/juego/1234` muestra el placeholder.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/features/home/ui/HomePage.tsx package.json package-lock.json
git commit -m "feat: add React Router v7 with three routes and HomePage"
```

---

## Task 2: Actualizar AppLayout — logo como Link y tabs de navegación

**Files:**
- Modify: `src/shared/ui/AppLayout.tsx`

- [ ] **Step 1: Reescribir `AppLayout.tsx`**

```tsx
// src/shared/ui/AppLayout.tsx
import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HeaderSearch } from './HeaderSearch'
import { LoginButton } from './LoginButton'

const { Header, Content } = Layout

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
  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          height: 64,
          padding: '0 24px',
        }}
      >
        {/* Logo — left */}
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
        </Link>

        {/* Nav tabs — center-left */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexShrink: 0 }}>
          <NavLink to="/" end style={navLinkStyle}>
            Inicio
          </NavLink>
          <NavLink to="/coleccion" style={navLinkStyle}>
            Mi Colección
          </NavLink>
        </div>

        {/* Search — pushes to right center */}
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

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Verificar en browser**

- El logo `▸ VG COLLECTION` navega a `/` al hacer click.
- "Inicio" está subrayado en rojo en `/`.
- "Mi Colección" está subrayado en rojo en `/coleccion`.
- El header search sigue funcionando en el centro.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/AppLayout.tsx
git commit -m "feat: update AppLayout with Link logo and NavLink tabs"
```

---

## Task 3: Extender IgdbGame y hacer PopularGameCard clickeable

**Files:**
- Modify: `src/features/popular/types.ts`
- Modify: `src/features/popular/ui/PopularGameCard.tsx`
- Modify: `src/shared/ui/HeaderSearch.tsx`

- [ ] **Step 1: Extender `IgdbGame` en `types.ts`**

```ts
// src/features/popular/types.ts
export interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number // Unix timestamp in seconds
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
  total_rating_count?: number
  // Extended fields used by GameDetailPage
  summary?: string
  genres?: Array<{ name: string }>
  involved_companies?: Array<{ company: { name: string }; developer: boolean }>
}
```

- [ ] **Step 2: Hacer `PopularGameCard` clickeable — navega a `/juego/:id`**

```tsx
// src/features/popular/ui/PopularGameCard.tsx
import { useNavigate } from 'react-router-dom'
import type { IgdbGame } from '../types'

/** Converts IGDB cover URL from t_thumb to t_cover_big (264×374) */
function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

interface PopularGameCardProps {
  game: IgdbGame
}

export function PopularGameCard({ game }: PopularGameCardProps) {
  const navigate = useNavigate()
  const coverUrl = getCoverUrl(game.cover.url)
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${game.name}`}
      onClick={() => navigate(`/juego/${game.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/juego/${game.id}`) }}
      style={{
        width: 180,
        flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        cursor: 'pointer',
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
        height: 240,
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
    </div>
  )
}
```

- [ ] **Step 3: Actualizar `HeaderSearch.tsx` — al seleccionar navega a `/juego/:id`**

```tsx
// src/shared/ui/HeaderSearch.tsx
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IgdbGame } from '../../features/popular/types'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'

function getCoverUrl(game: IgdbGame): string | undefined {
  if (!game.cover?.url) return undefined
  const url = game.cover.url.startsWith('//')
    ? `https:${game.cover.url}`
    : game.cover.url
  return url.replace('t_thumb', 't_cover_small')
}

export function HeaderSearch() {
  const [inputValue, setInputValue] = useState('')
  const { results, loading } = useIgdbSearch(inputValue)
  const navigate = useNavigate()

  const options = results.map((game) => {
    const coverUrl = getCoverUrl(game)
    const year = game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null

    return {
      value: String(game.id),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game.name}
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: 'var(--bg-elevated)',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 13 }}>{game.name}</div>
            {year && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{year}</div>}
          </div>
        </div>
      ),
    }
  })

  const noResultsOption =
    inputValue.trim().length >= 2 && !loading && results.length === 0
      ? [{ value: '__no_results__', label: <span style={{ color: 'var(--text-muted)' }}>Sin resultados</span>, disabled: true }]
      : []

  function handleSelect(value: string) {
    if (value === '__no_results__') return
    setInputValue('')
    navigate(`/juego/${value}`)
  }

  return (
    <AutoComplete
      value={inputValue}
      options={[...options, ...noResultsOption]}
      onSelect={handleSelect}
      onSearch={setInputValue}
      style={{ width: 380 }}
      popupMatchSelectWidth={380}
    >
      <Input
        placeholder="Buscar juegos, géneros, plataformas…"
        suffix={
          loading
            ? <LoadingOutlined style={{ color: 'var(--accent)' }} />
            : <SearchOutlined style={{ color: 'var(--text-muted)' }} />
        }
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          borderRadius: 24,
        }}
      />
    </AutoComplete>
  )
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 5: Tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Expected: 23 tests pasan.

- [ ] **Step 6: Commit**

```bash
git add src/features/popular/types.ts src/features/popular/ui/PopularGameCard.tsx src/shared/ui/HeaderSearch.tsx
git commit -m "feat: make PopularGameCard clickable and HeaderSearch navigate to game detail"
```

---

## Task 4: Hook `useIgdbGameDetail`

**Files:**
- Create: `src/features/games/hooks/useIgdbGameDetail.ts`

- [ ] **Step 1: Crear el hook**

```ts
// src/features/games/hooks/useIgdbGameDetail.ts
import { useEffect, useState } from 'react'
import type { IgdbGame } from '../../popular/types'

interface UseIgdbGameDetailResult {
  game: IgdbGame | null
  loading: boolean
  error: string | null
}

export function useIgdbGameDetail(id: string): UseIgdbGameDetailResult {
  const [game, setGame] = useState<IgdbGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setGame(null)
    setLoading(true)
    setError(null)

    const body = [
      'fields name,cover.url,first_release_date,platforms.abbreviation,',
      'total_rating,total_rating_count,summary,genres.name,',
      'involved_companies.company.name,involved_companies.developer;',
      `where id = ${id};`,
      'limit 1;',
    ].join('')

    fetch('/api/igdb/games', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`IGDB ${r.status}`)
        return r.json() as Promise<unknown>
      })
      .then((raw) => {
        if (!Array.isArray(raw) || raw.length === 0) throw new Error('Juego no encontrado')
        if (!cancelled) setGame(raw[0] as IgdbGame)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { game, loading, error }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/games/hooks/useIgdbGameDetail.ts
git commit -m "feat: add useIgdbGameDetail hook"
```

---

## Task 5: `GameDetailPage` — banner inmersivo

**Files:**
- Create: `src/features/games/ui/GameDetailPage.tsx`
- Modify: `src/App.tsx` — reemplazar `GameDetailPagePlaceholder` por import real

- [ ] **Step 1: Crear `GameDetailPage.tsx`**

```tsx
// src/features/games/ui/GameDetailPage.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Tag } from 'antd'
import { ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons'
import { useIgdbGameDetail } from '../hooks/useIgdbGameDetail'
import { useGamesContext } from '../state/GamesContext'
import { useAuthContext } from '../../auth/state/AuthContext'
import type { GameFormPrefill, Platform } from '../../../shared/types/game'

const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  PS1: 'playstation', PS2: 'playstation', PS3: 'playstation',
  PS4: 'playstation', PS5: 'playstation',
  XB: 'xbox', X360: 'xbox', XONE: 'xbox', XSX: 'xbox',
  NS: 'switch',
  iOS: 'mobile', Android: 'mobile',
}

function getCoverUrl(url: string): string {
  return url.replace('t_thumb', 't_cover_big').replace(/^\/\//, 'https://')
}

function GameDetailSkeleton() {
  return (
    <div>
      {/* Banner skeleton */}
      <div
        style={{
          height: 220,
          background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 8,
          marginBottom: 40,
        }}
      />
      {/* Body skeleton */}
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[200, 400, 300].map((w, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: w,
              background: 'var(--bg-elevated)',
              borderRadius: 4,
              animation: 'shimmer 1.5s infinite',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { game, loading, error } = useIgdbGameDetail(id ?? '')
  const { state: gamesState, dispatch } = useGamesContext()
  const { state: authState, dispatch: authDispatch } = useAuthContext()

  if (loading) return <GameDetailSkeleton />

  if (error || game === null) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          No se pudo cargar el juego
        </div>
        <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
          Volver
        </Button>
      </div>
    )
  }

  const coverUrl = game.cover?.url ? getCoverUrl(game.cover.url) : null
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null

  const developer = game.involved_companies?.find((c) => c.developer)?.company.name ?? null

  const rating = game.total_rating !== undefined
    ? Math.round(game.total_rating * 10) / 10
    : null

  const platformLabels = game.platforms?.map((p) => p.abbreviation).join(', ') ?? null
  const genreLabels = game.genres?.map((g) => g.name).join(', ') ?? null

  // Check if game already in collection (by title, case-insensitive)
  const alreadyInCollection = gamesState.games.some(
    (g) => g.title.toLowerCase() === game.name.toLowerCase()
  )

  function handleAddToCollection() {
    if (!authState.isLoggedIn) {
      authDispatch({ type: 'openModal' })
      return
    }

    const platform: Platform =
      game.platforms
        ?.map((p) => IGDB_PLATFORM_MAP[p.abbreviation])
        .find((p) => p !== undefined) ?? 'other'

    const prefill: Partial<GameFormPrefill> = {
      title: game.name,
      ...(year !== null ? { year } : {}),
      platform,
    }

    dispatch({ type: 'openCreateModal', payload: prefill })
  }

  return (
    <>
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ color: 'var(--text-muted)', marginBottom: 16, paddingLeft: 0 }}
      >
        Volver
      </Button>

      {/* Banner hero */}
      <div
        style={{
          position: 'relative',
          height: 220,
          borderRadius: 8,
          background: `linear-gradient(135deg, var(--bg-surface) 0%, rgba(192,57,43,0.3) 100%)`,
          marginBottom: 40,
          overflow: 'visible',
          border: '1px solid var(--border)',
        }}
      >
        {/* Portada superpuesta — emerge hacia abajo */}
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: 32,
            width: 120,
            height: 170,
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                color: 'var(--text-muted)',
              }}
            >
              🎮
            </div>
          )}
        </div>

        {/* Título y desarrollador en el banner */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 176,
            right: 24,
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--text-h)',
              letterSpacing: 1,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {game.name}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {[developer, year].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {/* Body — con padding para dejar espacio a la portada superpuesta */}
      <div style={{ paddingLeft: 32, maxWidth: 800 }}>
        {/* Descripción */}
        {game.summary && (
          <p
            style={{
              color: 'var(--text)',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 28,
              marginTop: 0,
            }}
          >
            {game.summary}
          </p>
        )}

        {/* Stats grid 2×2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 28,
            maxWidth: 500,
          }}
        >
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Rating</div>
            <div style={{ fontSize: 18, color: 'var(--text-h)', fontWeight: 600 }}>
              {rating !== null ? `⭐ ${rating}` : '—'}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Plataforma</div>
            <div style={{ fontSize: 14, color: 'var(--text-h)' }}>{platformLabels ?? '—'}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Lanzamiento</div>
            <div style={{ fontSize: 18, color: 'var(--text-h)', fontWeight: 600 }}>{year ?? '—'}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Género</div>
            <div style={{ fontSize: 14, color: 'var(--text-h)' }}>{genreLabels ?? '—'}</div>
          </div>
        </div>

        {/* Plataformas como tags */}
        {game.platforms && game.platforms.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {game.platforms.map((p) => (
              <Tag key={p.abbreviation} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {p.abbreviation}
              </Tag>
            ))}
          </div>
        )}

        {/* Botón agregar / badge ya en colección */}
        {alreadyInCollection ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(39,174,96,0.12)',
              border: '1px solid #27ae60',
              borderRadius: 6,
              padding: '10px 20px',
              color: '#27ae60',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <CheckCircleFilled />
            Ya en tu colección
          </div>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={handleAddToCollection}
            style={{ borderRadius: 6 }}
          >
            + Agregar a mi colección
          </Button>
        )}
      </div>

      {/* GameFormModal montado aquí para recibir el openCreateModal dispatch */}
      {/* El modal se renderiza globalmente via GamesContext — no necesita instancia local aquí */}
      {/* CollectionPage o GamesPage lo renderiza cuando isCreateModalOpen=true */}
    </>
  )
}
```

> **Nota:** El `GameFormModal` que recibe el dispatch de `openCreateModal` está montado en `CollectionPage` (Task 6). Si el usuario está en `/juego/:id` y agrega un juego, el modal se abre en la página de colección. Para que funcione sin navegar, necesitamos que el modal esté disponible globalmente. La solución más simple: montar `GameFormModal` en `App.tsx` ligado al contexto global.

- [ ] **Step 2: Montar `GameFormModal` global en `App.tsx`**

Agregar un `GlobalGameFormModal` en `App.tsx` que escucha `isCreateModalOpen` del contexto y renderiza el modal. Esto permite que desde cualquier página se pueda abrir el formulario de agregar juego.

```tsx
// Agregar en src/App.tsx — después de los imports existentes
import { useGamesContext } from './features/games/state/GamesContext'
import { GameFormModal, type GameFormValues } from './features/games/ui/GameFormModal'
import { App as AntdApp } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { normalizeOptionalRating } from './features/games/ui/GamesPage'

function GlobalGameFormModal() {
  const { message } = AntdApp.useApp()
  const { state, dispatch } = useGamesContext()

  const isOpen = state.isCreateModalOpen
  const prefill = state.createModalPrefill

  function closeModal() {
    dispatch({ type: 'closeCreateModal' })
  }

  function handleSubmit(values: GameFormValues) {
    const rating = normalizeOptionalRating(values.rating)
    const now = new Date().toISOString()
    dispatch({
      type: 'addGame',
      payload: {
        id: uuidv4(),
        title: values.title,
        platform: values.platform,
        status: values.status,
        genre: values.genre,
        year: values.year,
        rating,
        notes: values.notes,
        createdAt: now,
        updatedAt: now,
      },
    })
    void message.success('Juego creado correctamente')
    closeModal()
  }

  return (
    <GameFormModal
      open={isOpen}
      mode="create"
      prefill={prefill}
      onCancel={closeModal}
      onSubmit={handleSubmit}
    />
  )
}
```

Y en la función `App()`, agregar `<GlobalGameFormModal />` junto a `<LoginModal />`:

```tsx
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GamesProvider>
          <AntdApp>
            <AppRoutes />
            <LoginModal />
            <GlobalGameFormModal />
          </AntdApp>
        </GamesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Actualizar `App.tsx` para importar y usar `GameDetailPage` real**

Reemplazar `GameDetailPagePlaceholder` con el import real:

```tsx
import { GameDetailPage } from './features/games/ui/GameDetailPage'
// ...
<Route path="/juego/:id" element={<GameDetailPage />} />
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 5: Verificar en browser**

1. Hacer click en una tarjeta de "Popular Ahora" → navega a `/juego/:id`.
2. Muestra banner con portada superpuesta, nombre, desarrollador, año.
3. Muestra descripción, stats 2×2, tags de plataforma.
4. Botón "Agregar a mi colección" abre el `GameFormModal` con prefill.
5. Sin sesión: click en botón abre el `LoginModal`.

- [ ] **Step 6: Tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Expected: 23 tests pasan.

- [ ] **Step 7: Commit**

```bash
git add src/features/games/ui/GameDetailPage.tsx src/features/games/hooks/useIgdbGameDetail.ts src/App.tsx
git commit -m "feat: add GameDetailPage with immersive banner and add-to-collection button"
```

---

## Task 6: Hook `useCollectionCovers`

**Files:**
- Create: `src/features/collection/hooks/useCollectionCovers.ts`

- [ ] **Step 1: Crear el hook**

```ts
// src/features/collection/hooks/useCollectionCovers.ts
import { useEffect, useState } from 'react'
import type { Game } from '../../../shared/types/game'

interface CoverEntry {
  coverUrl: string
  igdbId: number
}

type CoversMap = Map<string, CoverEntry> // key: game.id

async function fetchCoverForGame(game: Game): Promise<[string, CoverEntry | null]> {
  const body = `search "${game.title.replace(/"/g, '')}"; fields name,cover.url,id; limit 1;`
  try {
    const res = await fetch('/api/igdb/games', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })
    if (!res.ok) return [game.id, null]
    const raw = (await res.json()) as unknown
    if (!Array.isArray(raw) || raw.length === 0) return [game.id, null]
    const hit = raw[0] as { id: number; cover?: { url: string } }
    if (!hit.cover?.url) return [game.id, null]
    const url = hit.cover.url
      .replace('t_thumb', 't_cover_big')
      .replace(/^\/\//, 'https://')
    return [game.id, { coverUrl: url, igdbId: hit.id }]
  } catch {
    return [game.id, null]
  }
}

async function fetchCoversInBatches(games: Game[], batchSize: number): Promise<CoversMap> {
  const map: CoversMap = new Map()
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(fetchCoverForGame))
    for (const [id, entry] of results) {
      if (entry !== null) map.set(id, entry)
    }
  }
  return map
}

export function useCollectionCovers(games: Game[]): CoversMap {
  const [covers, setCovers] = useState<CoversMap>(new Map())

  useEffect(() => {
    if (games.length === 0) {
      setCovers(new Map())
      return
    }

    let cancelled = false

    void fetchCoversInBatches(games, 5).then((map) => {
      if (!cancelled) setCovers(map)
    })

    return () => { cancelled = true }
  }, [games])

  return covers
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/collection/hooks/useCollectionCovers.ts
git commit -m "feat: add useCollectionCovers hook for IGDB cover lookup by title"
```

---

## Task 7: `CollectionPage` — grid enriquecido con chips de filtro

**Files:**
- Create: `src/features/collection/ui/CollectionPage.tsx`
- Modify: `src/App.tsx` — reemplazar `CollectionPagePlaceholder`

- [ ] **Step 1: Crear `CollectionPage.tsx`**

```tsx
// src/features/collection/ui/CollectionPage.tsx
import { LockOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Input, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAuthContext } from '../../auth/state/AuthContext'
import { useGamesContext } from '../../games/state/GamesContext'
import { GameFormModal, type GameFormValues } from '../../games/ui/GameFormModal'
import { normalizeOptionalRating } from '../../games/ui/GamesPage'
import { useCollectionCovers } from '../hooks/useCollectionCovers'
import type { Game, GameStatus, Platform } from '../../../shared/types/game'

// --- Status badge colors (same as StatusTag) ---
const STATUS_COLORS: Record<GameStatus, { bg: string; text: string; label: string }> = {
  backlog:   { bg: 'rgba(127,140,141,0.2)', text: '#7f8c8d', label: 'Backlog' },
  playing:   { bg: 'rgba(230,126,34,0.2)',  text: '#e67e22', label: 'Jugando' },
  completed: { bg: 'rgba(39,174,96,0.2)',   text: '#27ae60', label: 'Completado' },
  paused:    { bg: 'rgba(52,152,219,0.2)',  text: '#3498db', label: 'Pausado' },
  dropped:   { bg: 'rgba(192,57,43,0.2)',   text: '#c0392b', label: 'Abandonado' },
}

const STATUS_OPTIONS: Array<{ value: GameStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'playing', label: 'Jugando' },
  { value: 'completed', label: 'Completado' },
  { value: 'paused', label: 'Pausado' },
  { value: 'dropped', label: 'Abandonado' },
]

const PLATFORM_OPTIONS: Array<{ value: Platform | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pc', label: 'PC' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'switch', label: 'Switch' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'other', label: 'Otra' },
]

// --- Chip component ---
interface ChipProps {
  label: string
  active: boolean
  onClick: () => void
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 14px',
        borderRadius: 16,
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'rgba(192,57,43,0.12)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  )
}

// --- Game card initials fallback ---
function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// --- CollectionCard ---
interface CollectionCardProps {
  game: Game
  coverUrl: string | undefined
  igdbId: number | undefined
  onEdit: (game: Game) => void
  onComplete: (id: string) => void
}

function CollectionCard({ game, coverUrl, igdbId, onEdit, onComplete }: CollectionCardProps) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const status = STATUS_COLORS[game.status]

  return (
    <div
      style={{
        width: 180,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        cursor: 'default',
        transition: 'transform 200ms, box-shadow 200ms',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hovered ? '0 0 18px var(--accent-dim)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image / fallback */}
      <div style={{ width: 180, height: 240, position: 'relative', overflow: 'hidden' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={game.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-muted)',
              letterSpacing: 2,
            }}
          >
            {getInitials(game.title)}
          </div>
        )}

        {/* Status badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: status.bg,
            color: status.text,
            border: `1px solid ${status.text}`,
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 4,
          }}
        >
          {status.label}
        </div>

        {/* Hover overlay */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 12,
            }}
          >
            <Button size="small" block onClick={() => onEdit(game)}>
              Editar
            </Button>
            {igdbId !== undefined && (
              <Button size="small" block onClick={() => navigate(`/juego/${igdbId}`)}>
                Ver detalle
              </Button>
            )}
            {game.status !== 'completed' && (
              <Button size="small" block type="primary" onClick={() => onComplete(game.id)}>
                Completar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info below image */}
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            color: 'var(--text-h)',
            lineHeight: 1.3,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {game.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {game.platform} · {game.year}
        </div>
        {game.rating !== undefined && (
          <div style={{ fontSize: 12, color: '#f39c12', marginTop: 2 }}>
            ★ {game.rating}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Gate placeholder ---
function CollectionGatePlaceholder() {
  const { dispatch } = useAuthContext()
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
        MI COLECCIÓN
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '64px 24px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
        }}
      >
        <LockOutlined style={{ fontSize: 40, color: 'var(--text-muted)' }} />
        <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para ver tu colección
        </Typography.Text>
        <Button type="primary" onClick={() => dispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    </>
  )
}

// --- Main CollectionPage ---
export function CollectionPage() {
  const { state: authState } = useAuthContext()
  const { state, dispatch } = useGamesContext()
  const { message } = AntdApp.useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')

  // Edit modal state
  const [editingGame, setEditingGame] = useState<Game | undefined>(undefined)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const covers = useCollectionCovers(state.games)

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase()
    return state.games.filter((g) => {
      const matchSearch = q.length === 0 || g.title.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || g.status === statusFilter
      const matchPlatform = platformFilter === 'all' || g.platform === platformFilter
      return matchSearch && matchStatus && matchPlatform
    })
  }, [state.games, search, statusFilter, platformFilter])

  function handleEdit(game: Game) {
    setEditingGame(game)
    setIsEditModalOpen(true)
  }

  function handleComplete(id: string) {
    dispatch({ type: 'markGameCompleted', payload: { id } })
    void message.success('Juego marcado como completado')
  }

  function handleEditSubmit(values: GameFormValues) {
    if (editingGame === undefined) return
    const rating = normalizeOptionalRating(values.rating)
    dispatch({
      type: 'editGame',
      payload: {
        id: editingGame.id,
        updates: {
          title: values.title,
          platform: values.platform,
          status: values.status,
          genre: values.genre,
          year: values.year,
          rating,
          notes: values.notes,
          updatedAt: new Date().toISOString(),
        },
      },
    })
    void message.success('Juego actualizado correctamente')
    setIsEditModalOpen(false)
    setEditingGame(undefined)
  }

  if (!authState.isLoggedIn) return <CollectionGatePlaceholder />

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: 'var(--text-h)',
            letterSpacing: 3,
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 8 }}>▸</span>
          MI COLECCIÓN
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => dispatch({ type: 'openCreateModal', payload: undefined })}
        >
          Agregar juego
        </Button>
      </div>

      {/* Search */}
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
          maxWidth: 400,
        }}
      />

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {STATUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={statusFilter === opt.value}
            onClick={() => setStatusFilter(statusFilter === opt.value && opt.value !== 'all' ? 'all' : opt.value)}
          />
        ))}
      </div>

      {/* Platform chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {PLATFORM_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={platformFilter === opt.value}
            onClick={() => setPlatformFilter(platformFilter === opt.value && opt.value !== 'all' ? 'all' : opt.value)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredGames.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border)',
            borderRadius: 8,
          }}
        >
          {state.games.length === 0
            ? 'Tu colección está vacía. ¡Agregá tu primer juego!'
            : 'Sin resultados para los filtros aplicados.'}
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 20,
        }}
      >
        {filteredGames.map((game) => {
          const coverEntry = covers.get(game.id)
          return (
            <CollectionCard
              key={game.id}
              game={game}
              coverUrl={coverEntry?.coverUrl}
              igdbId={coverEntry?.igdbId}
              onEdit={handleEdit}
              onComplete={handleComplete}
            />
          )
        })}
      </div>

      {/* Edit modal */}
      <GameFormModal
        open={isEditModalOpen}
        mode="edit"
        game={editingGame}
        onCancel={() => { setIsEditModalOpen(false); setEditingGame(undefined) }}
        onSubmit={handleEditSubmit}
      />
    </>
  )
}
```

- [ ] **Step 2: Actualizar `App.tsx` — reemplazar `CollectionPagePlaceholder` con import real**

```tsx
import { CollectionPage } from './features/collection/ui/CollectionPage'
// ...
<Route path="/coleccion" element={<CollectionPage />} />
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 4: Tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Expected: 23 tests pasan.

- [ ] **Step 5: Verificar en browser**

1. Navegar a `/coleccion` sin sesión → muestra gate con candado.
2. Iniciar sesión → muestra grid vacío con mensaje.
3. Agregar un juego desde el botón "Agregar juego" → aparece en el grid.
4. Las chips de estado y plataforma filtran correctamente.
5. Hover en tarjeta → muestra overlay con Editar, Ver detalle (si tiene IGDB id), Completar.
6. Editar un juego → abre el `GameFormModal` con valores pre-cargados.

- [ ] **Step 6: Commit**

```bash
git add src/features/collection/ui/CollectionPage.tsx src/features/collection/hooks/useCollectionCovers.ts src/App.tsx
git commit -m "feat: add CollectionPage with card grid, cover lookup, and filter chips"
```

---

## Task 8: Type-check y test run final

- [ ] **Step 1: Type-check completo**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 2: Tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Expected: 23 tests pasan (los mismos de antes).

- [ ] **Step 3: Verificar flujo completo en browser**

1. `/` — logo clickeable lleva a inicio. Cards de Popular Ahora navegan a `/juego/:id`.
2. `/juego/:id` — banner con portada, descripción, stats. Botón agregar abre modal.
3. Header search — escribir "zelda", seleccionar resultado → navega a `/juego/:id`.
4. `/coleccion` — grid de tarjetas con portadas IGDB. Chips filtran.
5. Tabs del header funcionan con línea roja activa.

- [ ] **Step 4: Commit de fixups si los hubo**

Solo si hubo cambios:

```bash
git add -A
git commit -m "fix: post-integration fixups"
```
