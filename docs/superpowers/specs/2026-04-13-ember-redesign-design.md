# Spec: Rediseño Ember — vg-collection

**Fecha:** 2026-04-13  
**Rama:** `main` (adiciones nuevas)  
**Estado:** Aprobado por el usuario

---

## Resumen general

Un rediseño visual completo de la aplicación `vg-collection` usando la estética "Ember": fondo carbón oscuro con acento rojo ember, tipografía cinematográfica (Bebas Neue + DM Sans), y un nuevo layout de inicio que agrega una sección de Juegos Populares alimentada por la API de IGDB, un header sticky rediseñado con búsqueda y login, y un modal de login/registro.

---

## 1. Sistema de color y tipografía

### Propiedades personalizadas de CSS (`src/index.css`)

Reemplazar todas las variables CSS existentes con:

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

Importar en `index.html` (o en `index.css` vía `@import`):
- **Bebas Neue** — encabezados de display, logo, títulos de sección, títulos de tarjetas de juego
- **DM Sans** — todo el texto de cuerpo, etiquetas de UI, botones, campos de formulario, datos de tabla
- **JetBrains Mono** — calificaciones, años, datos numéricos

### Textura de fondo

Se aplica una sutil textura de ruido basada en SVG al 3% de opacidad al elemento `body` como `background-image`. Se genera como un data URI inline o un pequeño asset estático en `public/noise.svg`. Esto agrega profundidad al fondo oscuro plano sin afectar la legibilidad.

---

## 2. Tema de Ant Design (`src/main.tsx`)

`<ConfigProvider>` recibe una prop `theme` con `algorithm: theme.darkAlgorithm` y las siguientes sobreescrituras de tokens:

| Token | Valor |
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

Estos tokens se propagan a todos los componentes de Ant Design: Table, Modal, Form, Select, Input, Button, Card, Tag. No se necesitan sobreescrituras de estilo inline por componente para el theming.

---

## 3. Header (`src/shared/ui/AppLayout.tsx`)

El header de `AppLayout` es una franja oscura sticky de 64px con tres zonas:

### Izquierda — Logo
- Wordmark "VG COLLECTION" en Bebas Neue, ~28px, color `--text-h`
- Una pequeña marca decorativa roja ember (por ejemplo, `●` o `▸`) antes del wordmark
- Al hacer clic en el logo se hace scroll hasta el inicio de la página (sin routing)

### Centro — Barra de búsqueda
- `Input.Search` de Ant Design, con forma de píldora (border-radius: 24px)
- Ancho: ~380px (flex: crece entre el logo y el botón)
- Fondo oscuro (`--bg-elevated`), borde por defecto `--border`, anillo de foco `--accent`
- Placeholder: "Buscar juegos, géneros, plataformas…"
- `onChange` despacha `setSearch` a `GamesContext` — filtra la tabla de la colección en tiempo real
- La barra de búsqueda NO está conectada a IGDB (la sección de IGDB es independiente, precargada)

### Derecha — Botón de Login
- Botón píldora con borde: borde `--accent` + color de texto `--accent` sobre fondo `--bg-surface`
- Al pasar el mouse: se rellena con fondo `--accent` y texto `--text-h` (transición 150ms)
- Texto: "Login"
- `onClick`: abre el modal de Login

### Estructura del componente Header

`AppLayout` está envuelto por `AuthProvider` en `App.tsx`. El componente `LoginButton` lee `isLoggedIn` y `user` desde `useAuthContext()` — cuando `isLoggedIn` es `true`, renderiza un avatar circular rojo con la inicial del email del usuario en lugar del botón "Login".

```
<AuthProvider>              ← envuelve toda la app en App.tsx
  <AppLayout>
    <Header sticky>
      <Logo />
      <HeaderSearch />        ← componente nuevo, despacha a GamesContext
      <LoginButton />         ← componente nuevo, lee AuthContext
    </Header>
    <Content>
      <PopularGamesSection /> ← componente nuevo
      <GamesPage />           ← existente, restilizado
    </Content>
  </AppLayout>
  <LoginModal />              ← renderizado a nivel raíz, controlado por AuthContext
</AuthProvider>
```

---

## 4. Integración con IGDB

### Acceso a la API

IGDB requiere un token OAuth de Twitch. La aplicación usa un proxy de desarrollo de Vite para evitar exponer credenciales en el bundle del navegador.

**`.env.local`** (ignorado por git):
```
VITE_IGDB_CLIENT_ID=<tu-client-id>
VITE_IGDB_CLIENT_SECRET=<tu-client-secret>
```

**`vite.config.ts`** — agregar un proxy de servidor con obtención de token completamente en el contexto del proxy de Node.js:

