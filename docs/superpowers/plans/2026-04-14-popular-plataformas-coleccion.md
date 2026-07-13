# Popular Ahora + Plataformas Expandidas + Fix Colección — Plan de Implementación

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDA: Usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para el seguimiento.

**Goal:** Agregar dos secciones a la página principal (carrusel de mejor valorados + grilla de recientes), expandir el tipo Platform a ~30 consolas agrupadas por fabricante, y corregir la detección de "Ya en tu colección" comparando ids de IGDB.

**Architecture:** Los tipos van primero (shared/types/game.ts), luego la validación de almacenamiento, luego la migración de tests, y luego la UI de abajo hacia arriba (hooks → componentes → páginas). Cada tarea es autocontenida y se verifica antes de pasar a la siguiente.

**Tech Stack:** React 19, TypeScript strict, Vite 8, Ant Design 6, Vitest, React Router v7

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/shared/types/game.ts` | Modificar | Expandir `Platform`, agregar `PLATFORM_LABELS`, agregar `igdbId?` a `Game` y `GameFormPrefill` |
| `src/shared/lib/storage/gamesStorage.ts` | Modificar | Reemplazar `VALID_PLATFORMS` con los 30 valores nuevos |
| `src/features/games/state/gamesReducer.test.ts` | Modificar | Migrar `'xbox'` → `'xbone'` (el único valor que rompe) |
| `src/features/games/ui/GameFormModal.tsx` | Modificar | Reemplazar el `options` plano por grupos `Select.OptGroup`; agregar campo oculto `igdbId` |
| `src/features/games/ui/GameDetailPage.tsx` | Modificar | Expandir `IGDB_PLATFORM_MAP`, despachar con `igdbId`, comparar por `igdbId` primero |
| `src/App.tsx` | Modificar | `GlobalGameFormModal.handleSubmit` incluye `igdbId: values.igdbId` |
| `src/features/collection/ui/CollectionPage.tsx` | Modificar | Reemplazar `PLATFORM_OPTIONS` con chips de `PlatformGroup`; mostrar `PLATFORM_LABELS[game.platform]` |
| `src/features/popular/hooks/useIgdbRecentGames.ts` | Crear | Hook que trae juegos recientes desde IGDB (últimos 2 años, ordenados por fecha de lanzamiento descendente) |
| `src/features/popular/ui/PopularGamesSection.tsx` | Modificar | Aceptar props `title: string` y `layout: 'carousel' \| 'grid'` |
| `src/features/home/ui/HomePage.tsx` | Modificar | Montar dos instancias de `PopularGamesSection` |

---

### Tarea 1: Expandir el tipo `Platform` y agregar `PLATFORM_LABELS`

**Files:**
- Modify: `src/shared/types/game.ts`

- [ ] **Step 1: Reemplazar el tipo `Platform` y agregar `PLATFORM_LABELS`**

Reemplazar todo el contenido del archivo:

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

// Forma de prefill — refleja GameFormValues de GameFormModal (title, year, platform)
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

- [ ] **Step 2: Verificar que TypeScript compile (solo este archivo, rápido)**

Ejecutar: `npx tsc --noEmit 2>&1 | head -30`

Esperado: Errores mencionando `gamesStorage.ts` (VALID_PLATFORMS todavía tiene los valores viejos) y archivos de test. Eso es esperado — los arreglamos en las tareas siguientes. Sin errores en `game.ts` propiamente.

---

### Tarea 2: Actualizar `VALID_PLATFORMS` en `gamesStorage.ts`

**Files:**
- Modify: `src/shared/lib/storage/gamesStorage.ts`

- [ ] **Step 1: Reemplazar el array `VALID_PLATFORMS`**

Cambiar las líneas 11–18 de:

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

A:

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

- [ ] **Step 2: Ejecutar tsc para verificar que storage compile correctamente**

Ejecutar: `npx tsc --noEmit 2>&1 | grep gamesStorage`

Esperado: Sin errores para `gamesStorage.ts`.

---

### Tarea 3: Migrar archivos de test con valores de Platform antiguos

**Files:**
- Modify: `src/features/games/state/gamesReducer.test.ts`

El único valor que rompe en los tests es `'xbox'` en `gamesReducer.test.ts` — el viejo `'xbox'` era un genérico "catch-all" de Xbox que ya no existe. Mapearlo a `'xbone'` (Xbox One), que es el equivalente más cercano en el tipo nuevo.

`'switch'` y `'pc'` en otros archivos de test siguen siendo valores válidos de Platform — no se necesitan cambios ahí.

- [ ] **Step 1: Migrar `'xbox'` → `'xbone'` en gamesReducer.test.ts**

En `src/features/games/state/gamesReducer.test.ts`:

Cambiar la línea 9:
```ts
  platform: 'xbox',
