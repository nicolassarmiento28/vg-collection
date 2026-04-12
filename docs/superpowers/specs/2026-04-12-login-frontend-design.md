# Frontend Login Design (Email + Password)

Date: 2026-04-12
Scope: Frontend-only authentication gate for the current app.

## Goals

- Add a login screen using email and password.
- Enforce form and credential validations with clear Spanish messages.
- Persist authenticated session locally without storing passwords.
- Protect current game catalog UI behind auth state.
- Keep implementation aligned with existing app patterns (React + Context + storage guards).

## Non-Goals

- No backend auth.
- No real user registration.
- No password reset or account recovery.
- No production-grade security guarantees (this is a local/demo auth layer).

## User Experience

### Logged out

- App opens on `LoginPage`.
- User sees fields: `Email`, `Contrasena` and submit button `Iniciar sesion`.
- Validation errors appear inline from Ant Design rules.

### Validation rules

- Email:
  - Required.
  - Must be a valid email format.
- Password:
  - Required.
  - Minimum 8 characters.
  - Must contain at least one letter and one number.

### Credential check

- Local demo credentials are checked in auth service layer.
- Invalid credentials show a form-level error message.

### Logged in

- Main app (existing games flow) is rendered.
- Header includes authenticated email and `Cerrar sesion` action.

### Logout

- Clears persisted auth session.
- Returns user to `LoginPage`.

## Architecture

## Auth domain state

- Add a dedicated auth model in `src/features/auth`:
  - `AuthSession` (minimal persisted shape: `isAuthenticated`, `email`, `updatedAt`).
  - `AuthState` for provider runtime.

## Auth storage

- Add localStorage auth module with safe parsing and validation:
  - `loadAuthState()`
  - `saveAuthState()`
  - `clearAuthState()`
- Corrupt payload handling: return default logged-out state.

## Auth context

- Add `AuthProvider` + `useAuthContext`.
- Provider exposes:
  - `state` (`isAuthenticated`, `email`, `error?`, `isSubmitting?`)
  - `login(email, password)` async-like API (Promise for UX consistency)
  - `logout()`

## App gate

- Compose providers in `src/main.tsx` so auth wraps app.
- In `src/App.tsx`:
  - If logged out: render `LoginPage`.
  - If logged in: render current `GamesPage` within `AppLayout`.

## Header integration

- Extend `AppLayout` props for:
  - `userEmail?: string`
  - `onLogout?: () => void`
- Render user email + logout button when provided.

## Local credential source

- Add a small auth service with demo credentials constant:
  - `DEMO_AUTH_USER = { email: 'demo@vg.com', password: 'Demo1234' }`
- Password is never persisted, only compared in-memory at login time.

## Error handling and resilience

- Storage read/write failures must never crash app.
- Login failures should produce deterministic user-facing errors.
- Auth state should default to logged out on any malformed persisted data.

## Testing Strategy (TDD)

## Unit tests

- Auth storage:
  - missing key -> default logged-out state
  - valid persisted session -> loaded
  - malformed session -> default state
  - save failure -> no throw
- Auth validation/service:
  - valid credentials -> success
  - invalid email/password combination -> failure

## Component/integration tests

- Login form validation messages for invalid email/password.
- Successful login renders games app and header user info.
- Invalid credentials keeps user on login and shows error.
- Logout returns to login and clears persisted session.

## File Plan

- `src/features/auth/types/auth.ts` (new)
- `src/features/auth/lib/storage/authStorage.ts` (new)
- `src/features/auth/lib/storage/authStorage.test.ts` (new)
- `src/features/auth/lib/authService.ts` (new)
- `src/features/auth/lib/authService.test.ts` (new)
- `src/features/auth/state/AuthContext.tsx` (new)
- `src/features/auth/state/useAuthContext.ts` (new if needed by lint rule)
- `src/features/auth/ui/LoginPage.tsx` (new)
- `src/features/auth/ui/LoginPage.test.tsx` (new)
- `src/App.tsx` (update for auth gate)
- `src/main.tsx` (provider wiring)
- `src/shared/ui/AppLayout.tsx` (header logout/email support)

## Verification Gates

Implementation completion requires all:

1. Targeted tests for auth changes pass.
2. Full `npm run test` passes.
3. `npm run lint` passes.
4. `npm run build` passes.

## Risks and Mitigations

- Risk: Mixing auth and games concerns in same files.
  - Mitigation: Keep auth under `src/features/auth` and only gate in `App.tsx`.
- Risk: localStorage contract breakage.
  - Mitigation: explicit validators and safe fallbacks.
- Risk: flaky login UI tests.
  - Mitigation: prefer user-facing assertions and `waitFor` only for actual async transitions.
