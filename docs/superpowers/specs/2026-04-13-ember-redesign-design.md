# Spec: Ember Redesign — vg-collection

**Date:** 2026-04-13  
**Branch:** `main` (fresh additions)  
**Status:** Approved by user

---

## Overview

A full visual redesign of the `vg-collection` app using the "Ember" aesthetic: dark charcoal background with ember red accent, cinematic typography (Bebas Neue + DM Sans), and a new home layout that adds a Popular Games section powered by the IGDB API, a redesigned sticky header with search and login, and a login/register modal.

---

## 1. Color & Typography System

### CSS Custom Properties (`src/index.css`)

Replace all existing CSS variables with:

```css
:root {
  --bg: #0f0e0e;
  --bg-surface: #1a1918;
  --bg-elevated: #242220;
  --accent: #e03c2f;
  --accent-dim: rgba(224, 60, 47, 0.15);
  --text: #c9c2b8;
  --text-h: #f5f0ea;
  --border: #2e2b28;

  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
}
```

### Google Fonts

Import in `index.html` (or `index.css` via `@import`):
- **Bebas Neue** — display headings, logo, section titles, game card titles
- **DM Sans** — all body text, UI labels, buttons, form fields, table data
- **JetBrains Mono** — ratings, years, numeric data

### Background Texture

A subtle SVG-based noise texture at 3% opacity is applied to the `body` element as a `background-image`. Generated as an inline data URI or a small static asset at `public/noise.svg`. This adds depth to the flat dark background without affecting readability.

---

## 2. Ant Design Theme (`src/main.tsx`)

`<ConfigProvider>` receives a `theme` prop with `algorithm: theme.darkAlgorithm` and the following token overrides:

| Token | Value |
|---|---|
| `colorPrimary` | `#e03c2f` |
| `colorBgContainer` | `#1a1918` |
| `colorBgElevated` | `#242220` |
| `colorBorder` | `#2e2b28` |
| `colorText` | `#c9c2b8` |
| `colorTextHeading` | `#f5f0ea` |
| `fontFamily` | `'DM Sans', sans-serif` |
| `borderRadius` | `6` |
| `colorLink` | `#e03c2f` |

These tokens propagate to all Ant Design components: Table, Modal, Form, Select, Input, Button, Card, Tag. No per-component inline style overrides are needed for theming.

---

## 3. Header (`src/shared/ui/AppLayout.tsx`)

The `AppLayout` header is a sticky 64px dark strip with three zones:

### Left — Logo
- Wordmark "VG COLLECTION" in Bebas Neue, ~28px, `--text-h` color
- A small ember-red decorative mark (e.g., `●` or `▸`) before the wordmark
- Clicking the logo scrolls to the top of the page (no routing)

### Center — Search Bar
- Ant Design `Input.Search`, pill-shaped (border-radius: 24px)
- Width: ~380px (flex: grows between logo and button)
- Dark background (`--bg-elevated`), `--border` default border, `--accent` focus ring
- Placeholder: "Buscar juegos, géneros, plataformas…"
- `onChange` dispatches `setSearch` to `GamesContext` — filters the collection table in real time
- The search bar is NOT connected to IGDB (IGDB section is separate, pre-loaded)

### Right — Login Button
- Bordered pill button: `--accent` border + `--accent` text color on `--bg-surface` background
- On hover: fills to `--accent` background with `--text-h` text (transition 150ms)
- Text: "Login"
- `onClick`: opens the Login modal

### Header Component Structure

`AppLayout` is wrapped by `AuthProvider` in `App.tsx`. The `LoginButton` component reads `isLoggedIn` and `user` from `useAuthContext()` — when `isLoggedIn` is `true`, it renders a red circle avatar with the user's email initial instead of the "Login" button.

```
<AuthProvider>              ← wraps entire app in App.tsx
  <AppLayout>
    <Header sticky>
      <Logo />
      <HeaderSearch />        ← new component, dispatches to GamesContext
      <LoginButton />         ← new component, reads AuthContext
    </Header>
    <Content>
      <PopularGamesSection /> ← new component
      <GamesPage />           ← existing, restyled
    </Content>
  </AppLayout>
  <LoginModal />              ← rendered at root level, controlled by AuthContext
</AuthProvider>
```

---

## 4. IGDB Integration

### API Access

IGDB requires a Twitch OAuth token. The app uses a Vite dev proxy to avoid exposing credentials in the browser bundle.

