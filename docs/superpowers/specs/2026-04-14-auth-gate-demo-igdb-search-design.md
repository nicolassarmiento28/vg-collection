# Spec: Barrera de autenticación + Credenciales demo + Búsqueda IGDB en el header

**Fecha:** 2026-04-14  
**Estado:** Aprobado

---

## Resumen general

Tres mejoras puntuales a la app Ember de vg-collection:

1. **Barrera de autenticación en Tu Colección** — la sección de colección se oculta hasta que el usuario inicia sesión.
2. **Tarjeta de credenciales demo en el modal de login** — una pista visible que muestra el email y la contraseña de prueba.
3. **Autocompletado de IGDB en la búsqueda del header** — la barra de búsqueda del header consulta a IGDB mientras el usuario escribe y precarga el modal del formulario de juego al seleccionar.

---

## 1. Barrera de autenticación — Tu Colección

### Comportamiento

- `GamesPage` solo se renderiza cuando `state.isLoggedIn === true` (desde `AuthContext`).
- Cuando el usuario **no** ha iniciado sesión, se muestra una sección de placeholder en su lugar:
  - Mismo encabezado `▸ TU COLECCIÓN` (Bebas Neue, acento ember).
  - Un bloque centrado con un ícono de candado (`🔒` o `LockOutlined` de Ant Design), el texto "Inicia sesión para ver tu colección", y un botón primario "Iniciar sesión" que despacha `{ type: 'openModal' }`.
- Cuando el usuario **inicia sesión**, el placeholder desaparece y `GamesPage` se renderiza normalmente.
- Cuando el usuario **cierra sesión**, `GamesPage` se desmonta y el placeholder reaparece.

### Implementación

- El cambio se limita a `App.tsx`: leer `state.isLoggedIn` desde `useAuthContext`, renderizar condicionalmente `<GamesPage />` o `<CollectionGatePlaceholder />`.
- `CollectionGatePlaceholder` es un pequeño componente inline en `App.tsx` (no se necesita un archivo separado).

---

## 2. Tarjeta de credenciales demo en el modal de login

### Comportamiento

- En la vista de login de `LoginModal`, mostrar un componente `Alert` de Ant Design arriba de los campos del formulario.
- El alert muestra:
  ```
  Usuario demo
  Email: demo@vgcollection.app  |  Contraseña: demo1234
  ```
- Estilo: `type="info"`, estilos personalizados acordes al tema oscuro ember — fondo semitransparente oscuro (`rgba(255,255,255,0.04)`), borde izquierdo `4px solid var(--accent)`, sin el coloreado azul por defecto del ícono de Ant Design.
- El alert solo se muestra en la **vista de login** (no en la vista de registro).
- La autenticación simulada acepta **cualquier** email y contraseña — las credenciales demo son solo una pista por conveniencia.

### Implementación

- Editar `LoginModal.tsx`: agregar un `<Alert>` antes del bloque `<Form>` de login.

---

## 3. Autocompletado de IGDB en la búsqueda del header

### Comportamiento

- El componente `HeaderSearch` del header se convierte en un `AutoComplete` respaldado por una búsqueda en vivo de IGDB.
- **Debounce:** 400 ms después de que el usuario deja de escribir antes de disparar el request a IGDB.
- **Longitud mínima de consulta:** 2 caracteres. Por debajo de eso, el desplegable está vacío.
- **Cada opción del desplegable** muestra:
  - Miniatura de portada del juego (32×32 px, `object-fit: cover`, bordes redondeados de 4px) — caja gris de respaldo si no hay portada.
  - Nombre del juego (negrita, blanco).
  - Año de lanzamiento (atenuado, pequeño).
- **Al seleccionar:** Abre `GameFormModal` en modo `create` con campos precargados:
  - `title` ← `game.name`
  - `year` ← año extraído de `game.first_release_date` (timestamp Unix → año completo)
  - `platform` ← la primera abreviatura de plataforma coincidente mapeada al enum local `Platform`; recae en `'other'` si no hay coincidencia.
  - `status`, `genre`, `rating`, `notes` ← se dejan vacíos para que el usuario los complete.