```
A:
```ts
  platform: 'xbone',
```

Cambiar la línea 76:
```ts
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbox' })
```
A:
```ts
    nextState = gamesReducer(nextState, { type: 'setPlatformFilter', payload: 'xbone' })
```

Cambiar la línea 80:
```ts
    expect(nextState.platformFilter).toBe('xbox')
```
A:
```ts
    expect(nextState.platformFilter).toBe('xbone')
```

- [ ] **Step 2: Ejecutar los tests para confirmar que los 23 pasen**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Esperado: `23 passed` (o el conteo equivalente — todos pasando, 0 fallidos).

- [ ] **Step 3: Commitear tipos + storage + migración de tests**

```bash
git add src/shared/types/game.ts src/shared/lib/storage/gamesStorage.ts src/features/games/state/gamesReducer.test.ts
git commit -m "feat: expand Platform type to 30 consoles and add PLATFORM_LABELS"
```

---

### Tarea 4: Actualizar `GameFormModal` con select agrupado e `igdbId` oculto

**Files:**
- Modify: `src/features/games/ui/GameFormModal.tsx`

- [ ] **Step 1: Reemplazar el select de plataforma con `Select.OptGroup` y agregar campo oculto `igdbId`**

Reemplazar todo el archivo con:

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

        {/* Campo oculto — lleva igdbId desde el prefill para que se envíe */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
```

- [ ] **Step 2: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Esperado: Todos los tests pasan (los tests existentes de `GameFormModal` usan `'pc'` y `'switch'`, ambos siguen siendo válidos).

- [ ] **Step 3: Commitear**

```bash
git add src/features/games/ui/GameFormModal.tsx
git commit -m "feat: update GameFormModal with grouped platform select and hidden igdbId field"
```

---

### Tarea 5: Actualizar `GameDetailPage` — mapa de IGDB, despacho de igdbId, comparación de colección

**Files:**
- Modify: `src/features/games/ui/GameDetailPage.tsx`

- [ ] **Step 1: Reemplazar `IGDB_PLATFORM_MAP`, actualizar el chequeo de `alreadyInCollection`, y actualizar el despacho de `handleAddToCollection`**

Cambiar las líneas 10–17 (IGDB_PLATFORM_MAP):

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
  // Mobile (legado)
  iOS: 'other', Android: 'other',
}
```

Cambiar las líneas 93–95 (`alreadyInCollection`):

```ts
  const alreadyInCollection = gamesState.games.some(
    (g) => (g.igdbId !== undefined && g.igdbId === game.id)
      || g.title.toLowerCase() === game.name.toLowerCase()
  )
```

Cambiar las líneas 108–114 (`prefill` y `dispatch`):

```ts
    const prefill: Partial<GameFormPrefill> = {
      title: game.name,
      ...(year !== null ? { year } : {}),
      platform,
      igdbId: game.id,
    }

    dispatch({ type: 'openCreateModal', payload: prefill })
```

- [ ] **Step 2: Ejecutar tsc**

Ejecutar: `npx tsc --noEmit 2>&1 | grep GameDetailPage`

Esperado: Sin errores.

- [ ] **Step 3: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -20`

Esperado: Todos los tests pasan.

- [ ] **Step 4: Commitear**

```bash
git add src/features/games/ui/GameDetailPage.tsx
git commit -m "feat: update GameDetailPage with expanded IGDB map and igdbId-based collection check"
```

---

### Tarea 6: Actualizar `App.tsx` — pasar `igdbId` al agregar juego

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Incluir `igdbId` en el payload del despacho `addGame`**

En `GlobalGameFormModal.handleSubmit`, cambiar la llamada a `dispatch` (líneas 29–43) de:

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

A:

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

- [ ] **Step 2: Ejecutar tsc**

Ejecutar: `npx tsc --noEmit 2>&1 | grep "App.tsx"`

Esperado: Sin errores.

- [ ] **Step 3: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Esperado: Todos los tests pasan.

- [ ] **Step 4: Commitear**

```bash
git add src/App.tsx
git commit -m "feat: pass igdbId through GlobalGameFormModal when creating game from IGDB detail"
```

---

### Tarea 7: Actualizar `CollectionPage` — chips de grupo de fabricante y `PLATFORM_LABELS`

