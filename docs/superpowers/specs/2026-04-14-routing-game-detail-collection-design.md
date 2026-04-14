# Routing, Game Detail Page & Enriched Collection — Design Spec

**Date:** 2026-04-14
**Status:** Approved

---

## Goal

Three connected improvements to the app:

1. **Routing** — instalar React Router v7 y crear rutas `/`, `/coleccion`, `/juego/:id`. El logo "VG COLLECTION" navega a `/`. El header incluye tabs "Inicio" y "Mi Colección".
2. **Pantalla de detalle de juego** (`/juego/:id`) — layout tipo banner inmersivo (Opción B elegida) que muestra toda la info de IGDB del juego con botón "Agregar a mi colección".
3. **Colección enriquecida** (`/coleccion`) — reemplaza la tabla actual con un grid de tarjetas tipo biblioteca (Opción A elegida): portada real de IGDB, badge de estado, rating, plataforma. Filtros como chips horizontales.

---

## Architecture

### Routing

Instalar `react-router-dom` v7. El punto de entrada es `App.tsx` que monta un `<BrowserRouter>` con tres `<Route>`:

| Ruta | Componente | Auth required |
|---|---|---|
| `/` | `HomePage` | No |
| `/coleccion` | `CollectionPage` | Sí (gate con placeholder) |
| `/juego/:id` | `GameDetailPage` | No |

`AppLayout` se mantiene como shell (header sticky + content). Cada página se renderiza dentro del `<Content>`.

El logo del header usa `<Link to="/">` de React Router en lugar del `window.scrollTo` actual.

El header añade dos tabs centrales entre el logo y el search:

```
▸ VG COLLECTION   [  Inicio  |  Mi Colección  ]   [🔍 search]   [avatar]
```

Los tabs usan `<NavLink>` con `isActive` para el estilo de la línea roja activa.

### IGDB: campos adicionales necesarios

La pantalla de detalle necesita más campos de IGDB que los que se traen actualmente. Se extiende `IgdbGame` en `types.ts` con campos opcionales:

```ts
summary?: string          // descripción larga
genres?: Array<{ name: string }>
rating?: number           // alias de total_rating para detalle
involved_companies?: Array<{ company: { name: string }; developer: boolean }>
```

El hook `useIgdbGameDetail` hace un `POST /api/igdb/games` con query:
```
fields name,cover.url,first_release_date,platforms.abbreviation,
       total_rating,total_rating_count,summary,genres.name,
       involved_companies.company.name,involved_companies.developer;
where id = <id>;
limit 1;
```

### Estado global: navegación con IgdbGame

Cuando el usuario hace click en una tarjeta de "Popular Ahora" o en el resultado del autocomplete **para ver el detalle** (en vez de agregar directo), la app navega a `/juego/:id`. El `id` es el IGDB id numérico.

`GameDetailPage` recibe el `:id` de los params de React Router y llama a `useIgdbGameDetail(id)`.

---

## Feature 1: Routing con React Router v7

### Cambios de archivos

- `package.json` — agregar `react-router-dom`
- `src/App.tsx` — envolver en `<BrowserRouter>`, definir `<Routes>` con tres `<Route>`
- `src/shared/ui/AppLayout.tsx` — cambiar el botón logo por `<Link to="/">`, agregar tabs con `<NavLink>`
- `src/features/home/ui/HomePage.tsx` — **nuevo** — extrae `PopularGamesSection` + `CollectionGatePlaceholder`/`GamesPage` a una página
- `src/features/collection/ui/CollectionPage.tsx` — **nuevo** — la colección enriquecida (ver Feature 3)
- `src/features/games/ui/GameDetailPage.tsx` — **nuevo** — detalle de juego (ver Feature 2)

### Header tabs

```tsx
// AppLayout.tsx — zona central del header
<div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
  <NavLink to="/" end style={navStyle}>Inicio</NavLink>
  <NavLink to="/coleccion" style={navStyle}>Mi Colección</NavLink>
</div>
```

`navStyle` aplica `color: var(--accent)` + `borderBottom: '2px solid var(--accent)'` cuando `isActive`, gris cuando no.

El `<HeaderSearch>` se mueve a la zona derecha del centro, mantiene su ancho 380px.

### Auth gate en `/coleccion`