- **Estado de carga:** Mostrar un indicador giratorio dentro del desplegable mientras se hace el fetch.
- **Error / sin resultados:** Mostrar la opción "Sin resultados" (deshabilitada) si la consulta no devuelve nada.
- La barra de búsqueda ya no despacha `setSearch` a `GamesContext`. El propio campo de búsqueda de la barra de herramientas de la colección (`GamesToolbar`) sigue filtrando la colección local de forma independiente.

### Nuevo hook: `useIgdbSearch`

Archivo: `src/features/popular/hooks/useIgdbSearch.ts`

```ts
function useIgdbSearch(query: string): { results: IgdbGame[]; loading: boolean }
```

- Usa `useEffect` con un debounce por `setTimeout` (400 ms).
- La consulta se envía a `/api/igdb/games` vía POST con body:
  ```
  search "{query}"; fields name,cover.url,first_release_date,platforms.abbreviation; limit 8;
  ```
- Devuelve hasta 8 resultados.
- Limpia los resultados cuando la consulta tiene menos de 2 caracteres.
- Cancela los requests en curso en la limpieza (`cleanup`) con un `abortController`.

### Mapeo de plataformas

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

Se usa la primera abreviatura de plataforma en el resultado de IGDB que se mapee a un valor conocido; en caso contrario, `'other'`.

### Cambios en `HeaderSearch`

- Reemplazar `Input.Search` con `AutoComplete` de Ant Design envolviendo un `Input` personalizado.
- La prop `options` se deriva de los resultados de `useIgdbSearch`, renderizados como nodos `label` personalizados.
- Callback `onSelect`: mapea el `IgdbGame` seleccionado a un parcial de `GameFormValues`, luego llama a una nueva prop `onGameSelect(game: IgdbGame)` pasada desde `App.tsx`.
- El spinner de carga se muestra vía `suffix` en el `Input` interno cuando `loading === true`.

### Precarga de `GameFormModal`

`GameFormModal` ya acepta una prop `game?: Game` para el modo de edición. Para la precarga desde IGDB en modo creación, se agrega una nueva prop opcional `prefill?: Partial<GameFormValues>`. Cuando se provee y `mode === 'create'`, se llama a `form.setFieldsValue(prefill)` en el `useEffect`.

### Conexión de estado en `App.tsx`

```tsx
const [igdbPrefill, setIgdbPrefill] = useState<Partial<GameFormValues> | undefined>()
const [isGameModalOpen, setIsGameModalOpen] = useState(false)

function handleIgdbSelect(game: IgdbGame) {
  setIgdbPrefill(mapIgdbToFormValues(game))
  setIsGameModalOpen(true)
}
```

`GameFormModal` se eleva de `GamesPage` a `App.tsx` para esta ruta de apertura disparada por IGDB, O se propaga un evento compartido de apertura de modal vía context. **Recomendado:** mantener `GameFormModal` dentro de `GamesPage` y agregar una ref imperativa o una nueva acción de context `openCreateModal(prefill?)` a `GamesContext`.

---

## Resumen de arquitectura

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | Renderizado condicional de la barrera de autenticación, componente inline `CollectionGatePlaceholder` |
| `src/features/auth/ui/LoginModal.tsx` | Agregar `Alert` de credenciales demo |
| `src/shared/ui/HeaderSearch.tsx` | Reemplazar `Input.Search` con `AutoComplete` + `useIgdbSearch` |
| `src/features/popular/hooks/useIgdbSearch.ts` | Hook nuevo |
| `src/features/popular/types.ts` | No requiere cambios |
| `src/features/games/ui/GamesPage.tsx` | Aceptar el disparador `openModal` desde el context o exponer una ref |
| `src/features/games/state/gamesReducer.ts` | Agregar acción `openCreateModal(prefill?)` si se elige el enfoque de context |
| `src/features/games/state/GamesContext.tsx` | Conectar la nueva acción si se elige el enfoque de context |

---

## Manejo de errores

- Los errores de búsqueda en IGDB se descartan silenciosamente — el desplegable muestra "Sin resultados" (igual que cuando está vacío).
- Si falta la URL de la portada, se muestra una caja de placeholder gris neutro.
- Si el proxy de IGDB devuelve 401/500, el desplegable muestra "Sin resultados" sin fallar.

---

## Fuera de alcance

- Login persistente (localStorage / sesión).
- Backend de autenticación real.
- Paginación de los resultados de búsqueda de IGDB.
- Hacer clic en una tarjeta de Popular Ahora para precargar el formulario.
