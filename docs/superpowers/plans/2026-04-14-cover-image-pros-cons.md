# Cover Image + Pros/Cons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-game cover images (IGDB auto-fill or user upload/URL) and a "Mi opinión" pros/cons card visible on a new dedicated collection detail page at `/coleccion/:id`.

**Architecture:** Four new optional fields (`coverUrl`, `coverBase64`, `pros`, `cons`) are added to the `Game` type and stored in localStorage unchanged. The form gains a cover tab selector and two opinion textareas. A new `CollectionDetailPage` component handles the `/coleccion/:id` route and renders the cover, the pros/cons card, and notes. The collection card grid is updated to navigate to that detail page for all games.

**Tech Stack:** React 19, TypeScript strict, Vite, Ant Design 6, React Router v6, Vitest (unit), localStorage persistence.

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/shared/types/game.ts` |
| Modify | `src/shared/lib/storage/gamesStorage.ts` |
| Modify | `src/shared/lib/storage/gamesStorage.test.ts` |
| Modify | `src/features/games/ui/GameFormModal.tsx` |
| Modify | `src/features/games/ui/GameFormFields.tsx` |
| Modify | `src/features/collection/ui/CollectionPage.tsx` |
| Modify | `src/App.tsx` |
| Create | `src/features/collection/ui/CollectionDetailPage.tsx` |

---

## Task 1: Extend the `Game` type

**Files:**
- Modify: `src/shared/types/game.ts`

- [ ] **Step 1: Add four optional fields to `Game` and extend `GameFormPrefill`**

In `src/shared/types/game.ts`, update the `Game` interface and `GameFormPrefill` interface:

```ts
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
  coverUrl?: string      // URL string (IGDB CDN or user-pasted)
  coverBase64?: string   // base64 data-URI (user file upload)
  pros?: string          // newline-separated positive points
  cons?: string          // newline-separated negative points
  createdAt: string
  updatedAt: string
}

// Prefill shape — mirrors GameFormValues from GameFormModal
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
  igdbId?: number
  coverUrl?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/types/game.ts