**`.env.local`** (git-ignored):
```
VITE_IGDB_CLIENT_ID=<your-client-id>
VITE_IGDB_CLIENT_SECRET=<your-client-secret>
```

**`vite.config.ts`** — add a server proxy with token fetching fully in the Node.js proxy context:

```ts
// vite.config.ts (Node.js context — not the browser bundle)
// The proxy configure hook fetches a Twitch OAuth token on startup,
// caches it in a module-level variable, and injects it into every proxied request.
// React code only calls /api/igdb/* — credentials never reach the browser.
server: {
  proxy: {
    '/api/igdb': {
      target: 'https://api.igdb.com/v4',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/igdb/, ''),
      configure: (proxy) => {
        let cachedToken: string | null = null

        // Fetch token once; cache until Vite restarts
        async function getToken(): Promise<string> {
          if (cachedToken) return cachedToken
          const res = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.VITE_IGDB_CLIENT_ID}&client_secret=${process.env.VITE_IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
            { method: 'POST' }
          )
          const data = await res.json() as { access_token: string }
          cachedToken = data.access_token
          return cachedToken
        }

        proxy.on('proxyReq', (proxyReq) => {
          // Token is injected synchronously after first warm-up.
          // On first request, cachedToken may be null for a brief moment;
          // subsequent requests always have the token.
          getToken().then((token) => {
            proxyReq.setHeader('Client-ID', process.env.VITE_IGDB_CLIENT_ID ?? '')
            proxyReq.setHeader('Authorization', `Bearer ${token}`)
          }).catch(() => { /* token fetch failed; IGDB will return 401 */ })
        })
      },
    },
  },
}
```

> **Token handling**: All credential handling is in `vite.config.ts` (Node.js). No React file reads or stores the IGDB Client-ID or token. `VITE_IGDB_CLIENT_ID` and `VITE_IGDB_CLIENT_SECRET` are loaded by Vite from `.env.local` and available as `process.env.*` in the config file (Node context) but NOT exposed to the browser bundle (they are not referenced in any `src/` file).

### IGDB Query

Endpoint: `POST /api/igdb/games`  
Body:
```
fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
where total_rating_count > 100 & cover != null;
sort total_rating desc;
limit 20;
```

This returns the top 20 rated games with covers. Cover URLs use IGDB's image API: replace `t_thumb` with `t_cover_big` for 264×374 resolution.

### Data Flow

```
PopularGamesSection
  └── useIgdbPopularGames() hook
        ├── state: { games, loading, error }
        ├── fetches once on mount
        └── returns { games: IgdbGame[], loading: boolean, error: string | null }
```

`IgdbGame` interface:
```ts
interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number  // Unix timestamp
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
}
```

### Error & Loading States

- **Loading**: render 8 skeleton cards (same size as real cards, `--bg-surface` background, animated shimmer)
- **Error**: a single-line message in `--text` color: "No se pudo cargar juegos populares" — no blocking UI, collection still works

---

## 5. Popular Games Section (`src/features/popular/`)

New feature directory: `src/features/popular/`

### Files

- `src/features/popular/ui/PopularGamesSection.tsx` — section wrapper with heading and card row
- `src/features/popular/ui/PopularGameCard.tsx` — individual game card
- `src/features/popular/hooks/useIgdbPopularGames.ts` — data fetching hook
- `src/features/popular/types.ts` — `IgdbGame` interface

### Layout

```
<section id="popular-games">
  <h2>POPULAR AHORA</h2>          ← Bebas Neue, --text-h, letter-spacing 2px
  <div class="cards-row">         ← horizontal scroll, gap 16px, no scrollbar
    <PopularGameCard />            ← repeat × N (or × 8 skeletons)
  </div>
</section>
```

The `cards-row` uses `display: flex; overflow-x: auto; scroll-snap-type: x mandatory` with `scrollbar-width: none` to hide the native scrollbar.

### Card Design

Dimensions: 180px wide × 260px tall  
Structure (top to bottom):
1. **Cover image** — 180×240px, `object-fit: cover`, top-rounded corners
2. **Title bar** — dark overlay strip at the bottom: game title in Bebas Neue 16px, `--text-h`

On hover:
- `transform: scale(1.04)` (transition 200ms ease)
- `box-shadow: 0 0 18px var(--accent-dim)` (red glow)
- Title overlay becomes slightly more opaque

