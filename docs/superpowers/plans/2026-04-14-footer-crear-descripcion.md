# Footer, Crear Juego y Descripción en GameDetail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un footer global de copyright, una página `/crear` con formulario inline de creación de videojuegos, y un título "Descripción" encima del summary en `GameDetailPage`.

**Architecture:** El footer vive en `AppLayout`; los campos del formulario se extraen a `GameFormFields` para reutilizarlos en `CreateGamePage` sin duplicar código; `GameFormModal` sigue usando `GameFormFields` más el campo hidden `igdbId`; `GameDetailPage` añade un label encima del summary existente.

**Tech Stack:** React 19, TypeScript strict, Ant Design 6, React Router v6, Vitest

**Spec:** `docs/superpowers/specs/2026-04-14-footer-crear-descripcion-design.md`

**Verification commands:**
- TypeScript: `npx tsc --noEmit` (must output nothing)
- Tests: `npx vitest run --exclude ".worktrees/**"` (must show 24 passed)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/shared/ui/AppFooter.tsx` | Create | Footer component con texto de copyright |
| `src/shared/ui/AppLayout.tsx` | Modify | Añadir `AppFooter` + NavLink "Crear Juego" |
| `src/features/games/ui/GameFormFields.tsx` | Create | 7 campos comunes del formulario (sin igdbId) |
| `src/features/games/ui/GameFormModal.tsx` | Modify | Usar `GameFormFields` internamente |
| `src/features/games/ui/CreateGamePage.tsx` | Create | Página `/crear` con form inline y auth-gate |
| `src/App.tsx` | Modify | Ruta `/crear` → `CreateGamePage` |
| `src/features/games/ui/GameDetailPage.tsx` | Modify | Label "DESCRIPCIÓN" encima del summary |

---

## Task 1: Crear `AppFooter` y añadirlo a `AppLayout`

**Files:**
- Create: `src/shared/ui/AppFooter.tsx`
- Modify: `src/shared/ui/AppLayout.tsx`

- [ ] **Step 1: Crear `AppFooter.tsx`**

Crear el archivo `src/shared/ui/AppFooter.tsx` con el siguiente contenido:

```tsx
// src/shared/ui/AppFooter.tsx
import { Layout } from 'antd'

const { Footer } = Layout

export function AppFooter() {
  return (
    <Footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 12,
        padding: '16px 24px',
      }}
    >
      © 2026 Nicolás Sarmiento. Todos los derechos reservados.
    </Footer>
  )
}
```

- [ ] **Step 2: Modificar `AppLayout.tsx`**

El archivo actual está en `src/shared/ui/AppLayout.tsx`. Tiene `const { Header, Content } = Layout` y no incluye `Footer` ni `AppFooter`.

Cambios a aplicar:

1. Añadir el import de `AppFooter`:
```tsx
import { AppFooter } from './AppFooter'
```

2. Añadir el NavLink "Crear Juego" en la barra de navegación (actualmente tiene "Inicio" y "Mi Colección"):
```tsx
<NavLink to="/crear" style={navLinkStyle}>
  Crear Juego
</NavLink>
```
Se añade después del NavLink de "Mi Colección".

3. Añadir `<AppFooter />` después del `<Content>` y antes del cierre de `<Layout>`.

El resultado del componente `AppLayout` debe quedar así (sólo se muestran los cambios):
```tsx
// src/shared/ui/AppLayout.tsx
import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AppFooter } from './AppFooter'
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
          <NavLink to="/crear" style={navLinkStyle}>
            Crear Juego
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

      <AppFooter />
    </Layout>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin output (0 errores).

- [ ] **Step 4: Verificar tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Esperado: `Tests  24 passed (24)`

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/AppFooter.tsx src/shared/ui/AppLayout.tsx
git commit -m "feat: add global footer and Crear Juego nav link"
```

---

## Task 2: Extraer `GameFormFields` y refactorizar `GameFormModal`

**Files:**
- Create: `src/features/games/ui/GameFormFields.tsx`
- Modify: `src/features/games/ui/GameFormModal.tsx`

- [ ] **Step 1: Crear `GameFormFields.tsx`**

Este componente contiene los 7 campos comunes del formulario (sin `igdbId`). Es puramente presentacional — no tiene estado ni lógica, solo renderiza `Form.Item` dentro de un `Form` padre.

Crear `src/features/games/ui/GameFormFields.tsx`:

```tsx
// src/features/games/ui/GameFormFields.tsx
import { Form, Input, InputNumber, Select } from 'antd'
import type { GameStatus } from '../../../shared/types/game'

