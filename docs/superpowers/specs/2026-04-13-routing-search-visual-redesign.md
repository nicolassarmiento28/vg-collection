# Spec: Routing, IGDB Search Flow & Visual Redesign

**Date:** 2026-04-13
**Status:** Approved

---

## Overview

Refactor the `vg-collection` app to introduce URL-based navigation (React Router v6), complete the IGDB game search and detail flow, and update the visual style to use grey text and transparent-green buttons while keeping the Matrix color palette.

---

## Goals

1. Replace the current single-page conditional render with real URL routes.
2. Surface the IGDB search as a dedicated page with a card grid of results.
3. Add a game detail page that shows full IGDB metadata and lets the user add the game to their collection via a modal.
4. Remove the canvas rain animation from the login page.
5. Update text colors to grey and buttons to transparent green, maintaining the Matrix dark theme.

## Non-Goals

- No backend or real authentication (local demo credentials stay).
- No pagination on search results (IGDB returns up to 10 results; that is sufficient).
- No social or sharing features.
- No changes to the `localStorage` schema or the games reducer logic.

---

## Architecture

### Router

Install `react-router-dom` v6. Define a `<BrowserRouter>` wrapping the full app in `src/main.tsx` (outside `AuthProvider` and `GamesProvider`).

Routes are declared in `src/router.tsx`:

```
/login          → <LoginPage />          public — redirects to / if already authenticated
/               → <CollectionPage />     private
/search         → <SearchPage />         private
/game/:igdbId   → <GameDetailPage />     private
*               → redirect to /          catch-all
```

A `<PrivateRoute>` component wraps all private routes. It reads `AuthContext` — if `!isAuthenticated`, it renders `<Navigate to="/login" replace />`. If authenticated and the current path is `/login`, it renders `<Navigate to="/" replace />`.

### File map

**New files:**
| File | Responsibility |
|---|---|
| `src/router.tsx` | Route definitions, `<PrivateRoute>` component |
| `src/features/games/ui/SearchPage.tsx` | IGDB search input + results grid |
| `src/features/games/ui/GameDetailPage.tsx` | IGDB game detail + "Add to collection" modal |
| `src/features/games/ui/GameCard.tsx` | Reusable card component used in SearchPage |

**Modified files:**
| File | Change |
|---|---|
| `src/main.tsx` | Wrap tree in `<BrowserRouter>` (outermost provider, before AuthProvider) |
| `src/App.tsx` | Replace conditional render with `<Routes>` from react-router-dom; `<BrowserRouter>` lives in main.tsx, not here |
| `src/shared/ui/AppLayout.tsx` | Add nav links (Colección, Buscar), use `<Link>` from react-router-dom |
| `src/features/auth/ui/LoginPage.tsx` | Remove `useMatrixRain` hook and `<canvas>` element entirely |
| `src/features/games/ui/GamesPage.tsx` | Rename to `CollectionPage.tsx` (same logic, new filename) |
| `src/theme/matrixTheme.ts` | Update text color tokens to grey, update button tokens to transparent green |
| `src/index.css` | Update `--matrix-primary` text usage; add button transparent-green styles |

**Unchanged files:**
- `src/features/games/state/` — all context, reducer, actions unchanged
- `src/features/auth/state/` — all context, actions unchanged
- `src/features/games/ui/GameFormModal.tsx` — reused as-is for manual add and edit
- `src/features/games/api/igdbApi.ts` — reused as-is
- `src/server/` — IGDB server middleware unchanged

---

## Feature Specs

### 1. Login Page

- Remove `useMatrixRain`, `MATRIX_CHARS`, and the `<canvas>` element.
- Keep the card layout: dark background `#050f05`, neon green border `1px solid #39ff14`, `box-shadow: 0 0 24px #39ff1440`.
- Title "INICIAR SESION" stays in `#39ff14`.
- Inputs: black background, green border on focus/hover (already handled by `matrixTheme`).
- On successful login → `LoginPage` calls `navigate('/')` via `useNavigate()` inside the `login()` success path.
- If user is already authenticated when visiting `/login` → `<PrivateRoute>` redirects to `/` before rendering `LoginPage`.

### 2. AppLayout Navigation

- Header keeps the app title and user email + logout button.
- Add two `<NavLink>` elements from react-router-dom:
  - **"Mi Colección"** → `/`
  - **"Buscar juegos"** → `/search`
- Active link is highlighted with `color: #39ff14` and an underline; inactive links are grey `#a0a0a0`.
- Logout calls `logout()` then `navigate('/login')`.

### 3. Collection Page (`/`)

- Identical to current `GamesPage`. File renamed to `CollectionPage.tsx`.
- Toolbar: text search, platform family filter, platform filter, status filter.
- "Agregar juego" button opens `GameFormModal` (manual add, no IGDB prefill required).
- Table columns: Title, Family, Platform, Status, Genre, Year, Rating, Actions (Edit, Complete).
- Edit action opens `GameFormModal` pre-populated.
- Complete action dispatches `markGameCompleted`.

### 4. Search Page (`/search`)

**Layout:**
- Centered search input at the top (full-width on mobile, max 600px on desktop).
- Placeholder: "Buscar juego en IGDB...".
- Search triggers on Enter key or a "Buscar" button click.
- While loading: show a spinner (Ant Design `<Spin>`).
- On error: show an error message in red.
- On empty results: show "No se encontraron resultados para «{query}»".

**Results grid:**
- CSS grid, 2 columns on mobile, 3–4 on desktop (`repeat(auto-fill, minmax(200px, 1fr))`).
- Each `<GameCard>` shows:
  - Cover image (if available) or a placeholder dark rectangle with a controller icon.
  - Game name in grey `#a0a0a0`, truncated to 2 lines.
  - Release year and first platform slug in grey `#606060`.
