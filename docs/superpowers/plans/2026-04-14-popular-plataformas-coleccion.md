# Popular Ahora + Plataformas Expandidas + Fix Colección — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two home-page sections (top-rated carousel + recent grid), expand Platform type to ~30 consoles grouped by manufacturer, and fix "Ya en tu colección" detection by comparing IGDB ids.

**Architecture:** Types come first (shared/types/game.ts), then storage validation, then test migration, then UI bottom-up (hooks → components → pages). Each task is self-contained and verified before the next.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Ant Design 6, Vitest, React Router v7

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/shared/types/game.ts` | Modify | Expand `Platform`, add `PLATFORM_LABELS`, add `igdbId?` to `Game` and `GameFormPrefill` |
| `src/shared/lib/storage/gamesStorage.ts` | Modify | Replace `VALID_PLATFORMS` with all 30 new values |
| `src/features/games/state/gamesReducer.test.ts` | Modify | Migrate `'xbox'` → `'xbone'` (only breaking value) |
| `src/features/games/ui/GameFormModal.tsx` | Modify | Replace flat `options` with `Select.OptGroup` groups; add hidden `igdbId` field |
| `src/features/games/ui/GameDetailPage.tsx` | Modify | Expand `IGDB_PLATFORM_MAP`, dispatch with `igdbId`, compare by `igdbId` first |
| `src/App.tsx` | Modify | `GlobalGameFormModal.handleSubmit` includes `igdbId: values.igdbId` |
| `src/features/collection/ui/CollectionPage.tsx` | Modify | Replace `PLATFORM_OPTIONS` with `PlatformGroup` chips; show `PLATFORM_LABELS[game.platform]` |
| `src/features/popular/hooks/useIgdbRecentGames.ts` | Create | Hook that fetches recent games from IGDB (last 2 years, sorted by release date desc) |
| `src/features/popular/ui/PopularGamesSection.tsx` | Modify | Accept `title: string` and `layout: 'carousel' \| 'grid'` props |
| `src/features/home/ui/HomePage.tsx` | Modify | Mount two `PopularGamesSection` instances |

---

### Task 1: Expand `Platform` type and add `PLATFORM_LABELS`

**Files:**
- Modify: `src/shared/types/game.ts`

- [ ] **Step 1: Replace the `Platform` type and add `PLATFORM_LABELS`**

Replace the entire file content:

```ts
export type Platform =
  // Sega
  | 'sega-ms'
  | 'sega-md'
  | 'sega-saturn'
  | 'sega-dc'
  // Nintendo — home
  | 'nes'
  | 'snes'
  | 'n64'
  | 'gamecube'
  | 'wii'
  | 'wiiu'
  | 'switch'
  // Nintendo — portátiles
  | 'gameboy'
  | 'gbc'
  | 'gba'
  | 'nds'
  | '3ds'
  // PlayStation — home
  | 'ps1'
  | 'ps2'
  | 'ps3'
  | 'ps4'
  | 'ps5'
  // PlayStation — portátiles
  | 'psp'
  | 'psvita'
  // Microsoft
  | 'xbox'
  | 'xbox360'
  | 'xbone'
  | 'xbsx'
  // PC
  | 'pc'
  // Commodore
  | 'c64'
  | 'amiga'
  // Otra
  | 'other'

export const PLATFORM_LABELS: Record<Platform, string> = {
  'sega-ms': 'Master System',
  'sega-md': 'Mega Drive',
  'sega-saturn': 'Saturn',
  'sega-dc': 'Dreamcast',
  nes: 'NES',
  snes: 'SNES',
  n64: 'Nintendo 64',
  gamecube: 'GameCube',
  wii: 'Wii',
  wiiu: 'Wii U',
  switch: 'Nintendo Switch',
  gameboy: 'Game Boy',
  gbc: 'Game Boy Color',
  gba: 'Game Boy Advance',
  nds: 'Nintendo DS',
  '3ds': 'Nintendo 3DS',
  ps1: 'PlayStation 1',
  ps2: 'PlayStation 2',
  ps3: 'PlayStation 3',
  ps4: 'PlayStation 4',
  ps5: 'PlayStation 5',
  psp: 'PSP',
  psvita: 'PS Vita',
  xbox: 'Xbox',
  xbox360: 'Xbox 360',
  xbone: 'Xbox One',
  xbsx: 'Xbox Series X/S',
  pc: 'PC',
  c64: 'Commodore 64',
  amiga: 'Amiga',
  other: 'Otra',
}

