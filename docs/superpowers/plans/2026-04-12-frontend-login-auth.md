# Frontend Login Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a frontend-only email/password login gate with validations, persisted local session, and logout flow for the existing games app.

**Architecture:** Introduce a focused `auth` feature with service + storage + context + login UI. Keep the games feature unchanged and gate rendering at `App.tsx`. Persist only minimal session data in localStorage and enforce safe fallback behavior for malformed data.

**Tech Stack:** React 19, TypeScript, Ant Design, Vitest, Testing Library, localStorage.

---

### Task 1: Add auth domain model and storage contract

**Files:**
- Create: `src/features/auth/types/auth.ts`
- Create: `src/features/auth/lib/storage/authStorage.ts`
- Test: `src/features/auth/lib/storage/authStorage.test.ts`

- [ ] **Step 1: Write the failing storage tests**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadAuthState, saveAuthState, clearAuthState, AUTH_STORAGE_KEY } from './authStorage'

describe('authStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('returns logged-out default when key is missing', () => {
    expect(loadAuthState()).toEqual({ isAuthenticated: false })
  })

  it('loads a valid persisted session', () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: true,
        email: 'demo@vg.com',
        updatedAt: '2026-04-12T00:00:00.000Z',
      }),
    )

    expect(loadAuthState()).toEqual({
      isAuthenticated: true,
      email: 'demo@vg.com',
      updatedAt: '2026-04-12T00:00:00.000Z',
    })
  })

  it('returns logged-out default for malformed payload', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{invalid')

    expect(loadAuthState()).toEqual({ isAuthenticated: false })
  })

  it('does not throw when save fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failure')
    })

    expect(() =>
      saveAuthState({
        isAuthenticated: true,
        email: 'demo@vg.com',
        updatedAt: '2026-04-12T00:00:00.000Z',
      }),
    ).not.toThrow()
  })

  it('clears stored session', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{}')
    clearAuthState()

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/auth/lib/storage/authStorage.test.ts`
Expected: FAIL with missing module/file errors.

- [ ] **Step 3: Write minimal auth types + storage implementation**

```ts
// src/features/auth/types/auth.ts
export interface AuthSession {
  isAuthenticated: true
  email: string
  updatedAt: string
}

export interface LoggedOutState {
  isAuthenticated: false
}

export type AuthStorageState = AuthSession | LoggedOutState

export const defaultAuthState: LoggedOutState = {
  isAuthenticated: false,
}
```

```ts
// src/features/auth/lib/storage/authStorage.ts
import { defaultAuthState, type AuthStorageState } from '../../types/auth'

export const AUTH_STORAGE_KEY = 'vg-collection:auth:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidAuthState(value: unknown): value is AuthStorageState {
  if (!isRecord(value) || typeof value.isAuthenticated !== 'boolean') {
    return false
  }

  if (!value.isAuthenticated) {
    return true
  }

  return typeof value.email === 'string' && typeof value.updatedAt === 'string'
}

export function loadAuthState(): AuthStorageState {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (raw === null) {
    return defaultAuthState
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isValidAuthState(parsed) ? parsed : defaultAuthState
  } catch {
    return defaultAuthState
  }
}

export function saveAuthState(state: AuthStorageState): void {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // no-op
  }
}

