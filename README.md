# Gestor de Colección de Videojuegos

Aplicación SPA desarrollada con React para la gestión y visualización de colecciones de videojuegos retro y modernos. La aplicación permite explorar juegos populares y recientes mediante integración con la API de IGDB, visualizar el detalle de cada título y administrar colecciones personalizadas.

Incluye renderizado dinámico, manejo de estado y una interfaz moderna orientada a la organización de contenido y la navegación rápida. El proyecto cuenta con funcionalidades CRUD para crear, editar, completar y eliminar registros, importación/exportación de la colección en JSON, un dashboard de estadísticas, un command palette (Cmd/Ctrl+K) y persistencia de datos mediante localStorage.

## Stack tecnológico

- React 19 + TypeScript
- Vite 8
- Ant Design 6
- React Router 7
- Recharts (gráficos del dashboard)
- Vitest + Testing Library (tests unitarios)
- Playwright (tests E2E/responsive)

## Módulos principales

1. Inicio
- Muestra secciones de juegos mejor valorados y lanzamientos recientes.
- Consume IGDB a través del proxy de desarrollo en Vite (o del endpoint serverless en producción).

2. Búsqueda global y command palette
- Autocompletado en el header con resultados de IGDB.
- Command palette (Cmd/Ctrl+K) para buscar juegos, navegar rápido entre secciones y cambiar de tema sin usar el mouse.
- Permite navegar directo al detalle de un juego externo.

3. Detalle de juego (IGDB)
- Muestra portada, descripción, calificación, plataformas, año de lanzamiento y género.
- Botón para agregar a la colección (abre un modal de creación con datos precargados).

4. Mi colección
- Vista tipo galería con filtros por estado/plataforma y búsqueda.
- Dashboard de estadísticas: juegos por plataforma, por género, por año, y porcentaje de completado.
- Importar/exportar la colección completa como archivo JSON.
- "¿Qué juego hoy?": selecciona al azar un juego pendiente del backlog.
- Acciones por juego: editar, ver detalle, marcar como completado.
- Requiere haber iniciado sesión.

5. Detalle de juego en la colección
- Vista completa del juego guardado.
- Gestión de notas y puntos positivos/negativos.
- Permite editar y eliminar.

6. Crear juego
- Formulario manual para agregar un juego personalizado.
- Requiere haber iniciado sesión.

7. Autenticación (demo local)
- Modal de login/registro en el cliente, sin backend real.
- Usuario demo disponible para pruebas rápidas.

8. Tema visual
- Toggle de tema oscuro/claro, con paletas propias para cada modo.
- Layout responsive con menú lateral en mobile.

## Requisitos previos

- Node.js 20 o superior recomendado
- npm 9 o superior

## Configuración paso a paso

1. Clonar o abrir el proyecto
```bash
cd vg-collection
```

2. Instalar dependencias
```bash
npm install
```

3. Crear variables de entorno para IGDB

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
```

Notas:
- Estas variables las usa el proxy de Vite en desarrollo y el endpoint serverless (`api/igdb/games.ts`) en producción.
- Si no configuras estas credenciales, las secciones conectadas a IGDB pueden fallar o mostrar errores.

4. Levantar el entorno de desarrollo
```bash
npm run dev
```

5. Abrir en el navegador

Por defecto Vite inicia en:

http://localhost:5173

## Uso paso a paso de la aplicación

1. Abre la página de inicio (/)
- Revisa los carruseles de juegos populares y recientes.

2. Prueba la búsqueda global
- Escribe al menos 2 caracteres en el buscador del header, o abre el command palette con Ctrl+K (Cmd+K en Mac).
- Selecciona un resultado para abrir su detalle.

3. Inicia sesión
- Usa el botón de login.
- Credenciales demo sugeridas en el modal:
  - Email: demo@vgcollection.app
  - Contraseña: demo1234

4. Agrega un juego desde el detalle de IGDB
- En la vista de detalle, pulsa "Agregar a mi colección".
- Completa o ajusta los datos y guarda.

5. Crea un juego manual
- Ve a /crear.
- Completa el formulario y guarda.

6. Administra tu colección
- Ve a /coleccion.
- Revisa el dashboard de estadísticas en la parte superior.
- Usa los filtros de estado, plataforma y búsqueda.
- Edita juegos, márcalos como completados, o entra al detalle.
- Exporta tu colección a JSON o importa una previamente exportada.

7. Verifica la persistencia
- Recarga la página.
- Tus juegos deben mantenerse (localStorage).

## Comandos más importantes

### Desarrollo

```bash
npm run dev
```
Inicia el servidor de desarrollo con HMR.

### Build de producción

```bash
npm run build
```
Compila TypeScript y genera el build en `dist`.

### Previsualizar build

```bash
npm run preview
```
Sirve localmente el build generado.

### Linter

```bash
npm run lint
```
Ejecuta ESLint en todo el proyecto.

### Tests unitarios (Vitest)

```bash
npm run test
```
Ejecuta los tests en modo run.

### Tests unitarios en modo watch

```bash
npm run test:watch
```
Ejecuta los tests en modo interactivo/watch.

### Tests E2E (Playwright)

```bash
npm run test:e2e
```
Ejecuta las pruebas E2E/responsive usando Playwright.

Primera vez con Playwright (si aplica):
```bash
npx playwright install
```

## Estructura principal del proyecto

```text
src/
  features/
    auth/        # login/registro en el cliente (demo)
    popular/     # hooks y UI de juegos de IGDB
    home/        # página de inicio
    games/       # formularios, detalle IGDB, estado global de juegos
    collection/  # vista, detalle, import/export y dashboard de la colección
  shared/
    ui/          # layout, header search, footer, command palette, toggle de tema
    state/       # contextos globales (tema, command palette)
    lib/storage/ # persistencia en localStorage
    types/       # tipos compartidos
    utils/       # utilidades compartidas (rating, sanitización de queries)
api/
  igdb/          # proxy serverless a IGDB (producción)
e2e/             # tests end-to-end con Playwright
```

## Flujo técnico clave

1. La app inicia con proveedores globales de auth, juegos, tema y command palette.
2. El estado de juegos se carga desde localStorage.
3. Cada cambio en la colección se persiste automáticamente.
4. IGDB se consume desde el frontend contra `/api/igdb/*`.
5. En desarrollo, el proxy de Vite agrega los headers OAuth con el token de Twitch; en producción, lo hace `api/igdb/games.ts`, que además valida el body y aplica rate limiting por IP.

## Solución de problemas rápida

1. No cargan los juegos populares/recientes
- Revisa `.env.local` (Client ID y Secret).
- Reinicia `npm run dev` tras cambiar las variables.

2. No se guardan los juegos
- Verifica los permisos de localStorage en el navegador.
- Prueba en una ventana normal (no privada/estricta).

3. Falla `test:e2e` por navegadores faltantes
- Ejecuta `npx playwright install`.

## Estado actual del proyecto

- Base funcional completa para un MVP de colección, con dashboard, import/export y command palette.
- Incluye tests unitarios y pruebas E2E responsive.
- Lista para evolucionar hacia un backend real y autenticación persistente.
