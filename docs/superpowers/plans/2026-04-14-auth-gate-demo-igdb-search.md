# Auth Gate + Demo Credentials + IGDB Header Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate "Tu Colección" behind login, show demo credentials in the login modal, and replace the header search bar with an IGDB autocomplete that pre-fills the game form modal on selection.

**Architecture:** Three independent vertical slices. Auth gate is a pure conditional render in `App.tsx`. Demo card is an `Alert` added to `LoginModal`. IGDB search adds a new hook (`useIgdbSearch`) and rewires `HeaderSearch` to `AutoComplete`; game form pre-fill is propagated via a new `GamesContext` action `openCreateModal(prefill?)` to avoid lifting `GameFormModal` out of `GamesPage`.

**Tech Stack:** React 19, TypeScript strict, Ant Design 6, Vite 8, Vitest

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/App.tsx` | Modify | Conditional render of `GamesPage` / `CollectionGatePlaceholder` |
| `src/features/auth/ui/LoginModal.tsx` | Modify | Add demo credentials `Alert` |
| `src/features/games/state/gamesReducer.ts` | Modify | Add `openCreateModal` / `closeCreateModal` actions + `createModalPrefill` state |
| `src/features/games/state/GamesContext.tsx` | No change | Already wires reducer |
| `src/features/games/ui/GamesPage.tsx` | Modify | Read `state.isCreateModalOpen` / `state.createModalPrefill`, open `GameFormModal` accordingly |
| `src/features/popular/hooks/useIgdbSearch.ts` | Create | Debounced IGDB search hook |
| `src/shared/ui/HeaderSearch.tsx` | Modify | Replace `Input.Search` with `AutoComplete` backed by `useIgdbSearch` |

---

## Task 1: Auth gate — hide Tu Colección when logged out

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `CollectionGatePlaceholder` inline component to `App.tsx`**

Replace the contents of `src/App.tsx` with:

```tsx
import { LockOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { useAuthContext } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { PopularGamesSection } from './features/popular/ui/PopularGamesSection'
import { AppLayout } from './shared/ui/AppLayout'

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
        TU COLECCIÓN
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

function App() {
  const { state } = useAuthContext()

  return (
    <AppLayout>
      <PopularGamesSection />
      {state.isLoggedIn ? <GamesPage /> : <CollectionGatePlaceholder />}
    </AppLayout>
  )
}

function AppWithProviders() {
  return (
    <AuthProviderWrapper>
      <App />
      <LoginModal />
    </AuthProviderWrapper>
  )
}

export default AppWithProviders
```

Wait — `useAuthContext` must be called inside `AuthProvider`. The cleanest fix is to keep `AuthProvider` wrapping everything in `main.tsx` or use the existing `AuthProvider` in `App.tsx`. Use the existing pattern: `AuthProvider` wraps everything in `App.tsx`. The correct final `App.tsx`:

```tsx
import { LockOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import { useAuthContext } from './features/auth/state/AuthContext'
import { AuthProvider } from './features/auth/state/AuthContext'
import { LoginModal } from './features/auth/ui/LoginModal'
import { GamesPage } from './features/games/ui/GamesPage'
import { PopularGamesSection } from './features/popular/ui/PopularGamesSection'
import { AppLayout } from './shared/ui/AppLayout'

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
        TU COLECCIÓN
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

function AppInner() {
  const { state } = useAuthContext()
  return (
    <AppLayout>
      <PopularGamesSection />
      {state.isLoggedIn ? <GamesPage /> : <CollectionGatePlaceholder />}
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
      <LoginModal />
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual verify in browser**

Navigate to `http://localhost:5173`. Confirm:
- "Tu Colección" shows lock icon + "Inicia sesión para ver tu colección" + "Iniciar sesión" button.
- Clicking "Iniciar sesión" opens the login modal.
- After logging in, "Tu Colección" table appears.
- After logging out (header avatar button), lock placeholder reappears.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: gate Tu Coleccion behind login with placeholder"
```

---

## Task 2: Demo credentials card in login modal

**Files:**
- Modify: `src/features/auth/ui/LoginModal.tsx`

- [ ] **Step 1: Add `Alert` import and demo credentials block**

In `LoginModal.tsx`, add `Alert` to the antd import line:

```tsx
import { Alert, App as AntdApp, Button, Form, Input, Modal, Typography } from 'antd'
```

Then, inside the `view === 'login'` branch, add the `Alert` **before** the `<Form>` opening tag:

```tsx
{view === 'login' ? (
  <>
    <Alert
      type="info"
      showIcon={false}
      style={{
        marginBottom: 20,
        background: 'rgba(255,255,255,0.04)',
        border: 'none',
        borderLeft: '4px solid var(--accent)',
        borderRadius: 4,
        padding: '10px 14px',
      }}
      message={
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
            Usuario demo
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Email: <span style={{ color: 'var(--text)' }}>demo@vgcollection.app</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Contraseña: <span style={{ color: 'var(--text)' }}>demo1234</span>
          </div>
        </div>
      }
    />
    <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit}>
      {/* ... existing form items unchanged ... */}
    </Form>
  </>
) : (
  /* register view unchanged */
)}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual verify**

Open the login modal. Confirm the demo credentials card appears above the email/password fields. Switch to register view — card must NOT appear there.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/ui/LoginModal.tsx
git commit -m "feat: add demo credentials card to login modal"
```

---

## Task 3: Add `openCreateModal` action to GamesContext

This propagates the IGDB-selected game prefill into `GamesPage`'s `GameFormModal` without lifting state.

**Files:**
- Modify: `src/features/games/state/gamesReducer.ts`
- Modify: `src/features/games/ui/GamesPage.tsx`

- [ ] **Step 1: Extend `GamesState` in `src/shared/types/game.ts`**

Add two fields to `GamesState`:

```ts
export interface GamesState {
  games: Game[]
  search: string
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
  isCreateModalOpen: boolean
  createModalPrefill: Partial<GameFormPrefill> | undefined
}

// Prefill shape — mirrors GameFormValues from GameFormModal (title, year, platform)
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
}
```

Update `defaultGamesState`:

```ts
export const defaultGamesState: GamesState = {
  games: [],
  search: '',
  platformFilter: 'all',
  statusFilter: 'all',
  isCreateModalOpen: false,
  createModalPrefill: undefined,
}
```

- [ ] **Step 2: Add actions to `gamesReducer.ts`**

Add two new action types to the union:

```ts
export type GamesAction =
  | { type: 'addGame'; payload: Game }
  | { type: 'editGame'; payload: { id: string; updates: Partial<Omit<Game, 'id' | 'createdAt'>> } }
  | { type: 'markGameCompleted'; payload: { id: string } }
  | { type: 'setSearch'; payload: string }
  | { type: 'setPlatformFilter'; payload: Platform | 'all' }
  | { type: 'setStatusFilter'; payload: GameStatus | 'all' }
  | { type: 'openCreateModal'; payload: Partial<GameFormPrefill> | undefined }
  | { type: 'closeCreateModal' }
```

Add the import at the top of `gamesReducer.ts`:

```ts
import type { Game, GameFormPrefill, GameStatus, GamesState, Platform } from '../../../shared/types/game'
```

Add two cases in the `switch`:

```ts
case 'openCreateModal':
  return { ...state, isCreateModalOpen: true, createModalPrefill: action.payload }
case 'closeCreateModal':
  return { ...state, isCreateModalOpen: false, createModalPrefill: undefined }
```

- [ ] **Step 3: Update `GamesPage.tsx` to read `isCreateModalOpen` and `createModalPrefill`**

In `GamesPage.tsx`, replace the local modal open/mode/editingGame state management to also handle the context-driven open:

At the top of the `GamesPage` function body, read the new state:

```ts
const { state, dispatch } = useGamesContext()
const contextPrefill = state.createModalPrefill
const isContextModalOpen = state.isCreateModalOpen
```

Replace the existing `isModalOpen` local state with a computed value that also accounts for the context trigger:

```ts
// Keep local state for edit-triggered opens
const [isLocalModalOpen, setIsLocalModalOpen] = useState(false)
const [modalMode, setModalMode] = useState<ModalMode>('create')
const [editingGame, setEditingGame] = useState<Game | undefined>(undefined)

// Combine: modal is open if either local or context-triggered
const isModalOpen = isLocalModalOpen || isContextModalOpen
```

Update `closeModal`:

```ts
const closeModal = () => {
  setIsLocalModalOpen(false)
  setEditingGame(undefined)
  if (isContextModalOpen) {
    dispatch({ type: 'closeCreateModal' })
  }
}
```

Update `handleCreate` (local button):

```ts
const handleCreate = () => {
  setModalMode('create')
  setEditingGame(undefined)
  setIsLocalModalOpen(true)
}
```

Pass prefill to `GameFormModal`. First, add `prefill` prop to `GameFormModal`.

In `src/features/games/ui/GameFormModal.tsx`, add `prefill?: Partial<GameFormValues>` to `GameFormModalProps`:

```ts
interface GameFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  game?: Game
  prefill?: Partial<GameFormValues>
  onCancel: () => void
  onSubmit: (values: GameFormValues) => void
}
```

In the `useEffect` inside `GameFormModal`, add prefill application for create mode:

```ts
useEffect(() => {
  if (!open) return
  form.resetFields()
  if (mode === 'edit' && game !== undefined) {
    form.setFieldsValue({
      title: game.title,
      platform: game.platform,
      status: game.status,
      genre: game.genre,
      year: game.year,
      rating: game.rating ?? undefined,
      notes: game.notes ?? '',
    })
    return
  }
  form.setFieldsValue(initialValues)
  if (prefill !== undefined) {
    form.setFieldsValue(prefill)
  }
}, [form, game, mode, open, prefill])
```

Back in `GamesPage.tsx`, pass the combined prefill to `GameFormModal`:

```tsx
<GameFormModal
  open={isModalOpen}
  mode={isContextModalOpen ? 'create' : modalMode}
  game={isContextModalOpen ? undefined : editingGame}
  prefill={isContextModalOpen ? contextPrefill : undefined}
  onCancel={closeModal}
  onSubmit={handleSubmit}
/>
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/game.ts src/features/games/state/gamesReducer.ts src/features/games/ui/GamesPage.tsx src/features/games/ui/GameFormModal.tsx
git commit -m "feat: add openCreateModal action to GamesContext for IGDB prefill"
```

---

## Task 4: `useIgdbSearch` hook

**Files:**
- Create: `src/features/popular/hooks/useIgdbSearch.ts`

- [ ] **Step 1: Create the hook**

```ts
// src/features/popular/hooks/useIgdbSearch.ts
import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbSearchResult {
  results: IgdbGame[]
  loading: boolean
}

export function useIgdbSearch(query: string): UseIgdbSearchResult {
  const [results, setResults] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let debounceTimer: ReturnType<typeof setTimeout>

    debounceTimer = setTimeout(() => {
      setLoading(true)
      const body = `search "${trimmed}"; fields name,cover.url,first_release_date,platforms.abbreviation; limit 8;`

      fetch('/api/igdb/games', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error(`IGDB ${r.status}`)
          return r.json() as Promise<unknown>
        })
        .then((raw) => {
          if (Array.isArray(raw)) setResults(raw as IgdbGame[])
        })
        .catch((err) => {
          if ((err as Error).name !== 'AbortError') setResults([])
        })
        .finally(() => setLoading(false))
    }, 400)

    return () => {
      clearTimeout(debounceTimer)
      controller.abort()
    }
  }, [query])

  return { results, loading }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/hooks/useIgdbSearch.ts
