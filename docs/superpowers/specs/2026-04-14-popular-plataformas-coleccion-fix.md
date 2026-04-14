# Spec: Popular Ahora (2 secciones) + Plataformas expandidas + Fix "Ya en tu colección"

**Fecha:** 2026-04-14

---

## Objetivo

Tres mejoras independientes a la app `vg-collection`:

1. **Popular Ahora — dos secciones:** La `HomePage` muestra una sección "Mejor Valorados" (carrusel horizontal) y una sección "Lanzamientos Recientes" (grid completo), llenando la página.
2. **Plataformas expandidas:** El formulario de juego permite elegir la consola exacta (Mega Drive, SNES, PS1, etc.) agrupada por fabricante. Los filtros de colección reflejan esta expansión.
3. **Fix "Ya en tu colección":** Se agrega `igdbId?: number` al tipo `Game` para que `GameDetailPage` compare por ID de IGDB, no solo por título.

---

## 1. Popular Ahora — Dos secciones

### Hooks

- **`useIgdbPopularGames`** (ya existe) — renombrar query a "Mejor Valorados":
  ```
  fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
  where total_rating_count > 100 & cover != null;
  sort total_rating desc;
  limit 20;
  ```
- **`useIgdbRecentGames`** (nuevo) — query "Lanzamientos Recientes":
  ```
  fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
  where cover != null & first_release_date < <unix_timestamp_hoy> & first_release_date > <unix_hace_2_años>;
  sort first_release_date desc;
  limit 20;
  ```

### UI — `HomePage.tsx`

Estructura de la página:

```
<HomePage>
  <PopularGamesSection title="MEJOR VALORADOS" layout="carousel" hook=useIgdbPopularGames />
  <PopularGamesSection title="LANZAMIENTOS RECIENTES" layout="grid" hook=useIgdbRecentGames />
</HomePage>
```

**`PopularGamesSection`** acepta un prop `layout: 'carousel' | 'grid'`:
- `carousel`: flex row con `overflow-x: auto`, scroll snapping (comportamiento actual).
- `grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px` — sin scroll, llena el ancho disponible.

Ambas secciones reutilizan `PopularGameCard` y `PopularGameCardSkeleton` sin cambios.

---

## 2. Plataformas expandidas

### Tipo `Platform` en `shared/types/game.ts`

```ts
export type Platform =
  // Sega
  | 'sega-ms'      // Master System
  | 'sega-md'      // Mega Drive / Genesis
  | 'sega-saturn'  // Saturn
  | 'sega-dc'      // Dreamcast
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
  | 'gbc'          // Game Boy Color
  | 'gba'          // Game Boy Advance
  | 'nds'          // Nintendo DS
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
  | 'xbone'        // Xbox One
  | 'xbsx'         // Xbox Series X/S
  // PC
  | 'pc'
  // Commodore
  | 'c64'          // Commodore 64
  | 'amiga'
  // Otra
  | 'other'
```

### `PLATFORM_LABELS` — mapa de valor a etiqueta legible

```ts
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
```

Este mapa se exporta desde `game.ts` y se reutiliza en todos los lugares que muestran etiquetas.

### `GameFormModal.tsx` — Select agrupado

El select de plataforma usa `Select.OptGroup` de Ant Design:

```
Sega        → Master System, Mega Drive, Saturn, Dreamcast
Nintendo    → NES, SNES, N64, GameCube, Wii, Wii U, Switch
Portátiles Nintendo → Game Boy, GBC, GBA, DS, 3DS
PlayStation → PS1, PS2, PS3, PS4, PS5
Portátiles Sony → PSP, PS Vita
Microsoft   → Xbox, Xbox 360, Xbox One, Xbox Series X/S
PC          → PC
Commodore   → Commodore 64, Amiga
Otra        → Otra
```

### `CollectionPage.tsx` — chips de filtro por fabricante

Los chips de plataforma en lugar de listar ~30 valores, agrupan por fabricante:

```
Todas | Sega | Nintendo | PlayStation | Microsoft | PC | Commodore | Otra
```

El estado local del filtro de plataforma cambia de `Platform | 'all'` a un tipo de fabricante:

```ts
type PlatformGroup = 'all' | 'sega' | 'nintendo' | 'playstation' | 'microsoft' | 'pc' | 'commodore' | 'other'
```

