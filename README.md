# VG Collection

Aplicacion web para gestionar tu coleccion de videojuegos retro y modernos.

Permite explorar juegos populares/recientes desde IGDB, ver detalle de cada juego, agregarlos a tu coleccion y administrarlos (crear, editar, completar, eliminar), con persistencia en localStorage.

## Stack Tecnologico

- React 19 + TypeScript
- Vite 8
- Ant Design 6
- React Router 7
- Vitest + Testing Library (tests unitarios)
- Playwright (tests E2E/responsive)

## Aplicaciones o Modulos Principales

1. Inicio
- Muestra secciones de juegos mejor valorados y lanzamientos recientes.
- Consume IGDB a traves del proxy de desarrollo en Vite.

2. Busqueda global
- Autocompletado en header con resultados de IGDB.
- Permite navegar directo al detalle de un juego externo.

3. Detalle de juego (IGDB)
- Muestra portada, descripcion, rating, plataformas, lanzamiento y genero.
- Boton para agregar a la coleccion (abre modal de creacion con datos precargados).

4. Mi coleccion
- Vista tipo galeria con filtros por estado/plataforma y busqueda.
- Acciones por juego: editar, ver detalle, marcar completado.
- Requiere iniciar sesion.

5. Detalle de juego en coleccion
- Vista completa del juego guardado.
- Gestion de notas, puntos positivos/negativos.
- Permite editar y eliminar.

6. Crear juego
- Formulario manual para agregar un juego personalizado.
- Requiere iniciar sesion.

7. Autenticacion (demo local)
- Modal de login/registro en cliente.
- Usuario demo disponible para pruebas rapidas.

8. Tema visual
- Toggle de tema oscuro/claro.
- Layout responsive con menu lateral en mobile.

## Requisitos Previos

- Node.js 20 o superior recomendado
- npm 9 o superior

## Configuracion Paso a Paso

1. Clonar o abrir proyecto
```bash
cd vg-collection
```

2. Instalar dependencias
```bash
npm install
```

3. Crear variables de entorno para IGDB

Crea un archivo .env.local en la raiz del proyecto con:

```env
TWITCH_CLIENT_ID=tu_client_id
TWITCH_CLIENT_SECRET=tu_client_secret
```

Notas:
- Estas variables las usa el proxy de Vite en servidor de desarrollo.
- Si no configuras estas credenciales, las secciones conectadas a IGDB pueden fallar o mostrar errores.

4. Levantar entorno de desarrollo
```bash
npm run dev
```

5. Abrir en navegador

Por defecto Vite inicia en:

http://localhost:5173

## Uso Paso a Paso de la Aplicacion

1. Abre la pagina de inicio (/)
- Revisa carruseles de juegos populares y recientes.

2. Prueba la busqueda global
- Escribe al menos 2 caracteres en el buscador del header.
- Selecciona un resultado para abrir su detalle.

3. Inicia sesion
- Usa el boton de login.
- Credenciales demo sugeridas en el modal:
  - Email: demo@vgcollection.app
  - Password: demo1234

4. Agrega un juego desde detalle IGDB
- En la vista detalle, pulsa Agregar a mi coleccion.
- Completa o ajusta datos y guarda.

5. Crea un juego manual
- Ve a /crear.
- Completa formulario y guarda.

6. Administra tu coleccion
- Ve a /coleccion.
- Usa filtros de estado, plataforma y busqueda.
- Edita juegos, marcalos como completados o entra al detalle.

7. Verifica persistencia
- Recarga la pagina.
- Tus juegos deben mantenerse (localStorage).

## Comandos Mas Importantes

### Desarrollo

```bash
npm run dev
```
Inicia servidor de desarrollo con HMR.

### Build de produccion

```bash
npm run build
```
Compila TypeScript y genera build en dist.

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
Ejecuta tests en modo run.

### Tests unitarios en modo watch

```bash
npm run test:watch
```
Ejecuta tests en modo interactivo/watch.

### Tests E2E (Playwright)

```bash
npm run test:e2e
```
Ejecuta pruebas E2E/responsive usando Playwright.

Primera vez con Playwright (si aplica):
```bash
npx playwright install
```

## Estructura Principal del Proyecto

```text
src/
  features/
    auth/        # login/registro en cliente
    popular/     # hooks y UI de juegos de IGDB
    home/        # pagina de inicio
    games/       # formularios, detalle IGDB, estado global de juegos
    collection/  # vista y detalle de coleccion
  shared/
    ui/          # layout, header search, footer, toggle tema
    lib/storage/ # persistencia localStorage
    types/       # tipos compartidos
```

## Flujo Tecnico Clave

1. La app inicia con proveedores globales de auth y juegos.
2. El estado de juegos se carga desde localStorage.
3. Cada cambio en coleccion se persiste automaticamente.
4. IGDB se consume desde frontend contra /api/igdb/*.
5. Vite proxy agrega headers OAuth con token de Twitch en desarrollo.

## Solucion de Problemas Rapida

1. No cargan juegos populares/recientes
- Revisa .env.local (Client ID y Secret).
- Reinicia npm run dev tras cambiar variables.

2. No se guardan juegos
- Verifica permisos de localStorage en el navegador.
- Prueba en ventana normal (no privada/estricta).

3. Falla test:e2e por navegadores
- Ejecuta npx playwright install.

## Estado Actual del Proyecto

- Base funcional completa para MVP de coleccion.
- Incluye tests unitarios y pruebas E2E responsive.
- Lista para evolucionar hacia backend real y autenticacion persistente.