git commit -m "feat: extend Game type with coverUrl, coverBase64, pros, cons"
```

---

## Task 2: Update storage validation

**Files:**
- Modify: `src/shared/lib/storage/gamesStorage.ts`
- Modify: `src/shared/lib/storage/gamesStorage.test.ts`

- [ ] **Step 1: Write failing tests for new optional fields**

Append three new test cases at the end of the `describe` block in `src/shared/lib/storage/gamesStorage.test.ts`:

```ts
  it('loads game with all four new optional fields', () => {
    const state = {
      games: [
        {
          id: 'g-new',
          title: 'Super Mario World',
          platform: 'snes',
          status: 'completed',
          genre: 'Platform',
          year: 1990,
          coverUrl: 'https://example.com/cover.jpg',
          coverBase64: 'data:image/png;base64,abc',
          pros: 'Great controls\nBeautiful levels',
          cons: 'Too easy',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: '',
      platformFilter: 'all',
      statusFilter: 'all',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    expect(loadGamesState()).toEqual(state)
  })

  it('loads game without new optional fields (they remain undefined)', () => {
    const stored = {
      games: [
        {
          id: 'g-old',
          title: 'Tetris',
          platform: 'gameboy',
          status: 'completed',
          genre: 'Puzzle',
          year: 1989,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
      search: '',
      platformFilter: 'all',
      statusFilter: 'all',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const result = loadGamesState()
    expect(result.games[0].coverUrl).toBeUndefined()
    expect(result.games[0].coverBase64).toBeUndefined()
    expect(result.games[0].pros).toBeUndefined()
    expect(result.games[0].cons).toBeUndefined()
  })

  it('falls back to default state when pros field is not a string', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        games: [
          {
            id: 'g-bad',
            title: 'Bad Game',
            platform: 'pc',
            status: 'backlog',
            genre: 'Action',
            year: 2020,
            pros: 42,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        ],
        search: '',
        platformFilter: 'all',
        statusFilter: 'all',
      }),
    )
    expect(loadGamesState()).toEqual(defaultGamesState)
  })
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npx vitest run src/shared/lib/storage/gamesStorage.test.ts
```

Expected: the three new tests FAIL (the existing 11 tests still pass).

- [ ] **Step 3: Update `isValidGame` to validate new optional string fields**

In `src/shared/lib/storage/gamesStorage.ts`, add four optional-field checks inside `isValidGame`, after the existing `notes` check (around line 73):

```ts
  if (value.coverUrl !== undefined && typeof value.coverUrl !== 'string') {
    return false
  }

  if (value.coverBase64 !== undefined && typeof value.coverBase64 !== 'string') {
    return false
  }

  if (value.pros !== undefined && typeof value.pros !== 'string') {
    return false
  }

  if (value.cons !== undefined && typeof value.cons !== 'string') {
    return false
  }
```

Also add the same four checks inside `migrateStoredGame` (after the existing `notes` check around line 116):

```ts
  if (value.coverUrl !== undefined && typeof value.coverUrl !== 'string') {
    return null
  }

  if (value.coverBase64 !== undefined && typeof value.coverBase64 !== 'string') {
    return null
  }

  if (value.pros !== undefined && typeof value.pros !== 'string') {
    return null
  }

  if (value.cons !== undefined && typeof value.cons !== 'string') {
    return null
  }
```

- [ ] **Step 4: Run all tests and verify they pass**

```bash
npx vitest run
```

Expected: 27 tests pass (24 existing + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/storage/gamesStorage.ts src/shared/lib/storage/gamesStorage.test.ts
git commit -m "feat: validate new optional Game fields in storage layer"
```

---

## Task 3: Extend the form — values, initialization, and submission

**Files:**
- Modify: `src/features/games/ui/GameFormModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Add new fields to `GameFormValues` and update `GameFormModal`**

Replace the entire `src/features/games/ui/GameFormModal.tsx` with:

```tsx
// src/features/games/ui/GameFormModal.tsx
import { Form, Grid, InputNumber, Modal } from 'antd'
import { useEffect } from 'react'

import type { Game, GameStatus, Platform } from '../../../shared/types/game'
import { GameFormFields } from './GameFormFields'

interface GameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdbId?: number
  coverUrl?: string
  coverBase64?: string
  pros?: string
  cons?: string
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
  coverUrl: undefined,
  coverBase64: undefined,
  pros: '',
  cons: '',
}

export function GameFormModal({ open, mode, game, prefill, onCancel, onSubmit }: GameFormModalProps) {
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
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
        igdbId: game.igdbId,
        coverUrl: game.coverUrl ?? undefined,
        coverBase64: game.coverBase64 ?? undefined,
        pros: game.pros ?? '',
        cons: game.cons ?? '',
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
      width={isMobile ? '95vw' : 520}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
        <GameFormFields form={form} />

        {/* Hidden field — carries igdbId from prefill (create) or game (edit) so it gets submitted */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
        {/* coverBase64 is managed via form.setFieldValue in GameFormFields — no hidden element needed */}
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
```

- [ ] **Step 2: Update `GlobalGameFormModal` in `App.tsx` to pass new fields**

In `src/App.tsx`, update the `handleSubmit` function inside `GlobalGameFormModal` to include the new fields:

```tsx
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
        igdbId: values.igdbId,
        coverUrl: values.coverUrl,
        coverBase64: values.coverBase64,
        pros: values.pros,
        cons: values.cons,
        createdAt: now,
        updatedAt: now,
      },
    })
    void message.success('Juego creado correctamente')
    closeModal()
  }
