# Spec: Modo claro/oscuro + Layout responsivo + Tests de viewport con Playwright

**Fecha:** 2026-04-14  
**Estado:** Aprobado

---

## Resumen general

Agregar un toggle de tema claro/oscuro (persistido en localStorage) y hacer que la app sea completamente responsiva en móvil, tablet y escritorio. El modo oscuro se mantiene idéntico al diseño actual. Agregar una suite de tests E2E con Playwright que valide la correctitud del layout en cada breakpoint.

---

## Sección 1: Sistema de temas

### Arquitectura

**Enfoque:** React Context + atributo `data-theme` en `<html>` + propiedades personalizadas de CSS.

- `ThemeContext` lee la clave `'vg-theme'` de `localStorage` al iniciar (por defecto: `'dark'`).
- Al alternar: establece `document.documentElement.setAttribute('data-theme', theme)` y escribe en `localStorage`.
- Exporta `useTheme(): { theme: 'dark' | 'light', toggleTheme: () => void }`.
- `ThemeProvider` envuelve la app en `main.tsx` por encima de `ConfigProvider`.

### Variables CSS (`src/index.css`)

El tema oscuro (actual `:root`) obtiene una variable que faltaba:
```css
--text-muted: #6b6560;
```

Se agrega un bloque de sobreescritura para el tema claro:
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
  /* --accent: #e03c2f sin cambios — igual en ambos temas */
}
```

### ConfigProvider de Ant Design (`src/main.tsx`)

`ConfigProvider` se mueve a un componente hijo `ThemedConfigProvider` que consume `useTheme()`:

- Oscuro → `theme.darkAlgorithm` + tokens actuales (sin cambios)
- Claro → `theme.defaultAlgorithm` + tokens equivalentes para el modo claro:
  - `colorBgContainer: '#ffffff'`
  - `colorBgElevated: '#eae6e1'`
  - `colorBorder: '#d4cfc9'`
  - `colorText: '#3a3530'`
  - `colorTextHeading: '#1a1714'`
  - `colorPrimary: '#e03c2f'` (sin cambios)

### UI del toggle

- Ubicación: header de `AppLayout`, entre `HeaderSearch` y `LoginButton`.
- Componente: botón `ThemeToggle` usando `SunOutlined` (modo claro activo) / `MoonOutlined` (modo oscuro activo) de `@ant-design/icons`.
- Estilo: botón solo con ícono, color `var(--text-muted)`, sin fondo, área táctil de 36×36px.
- Etiqueta aria: `"Cambiar a modo claro"` / `"Cambiar a modo oscuro"`.

### Archivos nuevos

- `src/shared/state/ThemeContext.tsx` — context + provider + hook
- `src/shared/ui/ThemeToggle.tsx` — componente de botón de toggle

### Archivos modificados

- `src/index.css` — agregar `--text-muted` a `:root`, agregar bloque de tema claro
- `src/main.tsx` — envolver con `ThemeProvider`, extraer `ThemedConfigProvider`
- `src/shared/ui/AppLayout.tsx` — agregar `ThemeToggle` al header

---

## Sección 2: Layout responsivo

### Breakpoints

| Nombre | Rango       | Dispositivos                    |
|------|-------------|---------------------------------|
| xs   | < 480px     | iPhone SE, Android chico        |
| sm   | 480–767px   | iPhone 14, Pixel 7              |
| md   | 768–1023px  | iPad Mini, iPad Air             |
| lg   | ≥ 1024px    | Escritorio (comportamiento actual) |

Los breakpoints se definen como custom media de CSS o bloques `@media` inline. La detección de breakpoint en JS usa el hook `Grid.useBreakpoint()` de Ant Design donde se necesita ramificación de lógica.

### AppLayout — Header

**lg (≥ 1024px):** el layout actual no cambia.

**md (768–1023px):**
- Tamaño de fuente del logo: 22px (antes 28px).
- Los enlaces de navegación siguen visibles.
- La búsqueda sigue visible pero con `max-width: 220px`.

**xs/sm (< 768px):**
- El texto del logo se oculta, solo se muestra el ícono `▸` (ahorra espacio).
- Los enlaces de navegación se ocultan.
- Aparece un botón hamburguesa (`MenuOutlined`) en el extremo derecho.
- Al hacer clic en la hamburguesa se abre un `Drawer` de Ant Design desde la izquierda con: logo, enlaces de navegación (Inicio / Mi Colección / Crear Juego), ThemeToggle, LoginButton.
- La búsqueda del header se oculta en xs/sm (la búsqueda está disponible dentro del drawer o vía el input a nivel de página en CollectionPage).
- Altura del header: 56px (antes 64px) en xs/sm.

### CollectionPage

- Input de búsqueda: `max-width: 400px` en lg → `width: 100%` en xs/sm.
- Grupos de chips de plataforma: en xs/sm cada fila de grupo se convierte en `overflow-x: auto; flex-wrap: nowrap` (scroll horizontal por grupo), para que los chips no se apilen en una pared de texto.
- Grid de juegos: `minmax(180px, 1fr)` en lg → `minmax(140px, 1fr)` en xs → `minmax(160px, 1fr)` en sm/md.

### GameFormModal

- `width` del modal: por defecto (520px) en lg → `95vw` en xs/sm.

### CreateGamePage / GameDetailPage / HomePage

- `padding` del contenido: `24px` en lg → `12px 16px` en xs/sm.
- Contenedores de formulario / detalle con `maxWidth` fijo: pasan a `width: 100%` en xs/sm.

### Estrategia de implementación

- Reglas globales de espaciado y padding en `src/index.css` vía bloques `@media`.
- Sobreescrituras responsivas por componente inline vía props `style` condicionadas a `useBreakpoint()` donde CSS por sí solo no es suficiente (por ejemplo, la visibilidad del toggle del drawer).
- Preferir media queries de CSS sobre JS donde sea posible para evitar parpadeo (flicker) del layout.

---

## Sección 3: Tests de viewport/breakpoint con Playwright

### Configuración

- Instalar `@playwright/test` como devDependency.
- Agregar `"test:e2e": "playwright test"` a los scripts de `package.json`.
- Los tests viven en el directorio `e2e/` (separado de `src/test/` de Vitest).
- Archivo de configuración: `playwright.config.ts` en la raíz del proyecto.

### playwright.config.ts

```ts
baseURL: 'http://localhost:5173'
webServer: { command: 'npm run dev', port: 5173, reuseExistingServer: true }
projects: uno por dispositivo (ver tabla abajo)
testDir: './e2e'
```

### Dispositivos probados

| Nombre de proyecto  | Preset de dispositivo | Viewport    |
|---------------|----------------------|-------------|
| mobile-se     | iPhone SE            | 375×667     |
| mobile-14     | iPhone 14            | 390×844     |
| mobile-pixel  | Pixel 7              | 412×915     |
| tablet-mini   | iPad Mini            | 768×1024    |
| tablet-pro    | iPad Pro 11          | 834×1194    |
| desktop       | (personalizado)      | 1280×800    |
| desktop-hd    | (personalizado)      | 1920×1080   |

### Archivo de test: `e2e/responsive.spec.ts`

Para cada dispositivo, los tests corren contra `/` y `/coleccion`. Aserciones:

1. **Sin overflow horizontal** — `body.scrollWidth <= window.innerWidth`.
2. **Logo presente** — el carácter de acento `▸` es visible en el header.
3. **Navegación accesible:**
   - xs/sm: el botón hamburguesa (`role="button"`, nombre que coincida con "menú" o `MenuOutlined`) es visible; los enlaces de navegación NO son visibles en el header.
   - md/lg: los enlaces de navegación ("Inicio", "Mi Colección") son directamente visibles en el header.
4. **Toggle de tema presente** — existe un botón con aria-label que coincida con "modo" en el header (o en el drawer en xs/sm).
5. **El toggle de tema funciona** — al hacer clic cambia el atributo `html[data-theme]`.
6. **Columnas de la grilla de CollectionPage** — en xs: al menos 2 tarjetas entran por fila; en lg: al menos 4.

### Ejecutar los tests

```bash
npm run test:e2e          # todos los dispositivos
npx playwright test --project=mobile-14   # un solo dispositivo
npx playwright show-report               # reporte HTML
```

Los tests de Vitest se mantienen sin cambios: `npm test` (24 pasando).

---

## Resumen de archivos

### Archivos nuevos
| Archivo | Propósito |
|------|---------|
| `src/shared/state/ThemeContext.tsx` | Context de tema, provider, hook |
| `src/shared/ui/ThemeToggle.tsx` | Botón de ícono sol/luna |
| `playwright.config.ts` | Configuración de Playwright |
| `e2e/responsive.spec.ts` | Tests E2E de viewport/breakpoint |

### Archivos modificados
| Archivo | Cambio |
|------|--------|
| `src/index.css` | Agregar `--text-muted` al tema oscuro, agregar bloque de tema claro, agregar reglas globales responsivas |
| `src/main.tsx` | Agregar `ThemeProvider`, extraer `ThemedConfigProvider` |
| `src/shared/ui/AppLayout.tsx` | Agregar `ThemeToggle`, menú hamburguesa + Drawer para xs/sm |
| `src/features/collection/ui/CollectionPage.tsx` | Ancho de búsqueda responsivo, scroll de chips, breakpoints de grilla |
| `src/features/games/ui/GameFormModal.tsx` | Ancho de modal responsivo |
| `src/features/games/ui/CreateGamePage.tsx` | Padding/ancho responsivo |
| `src/features/games/ui/GameDetailPage.tsx` | Padding/ancho responsivo |
| `src/features/home/ui/HomePage.tsx` | Padding responsivo |
| `package.json` | Agregar script `test:e2e` |

---

## Verificación

```bash
npx tsc --noEmit                          # cero errores
npx vitest run --exclude ".worktrees/**"  # 24 pasados
npm run test:e2e                          # todos los tests de viewport pasan
```