`CollectionPage` incluye internamente el mismo gate actual: si `!isLoggedIn`, muestra `CollectionGatePlaceholder`. Si está logueado, muestra el grid enriquecido.

---

## Feature 2: Pantalla de detalle de juego (`/juego/:id`)

### Layout: Banner inmersivo (Opción B)

```
┌─────────────────────────────────────────────────────┐
│  [degradado oscuro → acento suave, 220px alto]      │
│                                                     │
│  [portada 120×170]  Nombre del juego                │
│  superpuesta        Desarrollador · Año             │
│  -20px hacia abajo                                  │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  (padding-top 28px para dejar espacio a portada)    │
│                                                     │
│  Descripción completa (summary de IGDB)             │
│                                                     │
│  Grid 2×2 de stats:                                 │
│  ⭐ Rating  |  🎮 Plataforma(s)                     │
│  📅 Año    |  🏷️ Género(s)                          │
│                                                     │
│  [+ Agregar a mi colección]  ← botón primario       │
│                                                     │
│  Si ya está en colección: badge "Ya en tu colección"│
└─────────────────────────────────────────────────────┘
```

### Componentes

- `src/features/games/ui/GameDetailPage.tsx` — página principal
- `src/features/games/hooks/useIgdbGameDetail.ts` — nuevo hook, fetch por id
- `src/features/popular/types.ts` — extender `IgdbGame` con `summary`, `genres`, `involved_companies`

### Interacción "Agregar a mi colección"

Al hacer click en el botón:
- Si el usuario **no está logueado**: abre el `LoginModal`.
- Si está logueado: abre el `GameFormModal` con prefill (título, año, plataforma), igual que el flujo actual desde el autocomplete. Dispatch `openCreateModal(prefill)`.

El botón detecta si el juego ya está en la colección (busca `state.games` por título exacto) y en ese caso muestra un badge verde "Ya en tu colección" en lugar del botón.

### Navegación hacia GameDetailPage

Dos puntos de entrada:

1. **`PopularGameCard`** — se vuelve clickeable (`cursor: pointer`), navega a `/juego/:id` con `useNavigate`.
2. **`HeaderSearch`** — se agrega una segunda acción: al seleccionar un resultado, en lugar de (o además de) abrir el modal, navega a `/juego/:id`. El modal de agregar queda en la página de detalle.

> **Decisión**: `HeaderSearch` al seleccionar un resultado navega a `/juego/:id` directamente (elimina el `openCreateModal` dispatch que hacía antes). El usuario agrega el juego desde la página de detalle.

### Loading y error

- Skeleton: banner gris animado + bloque de texto placeholder.
- Error: mensaje "No se pudo cargar el juego" con botón "Volver".

---

## Feature 3: Colección enriquecida (`/coleccion`)

### Layout: Grid de tarjetas (Opción A)

Grid responsivo de tarjetas. Cada tarjeta:

```
┌─────────────────┐
│  [portada IGDB] │  ← imagen real si existe en IGDB, fallback color sólido
│  180×240px      │
│  [badge estado] │  ← esquina inferior derecha sobre la imagen
└─────────────────┘
  Título del juego
  Plataforma · Año
  ★ Rating (si tiene)
```

Ancho de columna fijo 180px, `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`.

**Badge de estado** sobre la imagen con los colores actuales de `StatusTag`.

**Portada real de IGDB**: los juegos guardados en la colección tienen solo los campos del form (título, plataforma, etc.) — no tienen cover de IGDB. Para mostrar portadas, se necesita hacer una búsqueda por título al cargar la colección.

**Estrategia de portadas:**
- `useCollectionCovers` hook — recibe la lista de juegos, hace `POST /api/igdb/games` con query `search "título"; fields name,cover.url; limit 1;` para cada juego en paralelo (máx 5 concurrentes para no saturar). Cachea los resultados en un `Map<gameId, coverUrl>` en estado local.
- Si no encuentra portada, la tarjeta muestra un fallback: fondo degradado con las iniciales del juego.

### Filtros tipo chips

Fila horizontal encima del grid:

```
[Todos]  [Backlog]  [Jugando]  [Completado]  [Pausado]  [Abandonado]
         [PC]  [PlayStation]  [Xbox]  [Switch]  [Mobile]  [Otra]
```