git commit -m "feat: add useIgdbSearch hook with debounce and abort"
```

---

## Task 5: Rewire `HeaderSearch` to IGDB `AutoComplete`

**Files:**
- Modify: `src/shared/ui/HeaderSearch.tsx`

- [ ] **Step 1: Rewrite `HeaderSearch.tsx`**

```tsx
// src/shared/ui/HeaderSearch.tsx
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'
import { useState } from 'react'
import type { IgdbGame } from '../../features/popular/types'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'
import { useGamesContext } from '../../features/games/state/GamesContext'
import type { GameFormPrefill, Platform } from '../types/game'

// Maps IGDB platform abbreviations to local Platform enum
const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  PS1: 'playstation', PS2: 'playstation', PS3: 'playstation',
  PS4: 'playstation', PS5: 'playstation',
  XB: 'xbox', X360: 'xbox', XONE: 'xbox', XSX: 'xbox',
  NS: 'switch',
  iOS: 'mobile', Android: 'mobile',
}

function mapIgdbToFormPrefill(game: IgdbGame): Partial<GameFormPrefill> {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : undefined

  const platform: Platform =
    game.platforms
      ?.map((p) => IGDB_PLATFORM_MAP[p.abbreviation])
      .find((p) => p !== undefined) ?? 'other'

  return {
    title: game.name,
    ...(year !== undefined ? { year } : {}),
    platform,
  }
}