Al seleccionar "Sega" se filtran todos los juegos con `platform` en `['sega-ms','sega-md','sega-saturn','sega-dc']`.

Se define un mapa:
```ts
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
```

Las tarjetas de colección muestran `PLATFORM_LABELS[game.platform]` en lugar del valor raw.

### `GamesPage.tsx` — toolbar

El toolbar de `GamesPage` también usa el select de plataformas expandido. El filtro de plataforma en `GamesState` mantiene el tipo `Platform | 'all'` — solo que ahora `Platform` tiene más valores. No hay cambio en el reducer.

### Mapeo IGDB → Platform

El mapa `IGDB_PLATFORM_MAP` en `GameDetailPage.tsx` y `HeaderSearch.tsx` (que ya no lo usa — se puede eliminar de HeaderSearch) se expande:

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
  // Mobile (mapeo legacy)
  iOS: 'other', Android: 'other',
}
```

---

## 3. Fix "Ya en tu colección"

### Tipo `Game` en `shared/types/game.ts`

Agregar campo opcional:

```ts
export interface Game {
  // ... campos existentes ...
  igdbId?: number   // IGDB game id, presente cuando el juego fue agregado desde IGDB
}
```

### `GameDetailPage.tsx` — pasar `igdbId` al prefill

El dispatch de `openCreateModal` ya incluye `prefill` (title, year, platform). Adicionalmente, se pasa `igdbId` como campo del prefill:

```ts
dispatch({
  type: 'openCreateModal',
  payload: { title: game.name, year, platform, igdbId: game.id }
})
```

### `GameFormPrefill` en `shared/types/game.ts`

```ts
export interface GameFormPrefill {
  title: string
  year: number
  platform: Platform
  igdbId?: number   // nuevo
}
```

### `GlobalGameFormModal` en `App.tsx` — incluir `igdbId` al crear

```ts
dispatch({
  type: 'addGame',
  payload: {
    id: uuidv4(),
    // ...
    igdbId: values.igdbId,  // tomado del prefill via campo oculto en el form
  },
})
```

El `igdbId` no se muestra al usuario en el form — se pasa como campo oculto (`<Form.Item name="igdbId" hidden>`).

### `GameDetailPage.tsx` — comparación primaria por `igdbId`

```ts
const alreadyInCollection = gamesState.games.some(
  (g) => (g.igdbId !== undefined && g.igdbId === game.id)
    || g.title.toLowerCase() === game.name.toLowerCase()
)
```

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/shared/types/game.ts` | `Platform` expandido, `PLATFORM_LABELS`, `igdbId` en `Game` y `GameFormPrefill` |
| `src/features/popular/hooks/useIgdbRecentGames.ts` | Nuevo hook |
| `src/features/popular/ui/PopularGamesSection.tsx` | Prop `layout`, `title` |
| `src/features/home/ui/HomePage.tsx` | Dos `PopularGamesSection` |
| `src/features/games/ui/GameFormModal.tsx` | Select agrupado, campo oculto `igdbId` |
| `src/features/games/ui/GameDetailPage.tsx` | Comparación por `igdbId`, dispatch con `igdbId`, IGDB_PLATFORM_MAP expandido |
| `src/features/collection/ui/CollectionPage.tsx` | Chips por fabricante, etiquetas legibles |
| `src/App.tsx` | `GlobalGameFormModal` incluye `igdbId` al crear |
| `src/features/games/ui/GamesPage.tsx` | Toolbar usa nuevas plataformas (si tiene select de filtro) |
| `src/shared/ui/HeaderSearch.tsx` | Eliminar `IGDB_PLATFORM_MAP` y `mapIgdbToFormPrefill` (ya no los usa) |

---

## Tests

Los tests existentes (23) deben seguir pasando. **El tipo `Platform` elimina los valores viejos** (`'playstation'`, `'xbox'`, `'switch'`, `'mobile'`). Antes de eliminarlos, se deben auditar los tests para ver si alguno usa esos valores. Si los usan, se migran al equivalente nuevo más cercano (ej. `'playstation'` → `'ps4'`, `'xbox'` → `'xbone'`, `'switch'` → `'switch'` — ese sí se mantiene, `'mobile'` → `'other'`).

`npx vitest run --exclude ".worktrees/**"` — debe terminar con 23 passed.
`npx tsc --noEmit` — sin errores.