export function clearAuthState(): void {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // no-op
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/auth/lib/storage/authStorage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/types/auth.ts src/features/auth/lib/storage/authStorage.ts src/features/auth/lib/storage/authStorage.test.ts
git commit -m "add auth storage contract and safe session persistence"
```

### Task 2: Add local auth service with credential validation

**Files:**
- Create: `src/features/auth/lib/authService.ts`
- Test: `src/features/auth/lib/authService.test.ts`

- [ ] **Step 1: Write the failing service tests**

```ts
import { describe, expect, it } from 'vitest'

import { authenticateLocalUser, DEMO_AUTH_USER } from './authService'

describe('authService', () => {
  it('authenticates demo user with valid credentials', async () => {
    await expect(
      authenticateLocalUser({ email: DEMO_AUTH_USER.email, password: DEMO_AUTH_USER.password }),
    ).resolves.toEqual({ email: DEMO_AUTH_USER.email })
  })

  it('rejects invalid credentials', async () => {
    await expect(
      authenticateLocalUser({ email: 'wrong@vg.com', password: 'Wrong1234' }),
    ).rejects.toThrow('Credenciales invalidas')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/auth/lib/authService.test.ts`
Expected: FAIL with missing module/file errors.

- [ ] **Step 3: Write minimal auth service implementation**

```ts
// src/features/auth/lib/authService.ts
export const DEMO_AUTH_USER = {
  email: 'demo@vg.com',
  password: 'Demo1234',
} as const

interface LoginCredentials {
  email: string
  password: string
}

interface AuthenticatedUser {
  email: string
}

export async function authenticateLocalUser(
  credentials: LoginCredentials,
): Promise<AuthenticatedUser> {
  const email = credentials.email.trim().toLowerCase()

  if (email !== DEMO_AUTH_USER.email || credentials.password !== DEMO_AUTH_USER.password) {
    throw new Error('Credenciales invalidas')
  }

  return { email: DEMO_AUTH_USER.email }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/auth/lib/authService.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/lib/authService.ts src/features/auth/lib/authService.test.ts
git commit -m "add local auth service for demo credentials"
```

### Task 3: Add AuthContext provider and hook

**Files:**
- Create: `src/features/auth/state/authContextInstance.ts`
- Create: `src/features/auth/state/useAuthContext.ts`
- Create: `src/features/auth/state/AuthContext.tsx`
- Test: `src/features/auth/state/AuthContext.test.tsx`

- [ ] **Step 1: Write the failing provider test**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from './AuthContext'
import { useAuthContext } from './useAuthContext'

function Probe() {
  const { state, login, logout } = useAuthContext()

  return (
    <>
      <div>{state.isAuthenticated ? state.email : 'logged-out'}</div>
      <button onClick={() => void login('demo@vg.com', 'Demo1234')}>login</button>
      <button onClick={logout}>logout</button>
    </>
  )
}

describe('AuthContext', () => {
  it('logs in and logs out through context API', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(screen.getByText('logged-out')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByText('demo@vg.com')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'logout' }))
    expect(screen.getByText('logged-out')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/auth/state/AuthContext.test.tsx`
Expected: FAIL with missing provider/hook modules.

- [ ] **Step 3: Implement context, hook, and state instance**

```ts
// src/features/auth/state/authContextInstance.ts
import { createContext, type Dispatch } from 'react'

import type { AuthStorageState } from '../types/auth'

export interface AuthState {
  session: AuthStorageState
  isSubmitting: boolean
  error?: string
}

export type AuthAction =
  | { type: 'loginStart' }
  | { type: 'loginSuccess'; payload: { email: string; updatedAt: string } }
  | { type: 'loginError'; payload: string }
  | { type: 'logout' }

export interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  dispatch: Dispatch<AuthAction>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
```

```ts
// src/features/auth/state/useAuthContext.ts
import { useContext } from 'react'

import { AuthContext, type AuthContextValue } from './authContextInstance'

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}
```

```tsx
// src/features/auth/state/AuthContext.tsx
import { useMemo, useReducer, type ReactNode } from 'react'

import { authenticateLocalUser } from '../lib/authService'
import { clearAuthState, loadAuthState, saveAuthState } from '../lib/storage/authStorage'
import { AuthContext, type AuthAction, type AuthState } from './authContextInstance'

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'loginStart':
      return { ...state, isSubmitting: true, error: undefined }
    case 'loginSuccess':
      return {
        ...state,
        isSubmitting: false,
        error: undefined,
        session: {
          isAuthenticated: true,
          email: action.payload.email,
          updatedAt: action.payload.updatedAt,
        },
      }
    case 'loginError':
      return { ...state, isSubmitting: false, error: action.payload }
    case 'logout':
      return { session: { isAuthenticated: false }, isSubmitting: false }
    default:
      return state
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    session: loadAuthState(),
    isSubmitting: false,
  })

  const value = useMemo(
    () => ({
      state,
      dispatch,
      login: async (email: string, password: string) => {
        dispatch({ type: 'loginStart' })

        try {
          const user = await authenticateLocalUser({ email, password })
          const updatedAt = new Date().toISOString()

          saveAuthState({
            isAuthenticated: true,
            email: user.email,
            updatedAt,
          })

          dispatch({ type: 'loginSuccess', payload: { email: user.email, updatedAt } })
        } catch {
          dispatch({ type: 'loginError', payload: 'Credenciales invalidas' })
        }
      },
      logout: () => {
        clearAuthState()
        dispatch({ type: 'logout' })
      },
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/auth/state/AuthContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/state/authContextInstance.ts src/features/auth/state/useAuthContext.ts src/features/auth/state/AuthContext.tsx src/features/auth/state/AuthContext.test.tsx
git commit -m "add auth provider and context login state management"
```

### Task 4: Add LoginPage with email/password validations

**Files:**
- Create: `src/features/auth/ui/LoginPage.tsx`
- Test: `src/features/auth/ui/LoginPage.test.tsx`

- [ ] **Step 1: Write the failing login UI tests**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from '../state/AuthContext'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('validates email and password rules', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument()
    expect(await screen.findByText('La contrasena es obligatoria')).toBeInTheDocument()
  })

  it('shows credential error for invalid login', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>,
    )

    await user.type(screen.getByLabelText('Email'), 'wrong@vg.com')
    await user.type(screen.getByLabelText('Contrasena'), 'Wrong1234')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales invalidas')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/auth/ui/LoginPage.test.tsx`
Expected: FAIL with missing component/module.

- [ ] **Step 3: Implement minimal login page**

```tsx
import { Button, Card, Form, Input, Typography } from 'antd'

import { useAuthContext } from '../state/useAuthContext'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { state, login } = useAuthContext()

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card title="Iniciar sesion" style={{ width: 420, maxWidth: '100%' }}>
        <Form<LoginFormValues> layout="vertical" onFinish={(values) => void login(values.email, values.password)}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email valido' },
            ]}
          >
            <Input aria-label="Email" />
          </Form.Item>

          <Form.Item
            label="Contrasena"
            name="password"
            rules={[
              { required: true, message: 'La contrasena es obligatoria' },
              { min: 8, message: 'La contrasena debe tener al menos 8 caracteres' },
              {
                validator: (_, value: string | undefined) => {
                  if (!value) {
                    return Promise.resolve()
                  }

                  const hasLetter = /[A-Za-z]/.test(value)
                  const hasNumber = /\d/.test(value)

                  return hasLetter && hasNumber
                    ? Promise.resolve()
                    : Promise.reject(new Error('La contrasena debe incluir letras y numeros'))
                },
              },
            ]}
          >
            <Input.Password aria-label="Contrasena" />
          </Form.Item>

          {state.error && (
            <Typography.Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
              {state.error}
            </Typography.Text>
          )}

          <Button block type="primary" htmlType="submit" loading={state.isSubmitting}>
            Iniciar sesion
          </Button>
        </Form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/auth/ui/LoginPage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/ui/LoginPage.tsx src/features/auth/ui/LoginPage.test.tsx
git commit -m "add login page with email and password validations"
```

### Task 5: Gate app rendering and wire provider composition

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx` (create)

- [ ] **Step 1: Write failing app-gate test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'
import { AuthProvider } from './features/auth/state/AuthContext'

describe('App auth gate', () => {
  it('shows login screen when unauthenticated', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Iniciar sesion' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because app currently always renders games page.

- [ ] **Step 3: Implement gate wiring in app and main**

```tsx
// src/App.tsx
import { LoginPage } from './features/auth/ui/LoginPage'
import { useAuthContext } from './features/auth/state/useAuthContext'
import { GamesPage } from './features/games/ui/GamesPage'
import { AppLayout } from './shared/ui/AppLayout'

function App() {
  const { state, logout } = useAuthContext()

  if (!state.session.isAuthenticated) {
    return <LoginPage />
  }

  return (
    <AppLayout userEmail={state.session.email} onLogout={logout}>
      <GamesPage />
    </AppLayout>
  )
}

export default App
```

```tsx
// src/main.tsx (relevant)
import { AuthProvider } from './features/auth/state/AuthContext'

// ... inside tree
<AuthProvider>
  <GamesProvider>
    <App />
  </GamesProvider>
</AuthProvider>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/App.test.tsx
git commit -m "gate app routes behind auth session state"
```

### Task 6: Add logout controls in layout and verify logout flow

**Files:**
- Modify: `src/shared/ui/AppLayout.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Extend failing test with logout expectation**

```tsx
it('logs out and returns to login screen', async () => {
  // Arrange with persisted authenticated auth state in localStorage
  // Render providers + App
  // Assert logout button visible
  // Click logout
  // Assert login heading visible again
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because layout currently has no logout controls.

- [ ] **Step 3: Add optional user/logout UI in layout**

```tsx
interface AppLayoutProps {
  children: ReactNode
  userEmail?: string
  onLogout?: () => void
}

// Header right area:
// - show email text when userEmail exists
// - show "Cerrar sesion" button when onLogout exists
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/AppLayout.tsx src/App.test.tsx
git commit -m "add authenticated header controls with logout action"
```

### Task 7: End-to-end auth verification and docs update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update docs with login credentials and behavior**

Add to `README.md`:

```md
## Frontend Login (Demo)

- Login is frontend-only and intended for demo/testing flows.
- Demo credentials:
  - Email: `demo@vg.com`
  - Contrasena: `Demo1234`
- Session is persisted in localStorage (no password persistence).
```

- [ ] **Step 2: Run targeted auth tests**

Run:

```bash
npm run test -- src/features/auth/lib/storage/authStorage.test.ts src/features/auth/lib/authService.test.ts src/features/auth/state/AuthContext.test.tsx src/features/auth/ui/LoginPage.test.tsx src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run full verification gate (required by AGENTS.md)**

Run in order:

```bash
npm run test
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 4: Commit final integration/docs task**

```bash
git add README.md
git commit -m "document frontend demo login flow and credentials"
```

## Plan Self-Review Notes

- Spec coverage: all requirements mapped (login screen, validations, local auth, session persistence, logout, safe fallbacks, test gates).
- Placeholder scan: no TODO/TBD placeholders remain in executable steps.
- Type consistency: `AuthStorageState`, `AuthProvider`, and `useAuthContext` naming kept consistent across all tasks.
