# Auth Gate + Credenciales Demo + Búsqueda IGDB en el Header — Plan de implementación

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan la sintaxis de checkbox (`- [ ]`) para el seguimiento.

**Goal:** Bloquear "Tu Colección" detrás del login, mostrar credenciales demo en el modal de login, y reemplazar la barra de búsqueda del header por un autocompletado de IGDB que precargue el modal del formulario de juego al seleccionar un resultado.

**Architecture:** Tres slices verticales independientes. El auth gate es un render condicional puro en `App.tsx`. La tarjeta demo es un `Alert` añadido a `LoginModal`. La búsqueda IGDB agrega un nuevo hook (`useIgdbSearch`) y rehace `HeaderSearch` sobre `AutoComplete`; el precargado del formulario de juego se propaga mediante una nueva acción de `GamesContext` llamada `openCreateModal(prefill?)`, para evitar sacar `GameFormModal` fuera de `GamesPage`.

**Tech Stack:** React 19, TypeScript strict, Ant Design 6, Vite 8, Vitest

---

## Mapa de archivos

| Archivo | Acción | Propósito |
|---|---|---|
| `src/App.tsx` | Modificar | Render condicional de `GamesPage` / `CollectionGatePlaceholder` |
| `src/features/auth/ui/LoginModal.tsx` | Modificar | Añadir `Alert` con credenciales demo |
| `src/features/games/state/gamesReducer.ts` | Modificar | Añadir acciones `openCreateModal` / `closeCreateModal` + estado `createModalPrefill` |
| `src/features/games/state/GamesContext.tsx` | Sin cambios | Ya conecta el reducer |
| `src/features/games/ui/GamesPage.tsx` | Modificar | Leer `state.isCreateModalOpen` / `state.createModalPrefill`, abrir `GameFormModal` en consecuencia |
| `src/features/popular/hooks/useIgdbSearch.ts` | Crear | Hook de búsqueda IGDB con debounce |
| `src/shared/ui/HeaderSearch.tsx` | Modificar | Reemplazar `Input.Search` por `AutoComplete` respaldado por `useIgdbSearch` |

---

## Task 1: Auth gate — ocultar Tu Colección cuando no hay sesión iniciada

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Añadir el componente inline `CollectionGatePlaceholder` a `App.tsx`**

Reemplazar el contenido de `src/App.tsx` por:

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

Un momento — `useAuthContext` debe llamarse dentro de `AuthProvider`. La solución más limpia es mantener `AuthProvider` envolviendo todo en `main.tsx`, o usar el `AuthProvider` existente en `App.tsx`. Se usa el patrón existente: `AuthProvider` envuelve todo en `App.tsx`. El `App.tsx` final correcto:

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

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Verificación manual en el navegador**

Navegar a `http://localhost:5173`. Confirmar:
- "Tu Colección" muestra ícono de candado + "Inicia sesión para ver tu colección" + botón "Iniciar sesión".
- Al hacer clic en "Iniciar sesión" se abre el modal de login.
- Después de iniciar sesión, aparece la tabla de "Tu Colección".
- Después de cerrar sesión (botón de avatar en el header), reaparece el placeholder de candado.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: gate Tu Coleccion behind login with placeholder"
```

---

## Task 2: Tarjeta de credenciales demo en el modal de login

**Files:**
- Modify: `src/features/auth/ui/LoginModal.tsx`

- [ ] **Step 1: Añadir el import de `Alert` y el bloque de credenciales demo**

En `LoginModal.tsx`, añadir `Alert` a la línea de import de antd:

```tsx
import { Alert, App as AntdApp, Button, Form, Input, Modal, Typography } from 'antd'
```

Luego, dentro de la rama `view === 'login'`, añadir el `Alert` **antes** de la etiqueta de apertura de `<Form>`:

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

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Verificación manual**

Abrir el modal de login. Confirmar que la tarjeta de credenciales demo aparece encima de los campos de email/contraseña. Cambiar a la vista de registro — la tarjeta NO debe aparecer ahí.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/ui/LoginModal.tsx
git commit -m "feat: add demo credentials card to login modal"
```

---

## Task 3: Añadir la acción `openCreateModal` a GamesContext

Esto propaga el precargado del juego seleccionado en IGDB hacia el `GameFormModal` de `GamesPage` sin levantar el estado.

**Files:**
- Modify: `src/features/games/state/gamesReducer.ts`
- Modify: `src/features/games/ui/GamesPage.tsx`

- [ ] **Step 1: Extender `GamesState` en `src/shared/types/game.ts`**