Dos filas de chips: primera por estado, segunda por plataforma. El chip activo tiene borde y color de acento. Click en chip activo lo deselecciona (vuelve a "Todos").

Los filtros reemplazan los selects actuales de `GamesToolbar`. La barra de búsqueda de texto se mantiene arriba de los chips.

### Acción en tarjeta

Hover sobre tarjeta muestra overlay con:
- Botón "Editar"
- Botón "Ver detalle" → navega a `/juego/:id` (solo si se obtuvo el IGDB id de la portada)
- Botón "Marcar completado" (si no está completado)

### Archivo nuevo

`src/features/collection/ui/CollectionPage.tsx` — nuevo archivo, contiene el grid y los chips. Reutiliza `GameFormModal` para edición.
`src/features/collection/hooks/useCollectionCovers.ts` — nuevo hook para las portadas.

---

## File Map

| Archivo | Acción | Propósito |
|---|---|---|
| `package.json` | Modificar | Agregar `react-router-dom` |
| `src/App.tsx` | Modificar | `<BrowserRouter>` + `<Routes>` con 3 rutas |
| `src/shared/ui/AppLayout.tsx` | Modificar | Logo como `<Link>`, tabs `<NavLink>` en centro |
| `src/features/home/ui/HomePage.tsx` | Crear | Popular + gate/colección actual (single page home) |
| `src/features/collection/ui/CollectionPage.tsx` | Crear | Grid enriquecido con portadas, chips de filtro |
| `src/features/collection/hooks/useCollectionCovers.ts` | Crear | Portadas IGDB para juegos de la colección |
| `src/features/games/ui/GameDetailPage.tsx` | Crear | Detalle de juego con banner inmersivo |
| `src/features/games/hooks/useIgdbGameDetail.ts` | Crear | Fetch IGDB por id con campos extendidos |
| `src/features/popular/types.ts` | Modificar | Agregar `summary`, `genres`, `involved_companies` |
| `src/features/popular/ui/PopularGameCard.tsx` | Modificar | Clickeable, navega a `/juego/:id` |
| `src/shared/ui/HeaderSearch.tsx` | Modificar | Al seleccionar, navega a `/juego/:id` en vez de `openCreateModal` |
| `src/features/games/ui/GamesPage.tsx` | Eliminar uso directo | Reemplazado por `CollectionPage` en `/coleccion` |

---

## Data Flow

```
Usuario clicks PopularGameCard
  → navigate('/juego/123456')
  → GameDetailPage monta, llama useIgdbGameDetail('123456')
  → Muestra banner + info
  → Click "Agregar a mi colección"
    → Si no logueado: abre LoginModal
    → Si logueado: dispatch openCreateModal(prefill) → GameFormModal

Usuario escribe en HeaderSearch
  → useIgdbSearch devuelve resultados
  → Usuario selecciona resultado
  → navigate('/juego/123456')

Usuario va a /coleccion
  → CollectionPage monta
  → Lee state.games de GamesContext
  → useCollectionCovers busca portadas en IGDB por título
  → Renderiza grid con portadas reales o fallback
```

---

## Constraints

- **No hay backend**: la colección sigue en `localStorage`. Los IGDB ids no se guardan en `Game` — la búsqueda de portadas es por título.
- **Rate limiting IGDB**: `useCollectionCovers` limita a 5 fetches concurrentes para no saturar el proxy.
- **TypeScript strict**: todo nuevo código con tipos explícitos, sin `any`.
- **Tests**: los tests existentes (23) no deben romperse. No se requieren tests nuevos en esta iteración.
- **UI language**: español en todo texto visible al usuario.
- **`GamesPage.tsx` existente**: queda deprecated. `CollectionPage` reimplementa su funcionalidad usando el mismo `GamesContext`, `GameFormModal` y `GamesToolbar`. La lógica de modal (local state + context state) se replica en `CollectionPage`. `GamesPage` no se elimina en esta iteración para no romper tests existentes — simplemente deja de estar montado en el árbol de rutas.

---

## Out of Scope

- Favoritos (mencionado en opción C de navegación, no elegido)
- Backend/persistencia remota
- Autenticación real
- Tests nuevos (más allá de no romper los existentes)
- Página 404
