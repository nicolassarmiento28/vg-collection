# Spec: Auth Gate + Demo Credentials + IGDB Header Search

**Date:** 2026-04-14  
**Status:** Approved

---

## Overview

Three focused improvements to the vg-collection Ember app:

1. **Auth gate on Tu Colección** — the collection section is hidden until the user logs in.
2. **Demo credentials card in login modal** — a visible hint showing the test email and password.
3. **IGDB autocomplete in header search** — the header search bar queries IGDB as the user types and pre-fills the game form modal on selection.

---

## 1. Auth Gate — Tu Colección

### Behavior

- `GamesPage` is only rendered when `state.isLoggedIn === true` (from `AuthContext`).
- When the user is **not** logged in, a placeholder section is shown in its place:
  - Same `▸ TU COLECCIÓN` heading (Bebas Neue, ember accent).
  - A centered block with a lock icon (`🔒` or Ant Design `LockOutlined`), the text "Inicia sesión para ver tu colección", and a primary button "Iniciar sesión" that dispatches `{ type: 'openModal' }`.
- When the user **logs in**, the placeholder disappears and `GamesPage` renders normally.
- When the user **logs out**, `GamesPage` unmounts and the placeholder reappears.

### Implementation

- Change is contained to `App.tsx`: read `state.isLoggedIn` from `useAuthContext`, conditionally render `<GamesPage />` or `<CollectionGatePlaceholder />`.
- `CollectionGatePlaceholder` is a small inline component in `App.tsx` (no separate file needed).

---

## 2. Demo Credentials Card in Login Modal

### Behavior

- In the login view of `LoginModal`, display an Ant Design `Alert` component above the form fields.
- The alert shows:
  ```
  Usuario demo
  Email: demo@vgcollection.app  |  Contraseña: demo1234
  ```
- Style: `type="info"`, custom styles matching the ember dark theme — dark semi-transparent background (`rgba(255,255,255,0.04)`), left border `4px solid var(--accent)`, no default Ant Design blue icon coloring.
- The alert is only shown in the **login view** (not register view).
- The mock auth accepts **any** email and password — the demo credentials are just a hint for convenience.

### Implementation

- Edit `LoginModal.tsx`: add an `<Alert>` before the login `<Form>` block.

---

## 3. IGDB Autocomplete in Header Search

### Behavior

- The header `HeaderSearch` component becomes an `AutoComplete` backed by a live IGDB search.
- **Debounce:** 400 ms after the user stops typing before firing the IGDB request.
- **Minimum query length:** 2 characters. Below that, the dropdown is empty.
- **Dropdown options** each show:
  - Game cover thumbnail (32×32 px, `object-fit: cover`, rounded 4px) — fallback gray box if no cover.
  - Game name (bold, white).
  - Release year (muted, small).
- **On select:** Opens `GameFormModal` in `create` mode with pre-filled fields:
  - `title` ← `game.name`
  - `year` ← year extracted from `game.first_release_date` (Unix timestamp → full year)
  - `platform` ← first matched platform abbreviation mapped to local `Platform` enum; falls back to `'other'` if no match.
  - `status`, `genre`, `rating`, `notes` ← left empty for user to fill.
- **Loading state:** Show a spinning indicator inside the dropdown while fetching.
- **Error / no results:** Show "Sin resultados" option (disabled) if the query returns nothing.
- The search bar no longer dispatches `setSearch` to `GamesContext`. The collection toolbar's own search field (`GamesToolbar`) continues to filter the local collection independently.

### New hook: `useIgdbSearch`

File: `src/features/popular/hooks/useIgdbSearch.ts`

```ts
function useIgdbSearch(query: string): { results: IgdbGame[]; loading: boolean }
```

- Uses `useEffect` with a `setTimeout` debounce (400 ms).
- Query sent to `/api/igdb/games` via POST with body:
  ```
  search "{query}"; fields name,cover.url,first_release_date,platforms.abbreviation; limit 8;
  ```
- Returns up to 8 results.
- Clears results when query is shorter than 2 characters.
- Cancels in-flight requests on cleanup with an `abortController`.

### Platform mapping

```ts
const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  PS1: 'playstation', PS2: 'playstation', PS3: 'playstation',
  PS4: 'playstation', PS5: 'playstation',
  XB: 'xbox', X360: 'xbox', XONE: 'xbox', XSX: 'xbox',
  NS: 'switch',
  iOS: 'mobile', Android: 'mobile',
}
```

First platform abbreviation in the IGDB result that maps to a known value is used; otherwise `'other'`.

### `HeaderSearch` changes

- Replace `Input.Search` with Ant Design `AutoComplete` wrapping a custom `Input`.
- `options` prop is derived from `useIgdbSearch` results, rendered as custom `label` nodes.
- `onSelect` callback: maps selected `IgdbGame` to `GameFormValues` partial, then calls a new prop `onGameSelect(game: IgdbGame)` passed down from `App.tsx`.
- Loading spinner shown via `suffix` on the inner `Input` when `loading === true`.

### `GameFormModal` pre-fill

`GameFormModal` already accepts a `game?: Game` prop for edit mode. For IGDB pre-fill in create mode, a new optional prop `prefill?: Partial<GameFormValues>` is added. When provided and `mode === 'create'`, `form.setFieldsValue(prefill)` is called in the `useEffect`.

### State wiring in `App.tsx`

```tsx
const [igdbPrefill, setIgdbPrefill] = useState<Partial<GameFormValues> | undefined>()
const [isGameModalOpen, setIsGameModalOpen] = useState(false)

function handleIgdbSelect(game: IgdbGame) {
  setIgdbPrefill(mapIgdbToFormValues(game))
  setIsGameModalOpen(true)
}
```

`GameFormModal` is lifted from `GamesPage` to `App.tsx` for this IGDB-triggered open path, OR a shared open-modal event is propagated via context. **Recommended:** keep `GameFormModal` inside `GamesPage` and add an imperative ref or a new context action `openCreateModal(prefill?)` to `GamesContext`.

---

## Architecture Summary

| File | Change |
|---|---|
| `src/App.tsx` | Auth gate conditional render, `CollectionGatePlaceholder` inline component |
| `src/features/auth/ui/LoginModal.tsx` | Add demo credentials `Alert` |
| `src/shared/ui/HeaderSearch.tsx` | Replace `Input.Search` with `AutoComplete` + `useIgdbSearch` |
| `src/features/popular/hooks/useIgdbSearch.ts` | New hook |
| `src/features/popular/types.ts` | No changes needed |
| `src/features/games/ui/GamesPage.tsx` | Accept `openModal` trigger from context or expose ref |
| `src/features/games/state/gamesReducer.ts` | Add `openCreateModal(prefill?)` action if context approach chosen |
| `src/features/games/state/GamesContext.tsx` | Wire new action if context approach chosen |

---

## Error Handling

- IGDB search errors are swallowed silently — the dropdown shows "Sin resultados" (same as empty).
- If the cover URL is missing, a neutral gray placeholder box is shown.
- If the IGDB proxy returns 401/500, the dropdown shows "Sin resultados" without crashing.

---

## Out of Scope

- Persistent login (localStorage / session).
- Real authentication backend.
- Pagination of IGDB search results.
- Clicking a Popular Now card to pre-fill the form.
