# VG Collection

SPA en React para gestionar una colección personal de videojuegos, con
integración a la API de IGDB para explorar catálogo, buscar títulos y
enriquecer datos. Identidad visual retro-arcade, con dark mode por defecto
y una paleta "Cream Arcade" propia para light mode.

<!-- TODO: agregar screenshot o GIF de la app acá, por ejemplo public/screenshot.png -->

## Features

**Exploración y búsqueda**
- Home con secciones de juegos mejor valorados y lanzamientos recientes (IGDB).
- Búsqueda global en el header con autocompletado.
- Command palette (`Ctrl`/`Cmd` + `K`) para buscar juegos, navegar entre secciones y cambiar de tema sin usar el mouse.
- Vista de detalle de juego IGDB (portada, descripción, rating, plataformas, año, género).

**Mi colección**
- Colección personal con filtros por estado, plataforma y búsqueda.
- Alta manual de juegos o desde el detalle de un título de IGDB (con datos precargados).
- Edición, notas y puntos positivos/negativos por juego, marcado como completado.
- Dashboard de estadísticas: distribución por plataforma, género, año y porcentaje de completado.
- Importar/exportar la colección completa como archivo JSON.

**Productividad**
- "¿Qué juego hoy?": elige al azar un juego pendiente del backlog.
- Toggle de tema oscuro/claro con paleta propia por modo.
- Autenticación demo en el cliente (sin backend real, ver `CLAUDE.md`).

## Stack tecnológico

- [React](https://react.dev/) 19.2 + TypeScript 6
- [Vite](https://vite.dev/) 8
- [Ant Design](https://ant.design/) 6.3
- [React Router](https://reactrouter.com/) 7.14
- [Recharts](https://recharts.org/) 3.9 (gráficos del dashboard)
- [Vitest](https://vitest.dev/) 4.1 + Testing Library (tests unitarios/integración)
- [Playwright](https://playwright.dev/) 1.59 (tests E2E)
- Proxy serverless propio (`api/igdb/games.ts`) que intermedia todas las consultas a IGDB, valida el body y aplica rate limiting básico por IP.

## Arquitectura del proyecto

```text
src/
  features/
    auth/        # login/registro demo en el cliente, sin backend real
    collection/  # colección del usuario: vista, detalle, dashboard, import/export
    games/       # formularios, detalle de juego IGDB, estado global de juegos
    home/        # página de inicio
    popular/     # hooks y UI de juegos populares/recientes de IGDB
  shared/
    constants/   # valores fijos de la app
    lib/         # utilidades de integración (storage, etc.)
    state/       # estado global (tema, command palette)
    types/       # tipos TypeScript compartidos
    ui/          # layout, header search, footer, command palette, theme toggle
    utils/       # utilidades generales
api/
  igdb/          # proxy serverless a IGDB (producción)
e2e/             # tests end-to-end con Playwright
```

Más detalle de convenciones y reglas del proyecto en [`CLAUDE.md`](./CLAUDE.md).

## Cómo correrlo localmente

**Requisitos:** Node.js 20 o superior, npm 9 o superior.

```bash
git clone <url-del-repo>
cd vg-collection
npm install
```

Crear un archivo `.env.local` en la raíz con las credenciales de IGDB/Twitch:

```env
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
```

Estas variables las usa el proxy de Vite en desarrollo y el endpoint serverless
(`api/igdb/games.ts`) en producción. Sin ellas, las secciones conectadas a
IGDB fallan o no muestran datos.

```bash
npm run dev
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Type-check + build de producción (`dist`) |
| `npm run preview` | Sirve localmente el build generado |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run test` | Tests unitarios (Vitest) en modo run |
| `npm run test:watch` | Tests unitarios en modo watch |
| `npm run test:e2e` | Tests E2E (Playwright) |

## Testing

El proyecto tiene tests unitarios y de integración con Vitest + Testing
Library (`npm run test`), y tests E2E con Playwright (`npm run test:e2e`,
requiere `npx playwright install` la primera vez).

## Uso de Claude Code

El repo incluye un [`CLAUDE.md`](./CLAUDE.md) con contexto de arquitectura,
convenciones y comandos para que agentes de IA trabajen sobre el código, más
subagentes especializados en `.claude/agents/`:

- **orchestrator** — coordina tareas que abarcan más de un dominio (UX, diseño visual, theming, seguridad).
- **ux-ui-reviewer** — revisa estados de carga, vacíos, error y accesibilidad en componentes y flujos de usuario.
- **frontend-visual-designer** — refuerza la identidad visual retro-arcade en vistas y componentes.
- **theme-color-specialist** — mantiene coherencia de paleta y contraste entre dark y light mode.
- **security-auditor** — audita el proxy de IGDB, el flujo de auth demo y la persistencia local antes de deploys.

## Deploy

Desplegado en [Vercel](https://vercel.com/).

## Licencia / autor

© 2026 Nicolás Sarmiento. Todos los derechos reservados.
