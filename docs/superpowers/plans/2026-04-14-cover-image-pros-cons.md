# Plan de implementación: Imagen de portada + Pros/Contras

> **Para trabajadores agénticos:** SUB-HABILIDAD REQUERIDA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para el seguimiento.

**Goal:** Agregar imágenes de portada por juego (autocompletado desde IGDB o subida/URL del usuario) y una tarjeta de "Mi opinión" con pros/contras visible en una nueva página dedicada de detalle de colección en `/coleccion/:id`.

**Architecture:** Se agregan cuatro campos opcionales nuevos (`coverUrl`, `coverBase64`, `pros`, `cons`) al tipo `Game`, y se guardan en localStorage sin cambios. El formulario incorpora un selector de pestañas para la portada y dos áreas de texto de opinión. Un nuevo componente `CollectionDetailPage` maneja la ruta `/coleccion/:id` y renderiza la portada, la tarjeta de pros/contras y las notas. La grilla de tarjetas de la colección se actualiza para navegar a esa página de detalle para todos los juegos.

**Tech Stack:** React 19, TypeScript strict, Vite, Ant Design 6, React Router v6, Vitest (unitario), persistencia en localStorage.

---

## Mapa de archivos

| Acción | Archivo |
|--------|------|
| Modificar | `src/shared/types/game.ts` |
| Modificar | `src/shared/lib/storage/gamesStorage.ts` |
| Modificar | `src/shared/lib/storage/gamesStorage.test.ts` |
| Modificar | `src/features/games/ui/GameFormModal.tsx` |
| Modificar | `src/features/games/ui/GameFormFields.tsx` |
| Modificar | `src/features/collection/ui/CollectionPage.tsx` |
| Modificar | `src/App.tsx` |
| Crear | `src/features/collection/ui/CollectionDetailPage.tsx` |

---

## Task 1: Extender el tipo `Game`

**Files:**
- Modify: `src/shared/types/game.ts`

- [ ] **Step 1: Agregar cuatro campos opcionales a `Game` y extender `GameFormPrefill`**

En `src/shared/types/game.ts`, actualiza la interfaz `Game` y la interfaz `GameFormPrefill`:

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

## Task 2: Actualizar la validación de almacenamiento

**Files:**
- Modify: `src/shared/lib/storage/gamesStorage.ts`
- Modify: `src/shared/lib/storage/gamesStorage.test.ts`

- [ ] **Step 1: Escribir tests que fallen para los nuevos campos opcionales**

Agrega tres nuevos casos de test al final del bloque `describe` en `src/shared/lib/storage/gamesStorage.test.ts`:

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

- [ ] **Step 2: Ejecutar los tests y verificar que fallen**

```bash
npx vitest run src/shared/lib/storage/gamesStorage.test.ts
```

Esperado: los tres tests nuevos FALLAN (los 11 tests existentes siguen pasando).

- [ ] **Step 3: Actualizar `isValidGame` para validar los nuevos campos de texto opcionales**

En `src/shared/lib/storage/gamesStorage.ts`, agrega cuatro verificaciones de campo opcional dentro de `isValidGame`, después de la verificación existente de `notes` (cerca de la línea 73):

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

También agrega las mismas cuatro verificaciones dentro de `migrateStoredGame` (después de la verificación existente de `notes` cerca de la línea 116):

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

- [ ] **Step 4: Ejecutar todos los tests y verificar que pasen**

```bash
npx vitest run
```

Esperado: pasan 27 tests (24 existentes + 3 nuevos).

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/storage/gamesStorage.ts src/shared/lib/storage/gamesStorage.test.ts
git commit -m "feat: validate new optional Game fields in storage layer"
```

---

## Task 3: Extender el formulario — valores, inicialización y envío

**Files:**
- Modify: `src/features/games/ui/GameFormModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Agregar los nuevos campos a `GameFormValues` y actualizar `GameFormModal`**

Reemplaza el archivo completo `src/features/games/ui/GameFormModal.tsx` por:

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

- [ ] **Step 2: Actualizar `GlobalGameFormModal` en `App.tsx` para pasar los nuevos campos**

En `src/App.tsx`, actualiza la función `handleSubmit` dentro de `GlobalGameFormModal` para incluir los nuevos campos:

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

- [ ] **Step 3: Actualizar `handleEditSubmit` en `CollectionPage.tsx` para pasar los nuevos campos**

En `src/features/collection/ui/CollectionPage.tsx`, actualiza `handleEditSubmit`:

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

- [ ] **Step 4: Ejecutar todos los tests**

```bash
npx vitest run
```

