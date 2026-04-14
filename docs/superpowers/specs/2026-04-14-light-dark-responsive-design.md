# Spec: Light/Dark Mode + Responsive Layout + Playwright Viewport Tests

**Date:** 2026-04-14  
**Status:** Approved

---

## Overview

Add a light/dark theme toggle (persisted in localStorage) and make the app fully responsive across mobile, tablet, and desktop. Dark mode stays identical to the current design. Add a Playwright E2E test suite that validates layout correctness at each breakpoint.

---

## Section 1: Theme System

### Architecture

**Approach:** React Context + `data-theme` attribute on `<html>` + CSS custom properties.

- `ThemeContext` reads `localStorage` key `'vg-theme'` on init (default: `'dark'`).
- On toggle: sets `document.documentElement.setAttribute('data-theme', theme)` and writes to `localStorage`.
- Exports `useTheme(): { theme: 'dark' | 'light', toggleTheme: () => void }`.
- `ThemeProvider` wraps the app in `main.tsx` above `ConfigProvider`.

### CSS Variables (`src/index.css`)

Dark theme (current `:root`) gains one missing variable:
```css
--text-muted: #6b6560;
```

Light theme override block added:
```css
:root[data-theme="light"] {
  --bg:          #f5f2ee;
  --bg-surface:  #ffffff;
  --bg-elevated: #eae6e1;
  --text:        #3a3530;
  --text-h:      #1a1714;
  --text-muted:  #7a736b;
  --border:      #d4cfc9;
  --accent-dim:  rgba(224, 60, 47, 0.10);
  /* --accent: #e03c2f unchanged — same in both themes */
}
```

### Ant Design ConfigProvider (`src/main.tsx`)

`ConfigProvider` moves into a `ThemedConfigProvider` child component that consumes `useTheme()`:

- Dark → `theme.darkAlgorithm` + current tokens (unchanged)
- Light → `theme.defaultAlgorithm` + light-equivalent tokens:
  - `colorBgContainer: '#ffffff'`
  - `colorBgElevated: '#eae6e1'`
  - `colorBorder: '#d4cfc9'`
  - `colorText: '#3a3530'`
  - `colorTextHeading: '#1a1714'`
  - `colorPrimary: '#e03c2f'` (unchanged)

### Toggle UI

- Location: `AppLayout` header, between `HeaderSearch` and `LoginButton`.
- Component: `ThemeToggle` button using `SunOutlined` (light mode active) / `MoonOutlined` (dark mode active) from `@ant-design/icons`.
- Style: icon-only button, `var(--text-muted)` color, no background, 36×36px touch target.
- Aria label: `"Cambiar a modo claro"` / `"Cambiar a modo oscuro"`.

### New files

- `src/shared/state/ThemeContext.tsx` — context + provider + hook
- `src/shared/ui/ThemeToggle.tsx` — toggle button component

### Modified files

- `src/index.css` — add `--text-muted` to `:root`, add light theme block
- `src/main.tsx` — wrap with `ThemeProvider`, extract `ThemedConfigProvider`
- `src/shared/ui/AppLayout.tsx` — add `ThemeToggle` to header

---

## Section 2: Responsive Layout

### Breakpoints

| Name | Range       | Devices                         |
|------|-------------|---------------------------------|
| xs   | < 480px     | iPhone SE, Android small        |
| sm   | 480–767px   | iPhone 14, Pixel 7              |
| md   | 768–1023px  | iPad Mini, iPad Air             |
| lg   | ≥ 1024px    | Desktop (current behavior)      |

Breakpoints defined as CSS custom media or inline `@media` blocks. JS breakpoint detection uses Ant Design's `Grid.useBreakpoint()` hook where logic branching is needed.

### AppLayout — Header

**lg (≥ 1024px):** current layout unchanged.

**md (768–1023px):**
- Logo font-size: 22px (down from 28px).
- Nav links remain visible.
- Search remains visible but `max-width: 220px`.

**xs/sm (< 768px):**
- Logo text hidden, only `▸` icon shown (saves space).
- Nav links hidden.
- Hamburger button (`MenuOutlined`) appears at far right.
- Clicking hamburger opens an Ant Design `Drawer` from the left with: logo, nav links (Inicio / Mi Colección / Crear Juego), ThemeToggle, LoginButton.
- Header search hidden on xs/sm (search available inside the drawer or via the page-level input on CollectionPage).
- Header height: 56px (down from 64px) on xs/sm.

### CollectionPage