function getCoverUrl(game: IgdbGame): string | undefined {
  if (!game.cover?.url) return undefined
  // IGDB returns protocol-relative URLs like //images.igdb.com/...
  const url = game.cover.url.startsWith('//')
    ? `https:${game.cover.url}`
    : game.cover.url
  // Replace thumbnail size with small cover
  return url.replace('t_thumb', 't_cover_small')
}

export function HeaderSearch() {
  const [inputValue, setInputValue] = useState('')
  const { results, loading } = useIgdbSearch(inputValue)
  const { dispatch } = useGamesContext()

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
              style={{
                width: 32,
                height: 32,
                objectFit: 'cover',
                borderRadius: 4,
                flexShrink: 0,
              }}
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
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 13 }}>
              {game.name}
            </div>
            {year && (
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{year}</div>
            )}
          </div>
        </div>
      ),
    }
  })

  // Add "sin resultados" entry when query is long enough but empty results returned
  const noResultsOption =
    inputValue.trim().length >= 2 && !loading && results.length === 0
      ? [{ value: '__no_results__', label: <span style={{ color: 'var(--text-muted)' }}>Sin resultados</span>, disabled: true }]
      : []

  function handleSelect(value: string) {
    if (value === '__no_results__') return
    const game = results.find((g) => String(g.id) === value)
    if (!game) return
    const prefill = mapIgdbToFormPrefill(game)
    dispatch({ type: 'openCreateModal', payload: prefill })
    setInputValue('')
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

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual verify in browser**

1. Log in with any credentials.
2. Type "zelda" in the header search.
3. After ~400 ms, a dropdown appears with game covers, names, and years.
4. Select a game.
5. The "Crear juego" modal opens with Title and Year pre-filled.
6. Complete the remaining fields and submit.
7. The game appears in Tu Colección.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/HeaderSearch.tsx
git commit -m "feat: replace header search with IGDB autocomplete"
```

---

## Task 6: Final type-check and test run

- [ ] **Step 1: Full type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Expected: all tests pass (pre-existing worktree failures excluded).

- [ ] **Step 3: Commit if any fixups needed**

```bash
git add -A
git commit -m "fix: post-integration fixups"
```

Only commit if there were actual changes. Skip if tests passed clean.