```ts
// vite.config.ts (contexto de Node.js — no el bundle del navegador)
// El hook configure del proxy obtiene un token OAuth de Twitch al iniciar,
// lo cachea en una variable de nivel de módulo, y lo inyecta en cada request proxeado.
// El código de React solo llama a /api/igdb/* — las credenciales nunca llegan al navegador.
server: {
  proxy: {
    '/api/igdb': {
      target: 'https://api.igdb.com/v4',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/igdb/, ''),
      configure: (proxy) => {
        let cachedToken: string | null = null

        // Obtiene el token una vez; lo cachea hasta que Vite se reinicie
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
          // El token se inyecta de forma síncrona después del primer warm-up.
          // En el primer request, cachedToken puede ser null por un breve momento;
          // los requests subsiguientes siempre tienen el token.
          getToken().then((token) => {
            proxyReq.setHeader('Client-ID', process.env.VITE_IGDB_CLIENT_ID ?? '')
            proxyReq.setHeader('Authorization', `Bearer ${token}`)
          }).catch(() => { /* falló la obtención del token; IGDB devolverá 401 */ })
        })
      },
    },
  },
}
```

> **Manejo del token**: Todo el manejo de credenciales está en `vite.config.ts` (Node.js). Ningún archivo de React lee ni almacena el Client-ID o el token de IGDB. `VITE_IGDB_CLIENT_ID` y `VITE_IGDB_CLIENT_SECRET` son cargados por Vite desde `.env.local` y están disponibles como `process.env.*` en el archivo de configuración (contexto Node) pero NO se exponen al bundle del navegador (no se referencian en ningún archivo de `src/`).

### Consulta a IGDB

Endpoint: `POST /api/igdb/games`  
Body:
```
fields name,cover.url,first_release_date,platforms.abbreviation,total_rating,total_rating_count;
where total_rating_count > 100 & cover != null;
sort total_rating desc;
limit 20;
```

Esto devuelve los 20 juegos mejor calificados con portadas. Las URLs de portada usan la API de imágenes de IGDB: reemplazar `t_thumb` por `t_cover_big` para una resolución de 264×374.

### Flujo de datos

```
PopularGamesSection
  └── hook useIgdbPopularGames()
        ├── estado: { games, loading, error }
        ├── hace fetch una vez al montar
        └── retorna { games: IgdbGame[], loading: boolean, error: string | null }
```

Interfaz `IgdbGame`:
```ts
interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number  // timestamp Unix
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
}
```

### Estados de error y carga

- **Carga**: renderizar 8 tarjetas esqueleto (mismo tamaño que las tarjetas reales, fondo `--bg-surface`, shimmer animado)
- **Error**: un mensaje de una sola línea en color `--text`: "No se pudo cargar juegos populares" — sin UI bloqueante, la colección sigue funcionando

---

## 5. Sección de Juegos Populares (`src/features/popular/`)

Nuevo directorio de feature: `src/features/popular/`

### Archivos

- `src/features/popular/ui/PopularGamesSection.tsx` — wrapper de sección con encabezado y fila de tarjetas
- `src/features/popular/ui/PopularGameCard.tsx` — tarjeta de juego individual
- `src/features/popular/hooks/useIgdbPopularGames.ts` — hook de obtención de datos
- `src/features/popular/types.ts` — interfaz `IgdbGame`

### Layout

```
<section id="popular-games">
  <h2>POPULAR AHORA</h2>          ← Bebas Neue, --text-h, letter-spacing 2px
  <div class="cards-row">         ← scroll horizontal, gap 16px, sin scrollbar
    <PopularGameCard />            ← se repite × N (u × 8 esqueletos)
  </div>
</section>
```

El `cards-row` usa `display: flex; overflow-x: auto; scroll-snap-type: x mandatory` con `scrollbar-width: none` para ocultar el scrollbar nativo.

### Diseño de la tarjeta

Dimensiones: 180px de ancho × 260px de alto  
Estructura (de arriba a abajo):
1. **Imagen de portada** — 180×240px, `object-fit: cover`, esquinas redondeadas arriba
2. **Barra de título** — franja oscura superpuesta en la parte inferior: título del juego en Bebas Neue 16px, `--text-h`

Al pasar el mouse:
- `transform: scale(1.04)` (transición 200ms ease)
- `box-shadow: 0 0 18px var(--accent-dim)` (resplandor rojo)
- La superposición del título se vuelve ligeramente más opaca

Las tarjetas no son clicleables (no hay routing a una página de detalle de juego — fuera de alcance).

---

## 6. Modal de Login / Registro (`src/features/auth/`)

Nuevo directorio de feature: `src/features/auth/`

### Archivos