**Files:**
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Reemplazar el estado del filtro de plataforma y los chips con grupos de fabricante**

Hacer los siguientes cambios en `CollectionPage.tsx`:

1. Agregar `PLATFORM_LABELS` al import de `game.ts`:

```ts
import type { Game, GameStatus, Platform } from '../../../shared/types/game'
import { PLATFORM_LABELS } from '../../../shared/types/game'
```

2. Reemplazar `PLATFORM_OPTIONS` (líneas 31–39) con:

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

3. Cambiar el tipo del estado `platformFilter` de `Platform | 'all'` a `PlatformGroup`:

```ts
  const [platformFilter, setPlatformFilter] = useState<PlatformGroup>('all')
```

4. Actualizar la lógica de `matchPlatform` en `filteredGames`:

```ts
      const platformValues = PLATFORM_GROUPS[platformFilter]
      const matchPlatform =
        platformFilter === 'all' ||
        platformValues === 'all' ||
        (Array.isArray(platformValues) && platformValues.includes(g.platform))
```

5. Reemplazar el render de los chips de plataforma (el bloque `PLATFORM_OPTIONS.map`) con:

```tsx
      {/* Chips de plataforma */}
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

6. En `CollectionCard`, cambiar la línea de visualización de la plataforma (línea 207):

```tsx
          {PLATFORM_LABELS[game.platform]} · {game.year}
```

- [ ] **Step 2: Ejecutar tsc**

Ejecutar: `npx tsc --noEmit 2>&1 | grep CollectionPage`

Esperado: Sin errores.

- [ ] **Step 3: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Esperado: Todos los tests pasan.

- [ ] **Step 4: Commitear**

```bash
git add src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: update CollectionPage with manufacturer group chips and PLATFORM_LABELS display"
```

---

### Tarea 8: Crear el hook `useIgdbRecentGames`

**Files:**
- Create: `src/features/popular/hooks/useIgdbRecentGames.ts`

- [ ] **Step 1: Crear el hook**

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

- [ ] **Step 2: Ejecutar tsc para verificar que el archivo nuevo compile**

Ejecutar: `npx tsc --noEmit 2>&1 | grep useIgdbRecentGames`

Esperado: Sin salida (sin errores).

- [ ] **Step 3: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Esperado: Todos los tests pasan.

---

### Tarea 9: Actualizar `PopularGamesSection` con props `layout` y `title`

**Files:**
- Modify: `src/features/popular/ui/PopularGamesSection.tsx`

- [ ] **Step 1: Reemplazar el componente con la versión consciente del layout**

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
      {/* Keyframe de shimmer definido una sola vez para todas las tarjetas skeleton */}
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

**Nota:** Ambos hooks se llaman siempre (reglas de hooks de React — no se pueden llamar hooks de forma condicional). La prop `hook` selecciona qué resultado usar.

- [ ] **Step 2: Ejecutar tsc**

Ejecutar: `npx tsc --noEmit 2>&1 | grep PopularGamesSection`

Esperado: Sin errores.

- [ ] **Step 3: Ejecutar tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Esperado: Todos los tests pasan.

---

### Tarea 10: Actualizar `HomePage` con dos secciones

**Files:**
- Modify: `src/features/home/ui/HomePage.tsx`

- [ ] **Step 1: Montar dos instancias de `PopularGamesSection`**

Reemplazar todo el archivo con:

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

- [ ] **Step 2: Ejecutar tsc**

Ejecutar: `npx tsc --noEmit`

Esperado: 0 errores.

- [ ] **Step 3: Ejecutar todos los tests**

Ejecutar: `npx vitest run --exclude ".worktrees/**" 2>&1 | tail -10`

Esperado: Todos los tests pasan.

- [ ] **Step 4: Commitear todo lo restante**

```bash
git add src/features/popular/hooks/useIgdbRecentGames.ts src/features/popular/ui/PopularGamesSection.tsx src/features/home/ui/HomePage.tsx
git commit -m "feat: add recent games section to HomePage with grid layout"
```

---

## Verificación final

- [ ] Ejecutar `npx tsc --noEmit` — esperar 0 errores
- [ ] Ejecutar `npx vitest run --exclude ".worktrees/**"` — esperar que todos los tests pasen (≥23)
- [ ] Verificar manualmente en el navegador: `npm run dev` → la página principal muestra dos secciones, los chips de colección muestran grupos de fabricante, el formulario de juego muestra el select agrupado de plataforma, agregar desde el detalle del juego pre-llena el campo oculto igdbId