export type GameStatus = 'backlog' | 'playing' | 'completed' | 'paused' | 'dropped'

export interface Game {
  id: string
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdbId?: number
  createdAt: string
  updatedAt: string
}

// Prefill shape — mirrors GameFormValues from GameFormModal (title, year, platform)
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
  igdbId?: number
}

export interface GamesState {
  games: Game[]
  search: string
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
  isCreateModalOpen: boolean
  createModalPrefill: Partial<GameFormPrefill> | undefined
}

export const defaultGamesState: GamesState = {
  games: [],
  search: '',
  platformFilter: 'all',
  statusFilter: 'all',
  isCreateModalOpen: false,
  createModalPrefill: undefined,
}
```

- [ ] **Step 2: Verify TypeScript compiles (only this file, quickly)**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: Errors mentioning `gamesStorage.ts` (VALID_PLATFORMS still has old values) and test files. That's expected — we fix them in subsequent tasks. No errors in `game.ts` itself.

---

### Task 2: Update `VALID_PLATFORMS` in `gamesStorage.ts`

**Files:**
- Modify: `src/shared/lib/storage/gamesStorage.ts`

- [ ] **Step 1: Replace `VALID_PLATFORMS` array**

Change lines 11–18 from:

```ts
const VALID_PLATFORMS: Platform[] = [
  'pc',
  'playstation',
  'xbox',
  'switch',
  'mobile',
  'other',
]
```

To:

```ts
const VALID_PLATFORMS: Platform[] = [
  'sega-ms', 'sega-md', 'sega-saturn', 'sega-dc',
  'nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch',
  'gameboy', 'gbc', 'gba', 'nds', '3ds',
  'ps1', 'ps2', 'ps3', 'ps4', 'ps5',
  'psp', 'psvita',
  'xbox', 'xbox360', 'xbone', 'xbsx',
  'pc',
  'c64', 'amiga',
  'other',
]
```

- [ ] **Step 2: Run tsc to check storage compiles cleanly**

Run: `npx tsc --noEmit 2>&1 | grep gamesStorage`

Expected: No errors for `gamesStorage.ts`.

---

### Task 3: Migrate test files with old Platform values

**Files:**
- Modify: `src/features/games/state/gamesReducer.test.ts`

The only breaking value in tests is `'xbox'` in `gamesReducer.test.ts` — the old `'xbox'` was a generic Xbox catch-all that no longer exists. Map it to `'xbone'` (Xbox One), which is the closest equivalent in the new type.

`'switch'` and `'pc'` in other test files are still valid Platform values — no changes needed there.

- [ ] **Step 1: Migrate `'xbox'` → `'xbone'` in gamesReducer.test.ts**

In `src/features/games/state/gamesReducer.test.ts`:

Change line 9:
```ts
  platform: 'xbox',
```
To:
```ts
  platform: 'xbone',
```

Change line 76:
```ts
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbox' })
```
To:
```ts
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbone' })
```

Change line 80:
```ts
    expect(nextState.platformFilter).toBe('xbox')
```
To:
```ts
    expect(nextState.platformFilter).toBe('xbone')
```

- [ ] **Step 2: Run tests to confirm all 23 pass**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Expected: `23 passed` (or equivalent count — all passing, 0 failed).

- [ ] **Step 3: Commit types + storage + test migration**

```bash
git add src/shared/types/game.ts src/shared/lib/storage/gamesStorage.ts src/features/games/state/gamesReducer.test.ts
git commit -m "feat: expand Platform type to 30 consoles and add PLATFORM_LABELS"
```

---

### Task 4: Update `GameFormModal` with grouped select and hidden `igdbId`

**Files:**
- Modify: `src/features/games/ui/GameFormModal.tsx`

- [ ] **Step 1: Replace the platform select with `Select.OptGroup` and add hidden `igdbId` field**

Replace the entire file with:

```tsx
import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'