- `src/features/auth/ui/LoginModal.tsx` — modal con pestañas de login + registro o vistas alternadas
- `src/features/auth/state/AuthContext.tsx` — contexto mínimo: `{ isLoggedIn: boolean, user: null | { email: string } }`
- `src/features/auth/state/authReducer.ts` — acciones: `login`, `logout`

### Diseño del modal

- `Modal` de Ant Design, `centered`, `width: 420px`
- Fondo oscuro (`--bg-surface`), acento de borde superior rojo (borde superior de 4px en `--accent`)
- **Logo** centrado en la parte superior dentro del modal
- **Dos vistas**: Login y Registro, alternadas por un enlace en el pie
- Sin pestañas — un simple toggle de estado (`'login' | 'register'`)

**Campos de la vista de Login:**
- Email (`Input`, tipo email, requerido)
- Contraseña (`Input.Password`, requerido)
- "Iniciar sesión" — botón primario de ancho completo (fondo `--accent`)
- Pie: "¿No tienes cuenta? Regístrate" — alterna a la vista de registro

**Campos de la vista de Registro:**
- Nombre de usuario (`Input`, requerido)
- Email (`Input`, tipo email, requerido)
- Contraseña (`Input.Password`, requerido)
- "Crear cuenta" — botón primario de ancho completo
- Pie: "¿Ya tienes cuenta? Inicia sesión" — alterna de vuelta a la vista de login

**Al enviar (ambas vistas):**
- Sin llamada a backend
- `dispatch({ type: 'login', payload: { email } })`
- Mostrar el mensaje de éxito de Ant Design `message.success('¡Bienvenido!')`
- Cerrar el modal
- El botón de Login del header cambia para mostrar la inicial del email del usuario en un avatar circular rojo

### Persistencia del estado de autenticación

No se persiste — `isLoggedIn` se reinicia al recargar la página (autenticación simulada). Esto está explícitamente fuera de alcance.

---

## 7. Restilizado de la colección existente

Los componentes existentes `GamesPage`, `GamesTable`, `GamesToolbar`, `GameFormModal`, y `StatusTag` **no cambian estructuralmente** — solo ajustes visuales:

- El `<Card>` envolvente en `GamesPage` usa fondo `--bg-surface` (heredado del token de ConfigProvider)
- Un encabezado de sección arriba de la tarjeta: "TU COLECCIÓN" en Bebas Neue + una pequeña marca de logo
- `GamesToolbar`: el `<Button type="primary">` de "Crear juego" hereda el rojo de ConfigProvider — no se necesita cambio
- `GamesTable`: filas oscuras del tema oscuro de ConfigProvider — no se necesita cambio
- `StatusTag`: colores actualizados para usar la paleta ember:
  - `backlog` → gris oscuro (`#3a3836`)
  - `playing` → naranja ember (`#e07a2f`)
  - `completed` → verde (`#2e7d52`)
  - `paused` → amarillo apagado (`#8a7a2f`)
  - `dropped` → rojo apagado (`#7a2e2e`)
- `GameFormModal`: hereda el tema oscuro de ConfigProvider — sin cambio estructural

---

## 8. Routing

No se agrega ninguna librería de routing. La aplicación sigue siendo de una sola página. La búsqueda del header filtra la tabla de la colección vía `GamesContext`. No hay navegación entre páginas.

---

## 9. Cambios en la estructura de archivos

### Archivos nuevos
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
      HeaderSearch.tsx        ← extraído de AppLayout
      LoginButton.tsx         ← extraído de AppLayout
public/
  noise.svg                   ← textura de fondo
.env.local                    ← credenciales de IGDB (ignorado por git)
docs/
  superpowers/
    specs/
      2026-04-13-ember-redesign-design.md
```

### Archivos modificados
```
src/index.css                 ← reemplazo completo de variables CSS + fuentes
src/main.tsx                  ← agregar tokens de tema de ConfigProvider
src/shared/ui/AppLayout.tsx   ← reescritura completa: header sticky, layout de 3 zonas
src/shared/ui/StatusTag.tsx   ← mapeo de colores actualizado
src/App.tsx                   ← envolver con AuthProvider, agregar PopularGamesSection
vite.config.ts                ← agregar proxy de IGDB con obtención de token
index.html                    ← agregar etiquetas link de Google Fonts
.gitignore                    ← asegurar que .env.local esté listado (si no lo estaba ya)
```

---

## 10. Fuera de alcance

- Autenticación real de backend
- Estado de login persistente entre recargas de página
- Hacer clic en una tarjeta de Juego Popular para ver detalles
- Routing / múltiples páginas
- Responsividad móvil (no priorizada en esta iteración)
- Tests unitarios para componentes nuevos (los tests existentes permanecen sin modificar)