- Search input: `max-width: 400px` on lg → `width: 100%` on xs/sm.
- Platform chip groups: on xs/sm each group row becomes `overflow-x: auto; flex-wrap: nowrap` (horizontal scroll per group), so chips don't stack into a wall of text.
- Game grid: `minmax(180px, 1fr)` on lg → `minmax(140px, 1fr)` on xs → `minmax(160px, 1fr)` on sm/md.

### GameFormModal

- Modal `width`: default (520px) on lg → `95vw` on xs/sm.

### CreateGamePage / GameDetailPage / HomePage

- Content `padding`: `24px` on lg → `12px 16px` on xs/sm.
- Form / detail containers with fixed `maxWidth`: become `width: 100%` on xs/sm.

### Implementation strategy

- Global spacing and padding rules in `src/index.css` via `@media` blocks.
- Per-component responsive overrides inline via `style` props conditioned on `useBreakpoint()` where CSS alone is insufficient (e.g., drawer toggle visibility).
- Prefer CSS media queries over JS where possible to avoid layout flicker.

---

## Section 3: Playwright Viewport/Breakpoint Tests

### Setup

- Install `@playwright/test` as devDependency.
- Add `"test:e2e": "playwright test"` to `package.json` scripts.
- Tests live in `e2e/` directory (separate from Vitest's `src/test/`).
- Config file: `playwright.config.ts` at project root.

### playwright.config.ts

```ts
baseURL: 'http://localhost:5173'
webServer: { command: 'npm run dev', port: 5173, reuseExistingServer: true }
projects: one per device (see table below)
testDir: './e2e'
```

### Devices tested

| Project name  | Device preset        | Viewport    |
|---------------|----------------------|-------------|
| mobile-se     | iPhone SE            | 375×667     |
| mobile-14     | iPhone 14            | 390×844     |
| mobile-pixel  | Pixel 7              | 412×915     |
| tablet-mini   | iPad Mini            | 768×1024    |
| tablet-pro    | iPad Pro 11          | 834×1194    |
| desktop       | (custom)             | 1280×800    |
| desktop-hd    | (custom)             | 1920×1080   |

### Test file: `e2e/responsive.spec.ts`

For each device, tests run against `/` and `/coleccion`. Assertions:

1. **No horizontal overflow** — `body.scrollWidth <= window.innerWidth`.
2. **Logo present** — the `▸` accent character is visible in the header.
3. **Navigation accessible:**
   - xs/sm: hamburger button (`role="button"`, name matching "menú" or `MenuOutlined`) is visible; nav links are NOT visible in the header.
   - md/lg: nav links ("Inicio", "Mi Colección") are directly visible in the header.
4. **Theme toggle present** — button with aria-label matching "modo" exists in header (or in drawer on xs/sm).
5. **Theme toggle works** — clicking it changes `html[data-theme]` attribute.
6. **CollectionPage grid columns** — on xs: at least 2 cards fit per row; on lg: at least 4.

### Running tests

```bash
npm run test:e2e          # all devices
npx playwright test --project=mobile-14   # single device
npx playwright show-report               # HTML report
```

Vitest tests remain unchanged: `npm test` (24 passing).

---

## Files Summary

### New files
| File | Purpose |
|------|---------|
| `src/shared/state/ThemeContext.tsx` | Theme context, provider, hook |
| `src/shared/ui/ThemeToggle.tsx` | Sun/Moon icon button |
| `playwright.config.ts` | Playwright configuration |
| `e2e/responsive.spec.ts` | Viewport/breakpoint E2E tests |

### Modified files
| File | Change |
|------|--------|
| `src/index.css` | Add `--text-muted` to dark theme, add light theme block, add responsive global rules |
| `src/main.tsx` | Add `ThemeProvider`, extract `ThemedConfigProvider` |
| `src/shared/ui/AppLayout.tsx` | Add `ThemeToggle`, hamburger menu + Drawer for xs/sm |
| `src/features/collection/ui/CollectionPage.tsx` | Responsive search width, chip scroll, grid breakpoints |
| `src/features/games/ui/GameFormModal.tsx` | Responsive modal width |
| `src/features/games/ui/CreateGamePage.tsx` | Responsive padding/width |
| `src/features/games/ui/GameDetailPage.tsx` | Responsive padding/width |
| `src/features/home/ui/HomePage.tsx` | Responsive padding |
| `package.json` | Add `test:e2e` script |

---

## Verification

```bash
npx tsc --noEmit                          # zero errors
npx vitest run --exclude ".worktrees/**"  # 24 passed
npm run test:e2e                          # all viewport tests pass
```