import type { Game, GameStatus, Platform } from '../../../shared/types/game'

const statusOptions: Array<{ label: string; value: GameStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

interface GameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdbId?: number
}

interface GameFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  game?: Game
  prefill?: Partial<GameFormValues>
  onCancel: () => void
  onSubmit: (values: GameFormValues) => void
}

const initialValues: Partial<GameFormValues> = {
  title: '',
  genre: '',
  year: undefined,
  rating: undefined,
  notes: '',
}

export function GameFormModal({ open, mode, game, prefill, onCancel, onSubmit }: GameFormModalProps) {
  const [form] = Form.useForm<GameFormValues>()

  useEffect(() => {
    if (!open) {
      return
    }

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

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Crear juego' : 'Editar juego'}
      okText={mode === 'create' ? 'Crear' : 'Guardar'}
      cancelText="Cancelar"
      onCancel={onCancel}
      onOk={() => {
        form.submit()
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
        <Form.Item
          label="Titulo"
          name="title"
          rules={[{ required: true, message: 'El titulo es obligatorio' }]}
        >
          <Input aria-label="Titulo" placeholder="Ej. The Legend of Zelda" />
        </Form.Item>

        <Form.Item
          label="Plataforma"
          name="platform"
          rules={[{ required: true, message: 'La plataforma es obligatoria' }]}
        >
          <Select aria-label="Plataforma">
            <Select.OptGroup label="Sega">
              <Select.Option value="sega-ms">Master System</Select.Option>
              <Select.Option value="sega-md">Mega Drive</Select.Option>
              <Select.Option value="sega-saturn">Saturn</Select.Option>
              <Select.Option value="sega-dc">Dreamcast</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Nintendo">
              <Select.Option value="nes">NES</Select.Option>
              <Select.Option value="snes">SNES</Select.Option>
              <Select.Option value="n64">Nintendo 64</Select.Option>
              <Select.Option value="gamecube">GameCube</Select.Option>
              <Select.Option value="wii">Wii</Select.Option>
              <Select.Option value="wiiu">Wii U</Select.Option>
              <Select.Option value="switch">Nintendo Switch</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Portátiles Nintendo">
              <Select.Option value="gameboy">Game Boy</Select.Option>
              <Select.Option value="gbc">Game Boy Color</Select.Option>
              <Select.Option value="gba">Game Boy Advance</Select.Option>
              <Select.Option value="nds">Nintendo DS</Select.Option>
              <Select.Option value="3ds">Nintendo 3DS</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="PlayStation">
              <Select.Option value="ps1">PlayStation 1</Select.Option>
              <Select.Option value="ps2">PlayStation 2</Select.Option>
              <Select.Option value="ps3">PlayStation 3</Select.Option>
              <Select.Option value="ps4">PlayStation 4</Select.Option>
              <Select.Option value="ps5">PlayStation 5</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Portátiles Sony">
              <Select.Option value="psp">PSP</Select.Option>
              <Select.Option value="psvita">PS Vita</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Microsoft">
              <Select.Option value="xbox">Xbox</Select.Option>
              <Select.Option value="xbox360">Xbox 360</Select.Option>
              <Select.Option value="xbone">Xbox One</Select.Option>
              <Select.Option value="xbsx">Xbox Series X/S</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="PC">
              <Select.Option value="pc">PC</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Commodore">
              <Select.Option value="c64">Commodore 64</Select.Option>
              <Select.Option value="amiga">Amiga</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Otra">
              <Select.Option value="other">Otra</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado"
          name="status"
          rules={[{ required: true, message: 'El estado es obligatorio' }]}
        >
          <Select aria-label="Estado" options={statusOptions} />
        </Form.Item>

        <Form.Item
          label="Genero"
          name="genre"
          rules={[{ required: true, message: 'El genero es obligatorio' }]}
        >
          <Input aria-label="Genero" placeholder="Ej. RPG" />
        </Form.Item>

        <Form.Item
          label="Anio"
          name="year"
          rules={[
            { required: true, message: 'El anio es obligatorio' },
            { type: 'number', min: 1970, max: 2100, message: 'El anio debe estar entre 1970 y 2100' },
          ]}
        >
          <InputNumber aria-label="Anio" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Nota" name="rating">
          <InputNumber min={0} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Hidden field — carries igdbId from prefill so it gets submitted */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Expected: All tests pass (the existing `GameFormModal` tests use `'pc'` and `'switch'`, both still valid).

- [ ] **Step 3: Commit**

```bash
git add src/features/games/ui/GameFormModal.tsx
git commit -m "feat: update GameFormModal with grouped platform select and hidden igdbId field"
```

---

### Task 5: Update `GameDetailPage` — IGDB map, igdbId dispatch, collection comparison

**Files:**
- Modify: `src/features/games/ui/GameDetailPage.tsx`

- [ ] **Step 1: Replace `IGDB_PLATFORM_MAP`, update `alreadyInCollection` check, and update `handleAddToCollection` dispatch**

Change lines 10–17 (IGDB_PLATFORM_MAP):

```ts
const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  // PlayStation
  PS1: 'ps1', PS2: 'ps2', PS3: 'ps3', PS4: 'ps4', PS5: 'ps5',
  PSP: 'psp', 'PS Vita': 'psvita',
  // Microsoft
  XB: 'xbox', X360: 'xbox360', XONE: 'xbone', XSX: 'xbsx',
  // Nintendo
  NES: 'nes', SNES: 'snes', N64: 'n64', NGC: 'gamecube',
  Wii: 'wii', WiiU: 'wiiu', NS: 'switch',
  GB: 'gameboy', GBC: 'gbc', GBA: 'gba', NDS: 'nds', '3DS': '3ds',
  // Sega
  SMS: 'sega-ms', 'Mega Drive': 'sega-md', SAT: 'sega-saturn', DC: 'sega-dc',
  // Commodore
  C64: 'c64', AMI: 'amiga',
  // Mobile (legacy)
  iOS: 'other', Android: 'other',
}
```

Change lines 93–95 (`alreadyInCollection`):

```ts
  const alreadyInCollection = gamesState.games.some(
    (g) => (g.igdbId !== undefined && g.igdbId === game.id)
      || g.title.toLowerCase() === game.name.toLowerCase()
  )
```

Change lines 108–114 (`prefill` and `dispatch`):

```ts
    const prefill: Partial<GameFormPrefill> = {
      title: game.name,
      ...(year !== null ? { year } : {}),
      platform,
      igdbId: game.id,
    }

    dispatch({ type: 'openCreateModal', payload: prefill })
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit 2>&1 | grep GameDetailPage`

Expected: No errors.

- [ ] **Step 3: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/games/ui/GameDetailPage.tsx
git commit -m "feat: update GameDetailPage with expanded IGDB map and igdbId-based collection check"
```

---

### Task 6: Update `App.tsx` — pass `igdbId` when adding game

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Include `igdbId` in `addGame` dispatch payload**

In `GlobalGameFormModal.handleSubmit`, change the `dispatch` call (lines 29–43) from:

```ts
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
```

To:

```ts
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
        igdbId: values.igdbId,
        createdAt: now,
        updatedAt: now,
      },
    })
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit 2>&1 | grep "App.tsx"`

Expected: No errors.

- [ ] **Step 3: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: pass igdbId through GlobalGameFormModal when creating game from IGDB detail"
```

---

### Task 7: Update `CollectionPage` — manufacturer group chips and `PLATFORM_LABELS`

**Files:**
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Replace platform filter state and chips with manufacturer groups**

Make the following changes to `CollectionPage.tsx`:

1. Add `PLATFORM_LABELS` to the import from `game.ts`:

```ts
import type { Game, GameStatus, Platform } from '../../../shared/types/game'
import { PLATFORM_LABELS } from '../../../shared/types/game'
```

2. Replace `PLATFORM_OPTIONS` (lines 31–39) with:

```ts
type PlatformGroup = 'all' | 'sega' | 'nintendo' | 'playstation' | 'microsoft' | 'pc' | 'commodore' | 'other'

const PLATFORM_GROUPS: Record<PlatformGroup, Platform[] | 'all'> = {
  all: 'all',
  sega: ['sega-ms', 'sega-md', 'sega-saturn', 'sega-dc'],
  nintendo: ['nes', 'snes', 'n64', 'gamecube', 'wii', 'wiiu', 'switch', 'gameboy', 'gbc', 'gba', 'nds', '3ds'],
  playstation: ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'psp', 'psvita'],
  microsoft: ['xbox', 'xbox360', 'xbone', 'xbsx'],
  pc: ['pc'],
  commodore: ['c64', 'amiga'],
  other: ['other'],
}

const PLATFORM_GROUP_OPTIONS: Array<{ value: PlatformGroup; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'sega', label: 'Sega' },
  { value: 'nintendo', label: 'Nintendo' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'microsoft', label: 'Microsoft' },
  { value: 'pc', label: 'PC' },
  { value: 'commodore', label: 'Commodore' },
  { value: 'other', label: 'Otra' },
]
```

3. Change `platformFilter` state type from `Platform | 'all'` to `PlatformGroup`:

```ts
  const [platformFilter, setPlatformFilter] = useState<PlatformGroup>('all')
```

4. Update `filteredGames` `matchPlatform` logic:

```ts
      const platformValues = PLATFORM_GROUPS[platformFilter]
      const matchPlatform =
        platformFilter === 'all' ||
        platformValues === 'all' ||
        (Array.isArray(platformValues) && platformValues.includes(g.platform))
```

5. Replace the platform chips render (the `PLATFORM_OPTIONS.map` block) with:

```tsx
      {/* Platform chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {PLATFORM_GROUP_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={platformFilter === opt.value}
            onClick={() => setPlatformFilter(platformFilter === opt.value && opt.value !== 'all' ? 'all' : opt.value)}
          />
        ))}
      </div>
```

6. In `CollectionCard`, change the platform display line (line 207):

```tsx
          {PLATFORM_LABELS[game.platform]} · {game.year}
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit 2>&1 | grep CollectionPage`

Expected: No errors.

- [ ] **Step 3: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: update CollectionPage with manufacturer group chips and PLATFORM_LABELS display"
```

---

### Task 8: Create `useIgdbRecentGames` hook

**Files:**
- Create: `src/features/popular/hooks/useIgdbRecentGames.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useState } from 'react'
import type { IgdbGame } from '../types'

interface UseIgdbRecentGamesResult {
  games: IgdbGame[]
  loading: boolean
  error: string | null
}

export function useIgdbRecentGames(): UseIgdbRecentGamesResult {
  const [games, setGames] = useState<IgdbGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGames() {
      setLoading(true)
      setError(null)

      const nowSec = Math.floor(Date.now() / 1000)
      const twoYearsAgoSec = nowSec - 2 * 365 * 24 * 60 * 60

      const query = [
        'fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;',
        `where cover != null & first_release_date < ${nowSec} & first_release_date > ${twoYearsAgoSec};`,
        'sort first_release_date desc;',
        'limit 20;',
      ].join('\n')

      try {
        const res = await fetch('/api/igdb/games', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: query,
        })
        if (!res.ok) throw new Error(`IGDB error ${res.status}`)
        const raw = (await res.json()) as unknown
        if (!Array.isArray(raw)) throw new Error('Unexpected IGDB response shape')
        const data = raw as IgdbGame[]
        if (!cancelled) setGames(data)
      } catch {
        if (!cancelled) setError('No se pudo cargar lanzamientos recientes')
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

- [ ] **Step 2: Run tsc to verify new file compiles**

Run: `npx tsc --noEmit 2>&1 | grep useIgdbRecentGames`

Expected: No output (no errors).

- [ ] **Step 3: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Expected: All tests pass.

---

### Task 9: Update `PopularGamesSection` with `layout` and `title` props

**Files:**
- Modify: `src/features/popular/ui/PopularGamesSection.tsx`

- [ ] **Step 1: Replace the component with layout-aware version**

```tsx
import { useIgdbPopularGames } from '../hooks/useIgdbPopularGames'
import { useIgdbRecentGames } from '../hooks/useIgdbRecentGames'
import { PopularGameCard, PopularGameCardSkeleton } from './PopularGameCard'

interface PopularGamesSectionProps {
  title: string
  layout: 'carousel' | 'grid'
  hook: 'popular' | 'recent'
}

export function PopularGamesSection({ title, layout, hook }: PopularGamesSectionProps) {
  const popular = useIgdbPopularGames()
  const recent = useIgdbRecentGames()

  const { games, loading, error } = hook === 'popular' ? popular : recent

  const listStyle: React.CSSProperties =
    layout === 'carousel'
      ? {
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: 8,
        }
      : {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }

  return (
    <section style={{ marginBottom: 40 }}>
      {/* Shimmer keyframe defined once for all skeleton cards */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--text-h)',
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        {title}
      </h2>

      {error !== null && (
        <p style={{ color: 'var(--text)', fontSize: 14, marginBottom: 8 }}>{error}</p>
      )}

      <div style={listStyle}>
        {loading
          ? Array.from({ length: 8 }, (_, i) => (
              layout === 'carousel' ? (
                <div key={i} style={{ scrollSnapAlign: 'start' }}>
                  <PopularGameCardSkeleton />
                </div>
              ) : (
                <PopularGameCardSkeleton key={i} />
              )
            ))
          : games.map((game) => (
              layout === 'carousel' ? (
                <div key={game.id} style={{ scrollSnapAlign: 'start' }}>
                  <PopularGameCard game={game} />
                </div>
              ) : (
                <PopularGameCard key={game.id} game={game} />
              )
            ))}
      </div>
    </section>
  )
}
```

**Note:** Both hooks are always called (React rules of hooks — no conditional hook calls). The `hook` prop selects which result to use.

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit 2>&1 | grep PopularGamesSection`

Expected: No errors.

- [ ] **Step 3: Run tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Expected: All tests pass.

---

### Task 10: Update `HomePage` with two sections

**Files:**
- Modify: `src/features/home/ui/HomePage.tsx`

- [ ] **Step 1: Mount two `PopularGamesSection` instances**

Replace the entire file with:

```tsx
// src/features/home/ui/HomePage.tsx
import { PopularGamesSection } from '../../popular/ui/PopularGamesSection'

export function HomePage() {
  return (
    <>
      <PopularGamesSection title="MEJOR VALORADOS" layout="carousel" hook="popular" />
      <PopularGamesSection title="LANZAMIENTOS RECIENTES" layout="grid" hook="recent" />
    </>
  )
}
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`

Expected: 0 errors.

- [ ] **Step 3: Run all tests**

Run: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Expected: All tests pass.

- [ ] **Step 4: Commit everything remaining**

```bash
git add src/features/popular/hooks/useIgdbRecentGames.ts src/features/popular/ui/PopularGamesSection.tsx src/features/home/ui/HomePage.tsx
git commit -m "feat: add recent games section to HomePage with grid layout"
```

---

## Final Verification

- [ ] Run `npx tsc --noEmit` — expect 0 errors
- [ ] Run `npx vitest run --exclude ".worktrees/**"` — expect all tests pass (≥23)
- [ ] Manually verify in browser: `npm run dev` → home page shows two sections, collection chips show manufacturer groups, game form shows grouped platform select, adding from game detail pre-fills igdbId hidden field