const statusOptions: Array<{ label: string; value: GameStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

export function GameFormFields() {
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
    </>
  )
}
```

- [ ] **Step 2: Refactorizar `GameFormModal.tsx` para usar `GameFormFields`**

`GameFormModal.tsx` actualmente tiene los 7 campos de forma directa. Reemplazar esos campos por `<GameFormFields />`, manteniendo el campo hidden `igdbId` directamente en el modal.

El archivo completo refactorizado debe ser:

```tsx
// src/features/games/ui/GameFormModal.tsx
import { Form, InputNumber, Modal } from 'antd'
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
        igdbId: game.igdbId,
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
        <GameFormFields />

        {/* Hidden field — carries igdbId from prefill (create) or game (edit) so it gets submitted */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin output (0 errores).

- [ ] **Step 4: Verificar tests — los 24 tests del modal deben seguir pasando**

```bash
npx vitest run --exclude ".worktrees/**"
```

Esperado: `Tests  24 passed (24)`. En particular `GameFormModal.test.tsx` debe pasar porque el comportamiento externo del modal no cambió.

- [ ] **Step 5: Commit**

```bash
git add src/features/games/ui/GameFormFields.tsx src/features/games/ui/GameFormModal.tsx
git commit -m "refactor: extract GameFormFields from GameFormModal for reuse"
```

---

## Task 3: Crear `CreateGamePage` y la ruta `/crear`

**Files:**
- Create: `src/features/games/ui/CreateGamePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Crear `CreateGamePage.tsx`**

Esta página tiene auth-gate (igual a `CollectionPage`). Si el usuario no está logueado muestra un placeholder. Si está logueado, muestra el formulario inline.

Al hacer submit válido: genera un `id` con `uuidv4()`, timestamps `createdAt`/`updatedAt` con `new Date().toISOString()`, despacha `addGame`, y navega a `/coleccion`.

```tsx
// src/features/games/ui/CreateGamePage.tsx
import { LockOutlined } from '@ant-design/icons'
import { Button, Form, InputNumber, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAuthContext } from '../../auth/state/AuthContext'
import { useGamesContext } from '../state/GamesContext'
import { GameFormFields } from './GameFormFields'
import type { GameStatus, Platform } from '../../../shared/types/game'

interface CreateGameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
}

const initialValues: Partial<CreateGameFormValues> = {
  title: '',
  genre: '',
  year: undefined,
  rating: undefined,
  notes: '',
}

export function CreateGamePage() {
  const { state: authState, dispatch: authDispatch } = useAuthContext()
  const { dispatch } = useGamesContext()
  const navigate = useNavigate()
  const [form] = Form.useForm<CreateGameFormValues>()

  if (!authState.isLoggedIn) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <LockOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para crear juegos en tu colección
        </div>
        <Button type="primary" onClick={() => authDispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    )
  }

  function handleFinish(values: CreateGameFormValues) {
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
        rating: values.rating,
        notes: values.notes,
        createdAt: now,
        updatedAt: now,
      },
    })
    navigate('/coleccion')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <Typography.Title
        level={2}
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-h)',
          letterSpacing: 1,
          marginBottom: 24,
        }}
      >
        Crear Juego
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <GameFormFields />

        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
            Guardar juego
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
```

- [ ] **Step 2: Añadir la ruta `/crear` en `App.tsx`**

En `src/App.tsx`, importar `CreateGamePage` y añadir la ruta. El archivo actualmente tiene:

```tsx
import { CollectionPage } from './features/collection/ui/CollectionPage'
import { AppLayout } from './shared/ui/AppLayout'
```

y las rutas:
```tsx
<Route path="/"           element={<HomePage />} />
<Route path="/coleccion"  element={<CollectionPage />} />
<Route path="/juego/:id"  element={<GameDetailPage />} />
```

Añadir el import:
```tsx
import { CreateGamePage } from './features/games/ui/CreateGamePage'
```

Y añadir la ruta después de `/coleccion`:
```tsx
<Route path="/crear"      element={<CreateGamePage />} />
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin output (0 errores).

- [ ] **Step 4: Verificar tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Esperado: `Tests  24 passed (24)`

- [ ] **Step 5: Commit**

```bash
git add src/features/games/ui/CreateGamePage.tsx src/App.tsx
git commit -m "feat: add /crear page with inline game creation form"
```

---

## Task 4: Añadir título "Descripción" en `GameDetailPage`

**Files:**
- Modify: `src/features/games/ui/GameDetailPage.tsx`

- [ ] **Step 1: Modificar el bloque del summary**

En `src/features/games/ui/GameDetailPage.tsx`, el bloque del summary está en las líneas 219-232 y actualmente luce así:

```tsx
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
```

Reemplazarlo por:

```tsx
        {/* Descripción */}
        {game.summary && (
          <div style={{ marginBottom: 28, marginTop: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Descripción
            </div>
            <p
              style={{
                color: 'var(--text)',
                fontSize: 15,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {game.summary}
            </p>
          </div>
        )}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sin output (0 errores).

- [ ] **Step 3: Verificar tests**

```bash
npx vitest run --exclude ".worktrees/**"
```

Esperado: `Tests  24 passed (24)`

- [ ] **Step 4: Commit**

```bash
git add src/features/games/ui/GameDetailPage.tsx
git commit -m "feat: add Descripcion label above game summary in GameDetailPage"
```

---

## Self-Review Checklist

- [x] Footer: Task 1 crea `AppFooter` y lo añade a `AppLayout` con el texto exacto del spec. NavLink "Crear Juego" también en Task 1.
- [x] `GameFormFields`: Task 2 extrae los 7 campos. `igdbId` NO está en `GameFormFields`, permanece en `GameFormModal`.
- [x] `GameFormModal` refactorizado en Task 2 — comportamiento externo idéntico, tests deben seguir pasando.
- [x] `CreateGamePage` en Task 3: auth-gate, form con `GameFormFields`, despacha `addGame` con UUID y timestamps, navega a `/coleccion`.
- [x] Ruta `/crear` añadida en `App.tsx` en Task 3.
- [x] Label "Descripción" en `GameDetailPage` en Task 4.
- [x] Verificación TS + tests en cada task.
- [x] Sin placeholders ni TBDs.
- [x] Tipos consistentes: `CreateGameFormValues` coincide con los campos de `GameFormFields`; `addGame` payload coincide con la interfaz `Game` de `src/shared/types/game.ts`.