Esperado: pasan 27 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/games/ui/GameFormModal.tsx src/App.tsx src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: extend form values and submission handlers for new fields"
```

---

## Task 4: Agregar los campos de imagen de portada y pros/contras a la UI del formulario

**Files:**
- Modify: `src/features/games/ui/GameFormFields.tsx`

- [ ] **Step 1: Reemplazar `GameFormFields.tsx` por la versión extendida**

Reemplaza el archivo completo `src/features/games/ui/GameFormFields.tsx`:

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

- [ ] **Step 2: Ejecutar todos los tests**

```bash
npx vitest run
```

Esperado: pasan 27 tests.

- [ ] **Step 3: Commit**

```bash
git add src/features/games/ui/GameFormFields.tsx
git commit -m "feat: add cover image tab selector and pros/cons textareas to game form"
```

---

## Task 5: Actualizar la tarjeta de colección para preferir la portada guardada y navegar a la página de detalle

**Files:**
- Modify: `src/features/collection/ui/CollectionPage.tsx`

- [ ] **Step 1: Actualizar `CollectionCard` y la lógica de resolución de portada**

En `src/features/collection/ui/CollectionPage.tsx`:

1. Actualiza la interfaz `CollectionCardProps` para quitar `igdbId` (ya no se necesita); la prop `coverUrl` ahora se resolverá dentro del componente usando los campos guardados:

```tsx
interface CollectionCardProps {
  game: Game
  igdbCoverUrl: string | undefined   // live IGDB fallback from useCollectionCovers
  onEdit: (game: Game) => void
  onComplete: (id: string) => void
}
```

2. Dentro de `CollectionCard`, resuelve la portada a mostrar:

```tsx
function CollectionCard({ game, igdbCoverUrl, onEdit, onComplete }: CollectionCardProps) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const status = STATUS_COLORS[game.status]

  // Prefer stored cover over live IGDB fetch
  const displayCover = game.coverBase64 ?? game.coverUrl ?? igdbCoverUrl
```

3. Reemplaza los botones del overlay al pasar el mouse:

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

4. Reemplaza `coverUrl` por `displayCover` en el renderizado de la imagen/fallback:

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

5. Actualiza el sitio de renderizado en `CollectionPage` (la llamada `.map()`) para pasar `igdbCoverUrl` y quitar `igdbId`:

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

- [ ] **Step 2: Ejecutar todos los tests**

```bash
npx vitest run
```

Esperado: pasan 27 tests.

- [ ] **Step 3: Commit**

```bash
git add src/features/collection/ui/CollectionPage.tsx
git commit -m "feat: update collection card to prefer stored cover and navigate to detail page"
```

---

## Task 6: Crear `CollectionDetailPage` y agregar la ruta

**Files:**
- Create: `src/features/collection/ui/CollectionDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear `CollectionDetailPage.tsx`**

Crea el archivo `src/features/collection/ui/CollectionDetailPage.tsx`:

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

- [ ] **Step 2: Agregar la acción `removeGame` al reducer**

La página de detalle despacha `removeGame`. Agrégala a `src/features/games/state/gamesReducer.ts`:

Al principio del archivo, extiende `GamesAction`:

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

Agrega el manejador del case dentro de `gamesReducer`, después del case `editGame`:

```ts
    case 'removeGame':
      return {
        ...state,
        games: state.games.filter((game) => game.id !== action.payload.id),
      }
```

- [ ] **Step 3: Registrar la nueva ruta en `App.tsx`**

En `src/App.tsx`, agrega el import y la ruta:

```tsx
import { CollectionDetailPage } from './features/collection/ui/CollectionDetailPage'
```

Dentro de `AppRoutes`:

```tsx
        <Route path="/coleccion" element={<CollectionPage />} />
        <Route path="/coleccion/:id" element={<CollectionDetailPage />} />
```

- [ ] **Step 4: Ejecutar todos los tests**

```bash
npx vitest run
```

Esperado: pasan 27 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/collection/ui/CollectionDetailPage.tsx src/features/games/state/gamesReducer.ts src/App.tsx
git commit -m "feat: add CollectionDetailPage with cover, pros/cons card, and removeGame action"
```

---

## Task 7: Prueba de humo manual

- [ ] **Step 1: Iniciar el servidor de desarrollo**

```bash
npm run dev
```

Abre `http://localhost:5173` en un navegador.

- [ ] **Step 2: Prueba de humo de la imagen de portada mediante subida de archivo**
  1. Inicia sesión y navega a Mi Colección
  2. Haz clic en "Agregar juego" → completa los campos obligatorios → ve a la sección Portada → haz clic en la pestaña "Subir archivo" → sube cualquier imagen
  3. Verifica que la vista previa aparezca debajo del área de subida
  4. Guarda el juego — la tarjeta en la grilla debería mostrar la imagen subida
  5. Haz clic en "Ver detalle" (al pasar el mouse sobre la tarjeta) — la página de detalle muestra la portada

- [ ] **Step 3: Prueba de humo de la imagen de portada mediante URL**
  1. Agrega otro juego → Portada → pestaña "Pegar URL" → pega `https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8e.webp`
  2. Verifica que la vista previa aparezca
  3. Guarda — la tarjeta y la página de detalle muestran la portada

- [ ] **Step 4: Prueba de humo de pros/contras**
  1. Edita cualquier juego → completa "Puntos positivos" con `Buen gameplay\nGráficos hermosos` y "Puntos negativos" con `Historia corta`
  2. Guarda — navega a la página de detalle mediante "Ver detalle"
  3. Verifica que la tarjeta "Mi opinión" aparezca con los puntos positivos en verde y los negativos en rojo

- [ ] **Step 5: Prueba de humo de la tarjeta de opinión vacía (sin pros/contras)**
  1. Abre la página de detalle de un juego sin pros/contras configurados
  2. Verifica que no aparezca ninguna tarjeta "Mi opinión"

- [ ] **Step 6: Prueba de humo de eliminación**
  1. En la página de detalle, haz clic en "Eliminar"
  2. Confirma en el modal — debería redirigir a `/coleccion` con el juego eliminado

- [ ] **Step 7: Ejecutar la suite de tests final**

```bash
npx vitest run
```

Esperado: pasan 27 tests.

- [ ] **Step 8: Commit si se hicieron correcciones**

```bash
git add -A && git commit -m "fix: address smoke test findings"
```

(Omitir si no se necesitaron correcciones.)