- Card hover: border changes from `#1a4a1a` to `rgba(57,255,20,0.5)`, subtle glow.
- Clicking a card navigates to `/game/:igdbId`.

**State (local to SearchPage):**
- `query: string` — current input value.
- `submittedQuery: string` — last searched query (drives the API call).
- `results: IgdbGameDto[]`
- `loading: boolean`
- `error: string | undefined`

Search fires a `useEffect` on `submittedQuery` change.

### 5. Game Detail Page (`/game/:igdbId`)

**Data fetching:**
- On mount, call `fetchIgdbGameById(igdbId)` from `igdbApi.ts`.
- While loading: full-page spinner.
- On error or game not found: show error message with a "Volver" button.

**Layout (two-column on desktop, stacked on mobile):**
- **Left column:** Cover image (large, ~300px wide). If no cover, dark placeholder.
- **Right column:**
  - Game name as `<h1>` in grey `#a0a0a0`.
  - Year, genres (as tags), platforms (as tags) in grey `#606060`.
  - Synopsis/summary as body text in grey `#707070`.
  - **"Agregar a mi colección"** button — transparent green style.
  - If the game is already in the collection (`games.some(g => g.igdb?.id === igdbId)`): button shows "Ya en tu colección" and is disabled.

**"Agregar a mi colección" modal:**
- Opens an Ant Design `<Modal>` with the title "Agregar a colección".
- Fields:
  - **Plataforma** (required) — `<Select>` from `PLATFORM_CATALOG`.
  - **Estado** (required) — `<Select>`: backlog / playing / completed / paused / dropped. Default: `backlog`.
  - **Rating** (optional) — `<InputNumber>` 0–10.
  - **Notas** (optional) — `<Input.TextArea>`.
- On confirm: dispatch `addGame` with a new `Game` object that includes `igdb` metadata from the fetched DTO (id, slug, name, coverUrl, summary, firstReleaseDate, genres). Then `navigate('/')`.
- On cancel: close modal.

### 6. Manual Add (from CollectionPage)

- The "Agregar juego" button in `CollectionPage` opens `GameFormModal` as before.
- `GameFormModal` continues to support optional IGDB search to prefill fields.
- No changes to `GameFormModal` logic.

---

## Visual Design

### Color tokens (updated)

| Token | Old value | New value | Purpose |
|---|---|---|---|
| `colorText` | `#22cc00` | `#a0a0a0` | Main body text — grey |
| `colorTextSecondary` | `#1a9900` | `#707070` | Secondary text — darker grey |
| `colorTextTertiary` | `#1a9900` | `#606060` | Tertiary text |
| `colorTextQuaternary` | `#14aa00` | `#505050` | Disabled/placeholder text |
| `colorWarning` | `#cc8800` | `#cc8800` | Unchanged |
| `colorPrimary` | `#39ff14` | `#39ff14` | Unchanged — neon green accents |

### Button style (transparent green)

Applied via `matrixTheme.ts` component token overrides for `Button`:

```
defaultBg:          rgba(57, 255, 20, 0.08)
defaultBorderColor: rgba(57, 255, 20, 0.4)
defaultColor:       #39ff14
defaultHoverBg:     rgba(57, 255, 20, 0.15)   (via CSS hover if token not available)
primaryColor:       #000000                    (text on filled primary button)
```

Primary buttons (e.g. submit in modals) keep filled neon green background with black text.

### CSS variable update (`index.css`)

The `color: var(--matrix-primary)` on `:root` changes to `color: #a0a0a0` to make all default text grey. All other variables remain.

### GameCard visual

```
background:   #0a1f0a
border:       1px solid #1a4a1a
border-radius: 6px
padding:      0 (image fills top, text below with 12px padding)

hover:
  border-color: rgba(57, 255, 20, 0.5)
  box-shadow:   0 0 12px rgba(57, 255, 20, 0.15)

Name text:    #a0a0a0, font-size 13px, max 2 lines, overflow ellipsis
Meta text:    #606060, font-size 12px
```

### NavLink active style

```
active:   color #39ff14, border-bottom 2px solid #39ff14
inactive: color #a0a0a0, no underline
hover:    color #cccccc
```

---

## Error Handling

- `SearchPage`: catch errors from `searchIgdbGames`, display message, allow retry.
- `GameDetailPage`: catch errors from `fetchIgdbGameById`, show error + "Volver" button that calls `navigate(-1)`.
- If `igdbId` param is not a valid number: show "Juego no encontrado" immediately.

---

## Testing

This change involves both behavior (new routes, new pages, new API calls) and visual changes.

**New tests required:**
- `SearchPage.test.tsx` — renders search input; on submit calls `searchIgdbGames`; shows grid on results; shows empty state; shows error state.
- `GameDetailPage.test.tsx` — calls `fetchIgdbGameById` on mount; shows game info; "Agregar" button opens modal; dispatches `addGame` on confirm; button disabled if game already in collection.
- `PrivateRoute.test.tsx` — redirects unauthenticated users to `/login`; allows authenticated users through.

**Existing tests:**
- `LoginPage` tests must be updated to remove canvas/animation assertions if any exist.
- `GamesPage` tests → file renamed to `CollectionPage`, import paths updated.
- All other existing tests unchanged.

---

## Constraints

- TypeScript strict mode throughout (`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`).
- No `any`.
- Follow existing patterns: named exports, relative imports, feature-folder structure.
- Do not modify `src/server/` — IGDB middleware is unchanged.
- Do not change `localStorage` schema.
- All 57 existing tests must continue to pass after refactor.