Cards are not clickable (no routing to a game detail page — out of scope).

---

## 6. Login / Register Modal (`src/features/auth/`)

New feature directory: `src/features/auth/`

### Files

- `src/features/auth/ui/LoginModal.tsx` — modal with login + register tabs or toggled views
- `src/features/auth/state/AuthContext.tsx` — minimal context: `{ isLoggedIn: boolean, user: null | { email: string } }`
- `src/features/auth/state/authReducer.ts` — actions: `login`, `logout`

### Modal Design

- Ant Design `Modal`, `centered`, `width: 420px`
- Dark background (`--bg-surface`), red top border accent (4px top border in `--accent`)
- **Logo** centered at top inside the modal
- **Two views**: Login and Register, toggled by a footer link
- No tabs — a simple state toggle (`'login' | 'register'`)

**Login view fields:**
- Email (`Input`, type email, required)
- Contraseña (`Input.Password`, required)
- "Iniciar sesión" — full-width primary button (`--accent` background)
- Footer: "¿No tienes cuenta? Regístrate" — toggles to register view

**Register view fields:**
- Nombre de usuario (`Input`, required)
- Email (`Input`, type email, required)
- Contraseña (`Input.Password`, required)
- "Crear cuenta" — full-width primary button
- Footer: "¿Ya tienes cuenta? Inicia sesión" — toggles back to login view

**On submit (both views):**
- No backend call
- `dispatch({ type: 'login', payload: { email } })`
- Show Ant Design success `message.success('¡Bienvenido!')`
- Close the modal
- The header Login button changes to show the user's email initial in a red circle avatar

### Auth State Persistence

Not persisted — `isLoggedIn` resets on page reload (mock auth). This is explicitly out of scope.

---

## 7. Existing Collection Restyling

The existing `GamesPage`, `GamesTable`, `GamesToolbar`, `GameFormModal`, and `StatusTag` components are **not structurally changed** — only visual adjustments:

- The wrapping `<Card>` in `GamesPage` uses `--bg-surface` background (inherited from ConfigProvider token)
- A section heading above the card: "TU COLECCIÓN" in Bebas Neue + a small logo mark
- `GamesToolbar`: the "Crear juego" `<Button type="primary">` inherits red from ConfigProvider — no change needed
- `GamesTable`: dark rows from ConfigProvider dark theme — no change needed
- `StatusTag`: colors updated to use ember palette:
  - `backlog` → dark gray (`#3a3836`)
  - `playing` → ember orange (`#e07a2f`)
  - `completed` → green (`#2e7d52`)
  - `paused` → muted yellow (`#8a7a2f`)
  - `dropped` → muted red (`#7a2e2e`)
- `GameFormModal`: inherits dark theme from ConfigProvider — no structural change

---

## 8. Routing

No routing library is added. The app remains a single page. The header search filters the collection table via `GamesContext`. There is no navigation between pages.

---

## 9. File Structure Changes

### New files
```
src/
  features/
    auth/
      ui/LoginModal.tsx
      state/AuthContext.tsx
      state/authReducer.ts
    popular/
      ui/PopularGamesSection.tsx
      ui/PopularGameCard.tsx
      hooks/useIgdbPopularGames.ts
      types.ts
  shared/
    ui/
      HeaderSearch.tsx        ← extracted from AppLayout
      LoginButton.tsx         ← extracted from AppLayout
public/
  noise.svg                   ← background texture
.env.local                    ← IGDB credentials (git-ignored)
docs/
  superpowers/
    specs/
      2026-04-13-ember-redesign-design.md
```

### Modified files
```
src/index.css                 ← full replacement of CSS variables + fonts
src/main.tsx                  ← add ConfigProvider theme tokens
src/shared/ui/AppLayout.tsx   ← full rewrite: sticky header, 3-zone layout
src/shared/ui/StatusTag.tsx   ← updated color mapping
src/App.tsx                   ← wrap with AuthProvider, add PopularGamesSection
vite.config.ts                ← add IGDB proxy with token fetch
index.html                    ← add Google Fonts link tags
.gitignore                    ← ensure .env.local is listed (if not already)
```

---

## 10. Out of Scope

- Actual backend authentication
- Persistent login state across page reloads
- Clicking a Popular Game card to view details
- Routing / multiple pages
- Mobile responsiveness (not prioritized in this iteration)
- Unit tests for new components (existing tests remain unmodified)