```

- [ ] **Step 3: Update `handleEditSubmit` in `CollectionPage.tsx` to pass new fields**

In `src/features/collection/ui/CollectionPage.tsx`, update `handleEditSubmit`:

```tsx
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
          coverUrl: values.coverUrl,
          coverBase64: values.coverBase64,
          pros: values.pros,
          cons: values.cons,
          updatedAt: new Date().toISOString(),
        },
      },
    })
    void message.success('Juego actualizado correctamente')
    setIsEditModalOpen(false)
    setEditingGame(undefined)
  }
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: 27 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/games/ui/GameFormModal.tsx src/App.tsx src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: extend form values and submission handlers for new fields"
```

---

## Task 4: Add cover image and pros/cons fields to the form UI

**Files:**
- Modify: `src/features/games/ui/GameFormFields.tsx`

- [ ] **Step 1: Replace `GameFormFields.tsx` with the extended version**

Replace the entire file `src/features/games/ui/GameFormFields.tsx`:

```tsx
// src/features/games/ui/GameFormFields.tsx
import { InboxOutlined } from '@ant-design/icons'
import { Form, Input, InputNumber, Select, Tabs, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import type { FormInstance } from 'antd'
import type { GameFormValues } from './GameFormModal'
import type { GameStatus } from '../../../shared/types/game'

const statusOptions: Array<{ label: string; value: GameStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

interface GameFormFieldsProps {
  form: FormInstance<GameFormValues>
}

export function GameFormFields({ form }: GameFormFieldsProps) {
  const [coverTab, setCoverTab] = useState<'file' | 'url'>('file')
  const [previewBase64, setPreviewBase64] = useState<string | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Read current URL value from form for preview
  const coverUrlValue: string | undefined = Form.useWatch('coverUrl', form)

  function handleFileChange({ fileList: newList }: { fileList: UploadFile[] }) {
    setFileList(newList)
    const file = newList[0]?.originFileObj
    if (file == null) {
      setPreviewBase64(undefined)
      form.setFieldValue('coverBase64', undefined)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string | undefined
      setPreviewBase64(result)
      form.setFieldValue('coverBase64', result)
      form.setFieldValue('coverUrl', undefined)
    }
    reader.readAsDataURL(file)
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Clear base64 when user types a URL
    setPreviewBase64(undefined)
    setFileList([])
    form.setFieldValue('coverBase64', undefined)
  }

  const coverItems = [
    {
      key: 'file',
      label: 'Subir archivo',
      children: (
        <div>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleFileChange}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Hacé clic o arrastrá una imagen</p>
          </Upload.Dragger>
          {previewBase64 != null && (
            <img
              src={previewBase64}
              alt="Vista previa"
              style={{ marginTop: 8, maxHeight: 120, borderRadius: 4, display: 'block' }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'url',
      label: 'Pegar URL',
      children: (
        <div>
          <Form.Item name="coverUrl" noStyle>
            <Input
              placeholder="https://..."
              onChange={handleUrlChange}
              aria-label="URL de portada"
            />
          </Form.Item>
          {typeof coverUrlValue === 'string' && coverUrlValue.startsWith('http') && (
            <img
              src={coverUrlValue}
              alt="Vista previa"
              style={{ marginTop: 8, maxHeight: 120, borderRadius: 4, display: 'block' }}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <>
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

      {/* Cover image section */}
      <Form.Item label="Portada">
        <Tabs
          activeKey={coverTab}
          onChange={(key) => setCoverTab(key as 'file' | 'url')}
          items={coverItems}
          size="small"
        />
      </Form.Item>

      {/* Pros / Cons */}
      <Form.Item label="Puntos positivos" name="pros">
        <Input.TextArea
          rows={3}
          placeholder="Un punto por línea"
          aria-label="Puntos positivos"
        />
      </Form.Item>

      <Form.Item label="Puntos negativos" name="cons">
        <Input.TextArea
          rows={3}
          placeholder="Un punto por línea"
          aria-label="Puntos negativos"
        />
      </Form.Item>
    </>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: 27 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/games/ui/GameFormFields.tsx
git commit -m "feat: add cover image tab selector and pros/cons textareas to game form"
```

---

## Task 5: Update collection card to prefer stored cover and navigate to detail page

**Files:**
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Update `CollectionCard` and the cover resolution logic**

In `src/features/collection/ui/CollectionPage.tsx`:

1. Update the `CollectionCardProps` interface to remove `igdbId` (no longer needed) and the `coverUrl` prop will now be resolved inside the component using the stored fields:

```tsx
interface CollectionCardProps {
  game: Game
  igdbCoverUrl: string | undefined   // live IGDB fallback from useCollectionCovers
  onEdit: (game: Game) => void
  onComplete: (id: string) => void
}
```

2. Inside `CollectionCard`, resolve the cover to display:

```tsx
function CollectionCard({ game, igdbCoverUrl, onEdit, onComplete }: CollectionCardProps) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const status = STATUS_COLORS[game.status]

  // Prefer stored cover over live IGDB fetch
  const displayCover = game.coverBase64 ?? game.coverUrl ?? igdbCoverUrl
```

3. Replace the hover overlay buttons:

```tsx
            <Button size="small" block onClick={() => onEdit(game)}>
              Editar
            </Button>
            <Button size="small" block onClick={() => navigate(`/coleccion/${game.id}`)}>
              Ver detalle
            </Button>
            {game.status !== 'completed' && (
              <Button size="small" block type="primary" onClick={() => onComplete(game.id)}>
                Completar
              </Button>
            )}
```

4. Replace `coverUrl` with `displayCover` in the img/fallback rendering:

```tsx
        {displayCover ? (
          <img
            src={displayCover}
            alt={game.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
```

5. Update the render site in `CollectionPage` (the `.map()` call) to pass `igdbCoverUrl` and drop `igdbId`:

```tsx
        {filteredGames.map((game) => {
          const coverEntry = covers.get(game.id)
          return (
            <CollectionCard
              key={game.id}
              game={game}
              igdbCoverUrl={coverEntry?.coverUrl}
              onEdit={handleEdit}
              onComplete={handleComplete}
            />
          )
        })}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: 27 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: update collection card to prefer stored cover and navigate to detail page"
```

---

## Task 6: Create `CollectionDetailPage` and add route

**Files:**
- Create: `src/features/collection/ui/CollectionDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `CollectionDetailPage.tsx`**

Create the file `src/features/collection/ui/CollectionDetailPage.tsx`:

```tsx
// src/features/collection/ui/CollectionDetailPage.tsx
import { ArrowLeftOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Card, Divider, Grid, Modal, Tag, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeOptionalRating } from '../../games/ui/GamesPage'
import { GameFormModal, type GameFormValues } from '../../games/ui/GameFormModal'
import { useGamesContext } from '../../games/state/GamesContext'
import { PLATFORM_LABELS } from '../../../shared/types/game'
import type { Game, GameStatus } from '../../../shared/types/game'

const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

const STATUS_COLORS: Record<GameStatus, string> = {
  backlog: 'default',
  playing: 'orange',
  completed: 'green',
  paused: 'blue',
  dropped: 'red',
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function parseLines(text: string | undefined): string[] {
  if (!text) return []
  return text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
}

function OpinionCard({ game }: { game: Game }) {
  const pros = parseLines(game.pros)
  const cons = parseLines(game.cons)

  if (pros.length === 0 && cons.length === 0) return null

  return (
    <Card title="Mi opinión" style={{ flex: 1, minWidth: 200 }}>
      {pros.length > 0 && (
        <div>
          <Typography.Text strong style={{ color: '#27ae60' }}>
            ✓ Puntos positivos
          </Typography.Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            {pros.map((p, i) => (
              <li key={i} style={{ color: 'var(--text-body)', marginBottom: 4 }}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pros.length > 0 && cons.length > 0 && <Divider style={{ margin: '16px 0' }} />}

      {cons.length > 0 && (
        <div>
          <Typography.Text strong style={{ color: '#c0392b' }}>
            ✗ Puntos negativos
          </Typography.Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            {cons.map((c, i) => (
              <li key={i} style={{ color: 'var(--text-body)', marginBottom: 4 }}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, dispatch } = useGamesContext()
  const navigate = useNavigate()
  const { modal, message } = AntdApp.useApp()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

  const [isEditOpen, setIsEditOpen] = useState(false)

  const game = state.games.find((g) => g.id === id)

  if (game === undefined) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Typography.Text>Juego no encontrado.</Typography.Text>
        <br />
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/coleccion')}
          style={{ marginTop: 16 }}
        >
          Volver a mi colección
        </Button>
      </div>
    )
  }

  const displayCover = game.coverBase64 ?? game.coverUrl

  function handleDelete() {
    modal.confirm({
      title: '¿Eliminar juego?',
      content: `"${game.title}" será eliminado de tu colección.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        dispatch({ type: 'removeGame', payload: { id: game.id } })
        void message.success('Juego eliminado')
        navigate('/coleccion')
      },
    })
  }

  function handleEditSubmit(values: GameFormValues) {
    const rating = normalizeOptionalRating(values.rating)
    dispatch({
      type: 'editGame',
      payload: {
        id: game.id,
        updates: {
          title: values.title,
          platform: values.platform,
          status: values.status,
          genre: values.genre,
          year: values.year,
          rating,
          notes: values.notes,
          coverUrl: values.coverUrl,
          coverBase64: values.coverBase64,
          pros: values.pros,
          cons: values.cons,
          updatedAt: new Date().toISOString(),
        },
      },
    })
    void message.success('Juego actualizado correctamente')
    setIsEditOpen(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '16px 0' : '16px 24px' }}>
      {/* Back link */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/coleccion')}
        style={{ paddingLeft: 0, marginBottom: 24, color: 'var(--text-muted)' }}
      >
        Volver a mi colección
      </Button>

      {/* Header: cover + title/meta */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          marginBottom: 32,
          alignItems: isMobile ? 'flex-start' : 'flex-start',
        }}
      >
        {/* Cover */}
        <div
          style={{
            width: isMobile ? '100%' : 200,
            flexShrink: 0,
          }}
        >
          {displayCover ? (
            <img
              src={displayCover}
              alt={game.title}
              style={{
                width: isMobile ? '100%' : 200,
                maxHeight: isMobile ? 260 : 280,
                objectFit: 'cover',
                borderRadius: 8,
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? '100%' : 200,
                height: 260,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-muted)',
                letterSpacing: 2,
                border: '1px solid var(--border)',
              }}
            >
              {getInitials(game.title)}
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ flex: 1 }}>
          <Typography.Title
            level={2}
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-h)',
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            {game.title}
          </Typography.Title>

          <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15, display: 'block', marginBottom: 12 }}>
            {PLATFORM_LABELS[game.platform]} · {game.year} · {game.genre}
          </Typography.Text>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag color={STATUS_COLORS[game.status]}>{STATUS_LABELS[game.status]}</Tag>
            {game.rating !== undefined && (
              <Tag color="gold">★ {game.rating}</Tag>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setIsEditOpen(true)}>Editar</Button>
            <Button danger onClick={handleDelete}>Eliminar</Button>
          </div>
        </div>
      </div>

      {/* Opinion + Notes cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <OpinionCard game={game} />

        {game.notes && game.notes.trim().length > 0 && (
          <Card title="Notas" style={{ flex: 1, minWidth: 200 }}>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {game.notes}
            </Typography.Paragraph>
          </Card>
        )}
      </div>

      {/* Edit modal */}
      <GameFormModal
        open={isEditOpen}
        mode="edit"
        game={game}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
```

- [ ] **Step 2: Add `removeGame` action to the reducer**

The detail page dispatches `removeGame`. Add it to `src/features/games/state/gamesReducer.ts`:

At the top of the file, extend `GamesAction`:

```ts
export type GamesAction =
  | { type: 'addGame'; payload: Game }
  | {
      type: 'editGame'
      payload: {
        id: string
        updates: Partial<Omit<Game, 'id' | 'createdAt'>>
      }
    }
  | { type: 'removeGame'; payload: { id: string } }
  | { type: 'markGameCompleted'; payload: { id: string } }
  | { type: 'setSearch'; payload: string }
  | { type: 'setPlatformFilter'; payload: Platform | 'all' }
  | { type: 'setStatusFilter'; payload: GameStatus | 'all' }
  | { type: 'openCreateModal'; payload: Partial<GameFormPrefill> | undefined }
  | { type: 'closeCreateModal' }
```

Add the case handler inside `gamesReducer`, after the `editGame` case:

```ts
    case 'removeGame':
      return {
        ...state,
        games: state.games.filter((game) => game.id !== action.payload.id),
      }
```

- [ ] **Step 3: Register the new route in `App.tsx`**

In `src/App.tsx`, add the import and route:

```tsx
import { CollectionDetailPage } from './features/collection/ui/CollectionDetailPage'
```

Inside `AppRoutes`:

```tsx
        <Route path="/coleccion" element={<CollectionPage />} />
        <Route path="/coleccion/:id" element={<CollectionDetailPage />} />
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: 27 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/collection/ui/CollectionDetailPage.tsx src/features/games/state/gamesReducer.ts src/App.tsx
git commit -m "feat: add CollectionDetailPage with cover, pros/cons card, and removeGame action"
```

---

## Task 7: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:5173` in a browser.

- [ ] **Step 2: Smoke-test cover image via file upload**
  1. Log in and navigate to Mi Colección
  2. Click "Agregar juego" → fill required fields → go to the Portada section → click "Subir archivo" tab → upload any image
  3. Verify the preview appears below the upload area
  4. Save the game — the card in the grid should show the uploaded image
  5. Click "Ver detalle" (hover the card) — the detail page shows the cover

- [ ] **Step 3: Smoke-test cover image via URL**
  1. Add another game → Portada → "Pegar URL" tab → paste `https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8e.webp`
  2. Verify the preview appears
  3. Save — card and detail page show the cover

- [ ] **Step 4: Smoke-test pros/cons**
  1. Edit any game → fill "Puntos positivos" with `Buen gameplay\nGráficos hermosos` and "Puntos negativos" with `Historia corta`
  2. Save — navigate to the detail page via "Ver detalle"
  3. Verify the "Mi opinión" card appears with green pros and red cons

- [ ] **Step 5: Smoke-test empty opinion card (no pros/cons)**
  1. Open the detail page for a game without pros/cons set
  2. Verify no "Mi opinión" card appears

- [ ] **Step 6: Smoke-test delete**
  1. On the detail page, click "Eliminar"
  2. Confirm in the modal — should redirect to `/coleccion` with game removed

- [ ] **Step 7: Run final test suite**

```bash
npx vitest run
```

Expected: 27 tests pass.

- [ ] **Step 8: Commit if any fixes were made**

```bash
git add -A && git commit -m "fix: address smoke test findings"
```

(Skip if no fixes were needed.)