Añadir dos campos a `GamesState`:

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

Actualizar `defaultGamesState`:

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

- [ ] **Step 2: Añadir acciones a `gamesReducer.ts`**

Añadir dos nuevos tipos de acción a la unión:

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

Añadir el import al inicio de `gamesReducer.ts`:

```ts
import type { Game, GameFormPrefill, GameStatus, GamesState, Platform } from '../../../shared/types/game'
```

Añadir dos casos en el `switch`:

```ts
case 'openCreateModal':
  return { ...state, isCreateModalOpen: true, createModalPrefill: action.payload }
case 'closeCreateModal':
  return { ...state, isCreateModalOpen: false, createModalPrefill: undefined }
```

- [ ] **Step 3: Actualizar `GamesPage.tsx` para leer `isCreateModalOpen` y `createModalPrefill`**

En `GamesPage.tsx`, reemplazar el manejo del estado local de apertura/modo/juego en edición del modal para que también maneje la apertura disparada desde el contexto.

Al inicio del cuerpo de la función `GamesPage`, leer el nuevo estado:

```ts
const { state, dispatch } = useGamesContext()
const contextPrefill = state.createModalPrefill
const isContextModalOpen = state.isCreateModalOpen
```

Reemplazar el estado local `isModalOpen` existente por un valor calculado que también tenga en cuenta el disparador del contexto:

```ts
// Keep local state for edit-triggered opens
const [isLocalModalOpen, setIsLocalModalOpen] = useState(false)
const [modalMode, setModalMode] = useState<ModalMode>('create')
const [editingGame, setEditingGame] = useState<Game | undefined>(undefined)

// Combine: modal is open if either local or context-triggered
const isModalOpen = isLocalModalOpen || isContextModalOpen
```

Actualizar `closeModal`:

```ts
const closeModal = () => {
  setIsLocalModalOpen(false)
  setEditingGame(undefined)
  if (isContextModalOpen) {
    dispatch({ type: 'closeCreateModal' })
  }
}
```

Actualizar `handleCreate` (botón local):

```ts
const handleCreate = () => {
  setModalMode('create')
  setEditingGame(undefined)
  setIsLocalModalOpen(true)
}
```

Pasar el precargado a `GameFormModal`. Primero, añadir la prop `prefill` a `GameFormModal`.

En `src/features/games/ui/GameFormModal.tsx`, añadir `prefill?: Partial<GameFormValues>` a `GameFormModalProps`:

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

En el `useEffect` dentro de `GameFormModal`, añadir la aplicación del precargado para el modo de creación:

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

De vuelta en `GamesPage.tsx`, pasar el precargado combinado a `GameFormModal`:

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

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/game.ts src/features/games/state/gamesReducer.ts src/features/games/ui/GamesPage.tsx src/features/games/ui/GameFormModal.tsx
git commit -m "feat: add openCreateModal action to GamesContext for IGDB prefill"
```

---

## Task 4: Hook `useIgdbSearch`

**Files:**
- Create: `src/features/popular/hooks/useIgdbSearch.ts`

- [ ] **Step 1: Crear el hook**

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

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/features/popular/hooks/useIgdbSearch.ts
git commit -m "feat: add useIgdbSearch hook with debounce and abort"
```

---

## Task 5: Rehacer `HeaderSearch` sobre `AutoComplete` de IGDB

**Files:**
- Modify: `src/shared/ui/HeaderSearch.tsx`

- [ ] **Step 1: Reescribir `HeaderSearch.tsx`**

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

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Verificación manual en el navegador**

1. Iniciar sesión con cualquier credencial.
2. Escribir "zelda" en la búsqueda del header.
3. Después de ~400 ms, aparece un dropdown con carátulas, nombres y años de los juegos.
4. Seleccionar un juego.
5. Se abre el modal "Crear juego" con Título y Año precargados.
6. Completar los campos restantes y enviar.
7. El juego aparece en Tu Colección.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui/HeaderSearch.tsx
git commit -m "feat: replace header search with IGDB autocomplete"
```

---

## Task 6: Verificación de tipos y ejecución de tests final

- [ ] **Step 1: Verificación de tipos completa**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 2: Ejecutar tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Esperado: todos los tests pasan (excluyendo fallos preexistentes de worktree).

- [ ] **Step 3: Commit si se necesitan ajustes**

```bash
git add -A
git commit -m "fix: post-integration fixups"
```

Solo hacer commit si hubo cambios reales. Omitir si los tests pasaron limpio.
