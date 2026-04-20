# Spec: Flechas de carrusel + Detalle de colección con datos IGDB

**Fecha:** 2026-04-20  
**Estado:** Aprobado

---

## Resumen

Dos mejoras independientes a la aplicación:

1. **Flechas de navegación en el carrusel "Mejor Valorados"** — botones circulares flotantes `‹` `›` para desplazarse entre las tarjetas.
2. **Página de detalle de colección enriquecida con datos IGDB** — cuando el juego tiene `igdbId`, la página muestra el mismo layout que `GameDetailPage` (banner, cover, descripción, rating IGDB) más una sección "En tu colección" con los datos propios del usuario.

---

## Feature 1 — Flechas en el carrusel

### Componente afectado
`src/features/popular/ui/PopularGamesSection.tsx`

### Comportamiento
- Se agregan dos botones `‹` y `›` superpuestos sobre los extremos izquierdo y derecho del contenedor scroll del carrusel.
- Estilo: circulares, `background: rgba(0,0,0,0.6)`, `border-radius: 50%`, `~40px` de diámetro, icono de flecha blanco.
- Al hacer clic, el carrusel hace `scrollBy({ left: ±(cardWidth * 3), behavior: 'smooth' })`.
- La flecha `‹` se oculta (`opacity: 0`, `pointer-events: none`) cuando `scrollLeft === 0`.
- La flecha `›` se oculta cuando el scroll llegó al final (`scrollLeft + clientWidth >= scrollWidth - 1`).
- La visibilidad se actualiza en un listener `onScroll` del contenedor y en un `ResizeObserver` (por si cambia el tamaño de ventana).
- Solo aplica cuando `layout === 'carousel'`. El grid de "Lanzamientos Recientes" no tiene flechas.

### Accesibilidad
- Los botones tienen `aria-label="Anterior"` y `aria-label="Siguiente"`.
- No reciben foco si están ocultos (`tabIndex={-1}` cuando `opacity: 0`).

---

## Feature 2 — Detalle de colección con datos IGDB

### Componente afectado
`src/features/collection/ui/CollectionDetailPage.tsx`

### Lógica de detección
```typescript
const hasIgdb = game.igdbId !== undefined
```
- Si `hasIgdb === true`: se llama `useIgdbGameDetail(game.igdbId)` (hook ya existente en `src/features/games/hooks/useIgdbGameDetail.ts`) para obtener datos IGDB en tiempo real.
- Si `hasIgdb === false`: se muestra el layout actual (solo datos del usuario).

### Layout cuando tiene igdbId (mismo que `GameDetailPage`)

1. **Hero banner** — imagen de fondo difuminada (artwork de IGDB o cover en baja resolución).
2. **Cabecera** — cover HD + título + desarrollador + año + plataforma + género + rating IGDB (estrella).
3. **Descripción** — `igdbGame.summary` en un bloque de texto.
4. **Separador "En tu colección"** — línea divisoria con badge de color acento.
5. **Sección del usuario:**
   - Status tag (backlog / playing / completed / paused / dropped)
   - Rating del usuario (si lo tiene)
   - Botones Editar y Eliminar
6. **OpinionCard** — pros/cons (si el usuario los escribió). Comportamiento idéntico al actual.
7. **Notas** — bloque `<pre>` con `game.notes` (si no está vacío).

### Layout cuando NO tiene igdbId

Sin cambios respecto al comportamiento actual: se muestra cover del usuario (base64 o URL o iniciales), título, plataforma, año, género, estado, rating propio, pros/cons, notas.

### Estados de carga y error

- **Cargando IGDB**: se muestra un skeleton del hero + cabecera mientras `useIgdbGameDetail` está en loading. La sección "En tu colección" (datos locales) se renderiza de inmediato sin esperar a IGDB.
- **Error IGDB / sin conexión**: se muestra un aviso discreto "No se pudo cargar la información de IGDB" y se cae al layout sin IGDB (solo datos del usuario).

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/features/popular/ui/PopularGamesSection.tsx` | Agregar flechas `‹`/`›`, ref al scroll container, lógica de visibilidad |
| `src/features/collection/ui/CollectionDetailPage.tsx` | Detectar `igdbId`, llamar `useIgdbGameDetail`, renderizar layout IGDB o layout actual |

## Archivos sin cambios

- `src/features/games/hooks/useIgdbGameDetail.ts` — se reutiliza tal cual
- `src/shared/types/game.ts` — no se agregan campos nuevos
- `src/shared/lib/storage/gamesStorage.ts` — no se toca el almacenamiento

---

## Fuera de scope

- Flechas en la sección "Lanzamientos Recientes" (layout grid, no aplica).
- Guardar descripción/summary de IGDB en localStorage.
- Modificar el formulario de agregar juego.
