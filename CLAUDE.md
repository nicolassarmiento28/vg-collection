# vg-collection

SPA en React para gestionar una colección personal de videojuegos, con
integración a la API de IGDB para enriquecer datos de juegos. Identidad
visual retro-arcade: tipografías Bebas Neue (títulos), DM Sans (cuerpo) y
JetBrains Mono (datos/código), acento rojo, dark mode por defecto (con una
paleta "Cream Arcade" propia para light mode).

## Stack

- React 19 + TypeScript
- Vite 8
- Ant Design 6
- React Router 7
- Vitest + Testing Library (unit/integración)
- Playwright (e2e)
- Recharts (gráficos del dashboard de la colección)

## Comandos

| Comando | Cuándo ejecutarlo |
|---|---|
| `npm run dev` | Levantar el servidor de desarrollo para probar cambios manualmente |
| `npm run lint` | Antes de dar por terminada cualquier tarea de código |
| `npm run test` | Antes de dar por terminada cualquier tarea de código |
| `npm run test:watch` | Mientras se itera en un test o feature específico |
| `npm run test:e2e` | Antes de cerrar tareas que tocan flujos completos de usuario (navegación, formularios, auth) |
| `npm run build` | Antes de cerrar tareas grandes o previo a un deploy, para asegurar que compila sin errores de tipos |

## Arquitectura

Organización por features en `src/features/`:

- `auth` — demo sin backend real (ver nota abajo)
- `collection` — colección de juegos del usuario (incluye import/export,
  dashboard de estadísticas y selección aleatoria de backlog)
- `games` — datos y vistas de juegos individuales
- `home` — landing/página principal
- `popular` — rankings y listados destacados (ej. Mejor Valorados)

Código compartido en `src/shared/`:

- `constants` — valores fijos de la app
- `lib` — utilidades de integración (ej. cliente IGDB)
- `state` — estado global/compartido (tema, command palette)
- `types` — tipos TypeScript compartidos
- `ui` — componentes de UI reutilizables
- `utils` — funciones utilitarias generales

`api/igdb/games.ts` — proxy serverless a la API de IGDB. Toda query a IGDB
pasa por este archivo; valida forma y longitud del body, y aplica rate
limiting básico por IP.

## Convenciones

- Texto de UI en español neutro.
- Nunca escribir colores directamente: usar las variables CSS definidas en
  `src/index.css`, manteniendo paridad entre dark y light mode.
- Preferir overridear componentes de Ant Design antes que sumar una
  librería de UI nueva.

## Notas importantes

- `src/features/auth` es una demo sin backend real. No agregar seguridad
  cosmética ahí (validaciones de "seguridad" que no protegen nada real).
- Toda query a IGDB pasa por `api/igdb/games.ts`. El input de usuario debe
  sanitizarse antes de interpolarse en la query APICalypse (ver
  `src/shared/utils/apicalypse.ts`).

## Qué no hacer

- No commitear secretos (API keys, tokens, credenciales).
- No usar `dangerouslySetInnerHTML` sin sanitizar el contenido.
- No introducir un sistema de estilos alternativo (CSS-in-JS, otra librería
  de componentes, etc.) sin que se pida explícitamente.

## Subagentes (`.claude/agents/`)

| Agente | Dominio |
|---|---|
| `orchestrator` | Coordinación de tareas multi-agente |
| `ux-ui-reviewer` | Revisión de UX/UI y consistencia de interfaz |
| `frontend-visual-designer` | Diseño visual frontend, layout y estilos |
| `theme-color-specialist` | Paleta de colores y coherencia dark/light |
| `security-auditor` | Auditoría de seguridad (incl. sanitización de queries IGDB) |
