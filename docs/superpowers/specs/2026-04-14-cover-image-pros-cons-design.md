# Spec: Imagen de portada + Pros/Contras — vg-collection

**Fecha:** 2026-04-14  
**Estado:** Aprobado  
**Stack:** React 19 + TypeScript strict + Vite + Ant Design 6 + Vitest

---

## Resumen general

Dos funcionalidades nuevas:

1. **Imagen de portada** — cada juego de la colección puede mostrar una portada/foto, obtenida de IGDB (automático) o del usuario (subida de archivo o pegado de URL).
2. **Tarjeta de Pros/Contras** — una tarjeta "Mi opinión" en la página de detalle del juego de la colección que lista los puntos positivos y negativos del usuario sobre el juego.

Ambas funcionalidades se presentan en una **nueva página de detalle dedicada** en `/coleccion/:id` (una por cada juego de la colección).

---

## 1. Cambios en el modelo de datos

### Interfaz `Game` — agregar cuatro campos opcionales

```ts
// src/shared/types/game.ts
export interface Game {
  // ...campos existentes sin cambios...
  coverUrl?: string      // cadena URL (CDN de IGDB o pegada por el usuario)
  coverBase64?: string   // data-URI en base64 (subida de archivo del usuario)
  pros?: string          // lista de puntos positivos separados por salto de línea
  cons?: string          // lista de puntos negativos separados por salto de línea
}
```

**Regla de resolución de portada (al leer):** preferir `coverBase64` → recaer en `coverUrl` → recaer en ninguna imagen.

### Migración de almacenamiento

`migrateStoredGame` en `gamesStorage.ts` ya maneja registros parciales mediante el patrón de spread. Dado que los cuatro campos nuevos son opcionales, los registros almacenados existentes son válidos tal cual — no se necesita lógica de migración activa. Los cuatro campos simplemente quedan en `undefined` por defecto cuando están ausentes.

Se debe actualizar `isValidGame` para aceptar los nuevos campos de texto opcionales (rechazar si están presentes pero no son un string).

---

## 2. Formulario — Sección de imagen de portada

**Archivo:** `src/features/games/ui/GameFormFields.tsx`  
**Valores del formulario:** agregar a `GameFormValues` en `GameFormModal.tsx`:

```ts
coverUrl?: string
coverBase64?: string
pros?: string
cons?: string
```

### UI de entrada de portada

Un selector de pestañas con dos pestañas etiquetadas **"Subir archivo"** y **"Pegar URL"**, ubicado después del campo existente "Notas".

**Pestaña: Subir archivo**  
- Componente `Upload` de Ant Design, `accept="image/*"`, archivo único, sin subida al servidor (`beforeUpload` devuelve `false`)  
- Al seleccionar un archivo: se lee vía `FileReader.readAsDataURL`, se almacena el resultado en el campo de formulario `coverBase64`, se limpia `coverUrl`  
- Muestra una pequeña vista previa (máximo 120 px de alto) debajo del botón de subida cuando se selecciona un archivo  

**Pestaña: Pegar URL**  
- Un input de texto simple vinculado al campo de formulario `coverUrl`, placeholder `https://...`  
- Al cambiar: se limpia `coverBase64`  
- Muestra una pequeña vista previa debajo del input (renderizada como `<img>`) cuando el campo no está vacío. La vista previa solo aparece si la URL parece válida (comienza con `http`). Sin validación de red.

**Juegos de IGDB:** cuando el formulario se abre en modo creación con una precarga de `igdbId` que también trae un `coverUrl` en el objeto de precarga (establecido por quien llama — por ejemplo, la página de detalle de IGDB — antes de abrir el modal), `coverUrl` queda prepoblado en el formulario. Las pestañas de portada siguen visibles para que el usuario pueda sobreescribirlo si lo desea. El tipo `GameFormPrefill` debe extenderse para incluir `coverUrl?: string`.

**Modo edición:** cargar el `coverUrl` y `coverBase64` existentes del objeto `Game` en el formulario al abrirlo.

### Campos de textarea de Pros/Contras

Dos campos `<textarea>` (`Input.TextArea` de Ant Design), ubicados después de la sección de portada:

- **"Puntos positivos"** — vinculado a `pros`, placeholder `Un punto por línea`  
- **"Puntos negativos"** — vinculado a `cons`, placeholder `Un punto por línea`  
- Ambos opcionales, sin validación

### Envío del formulario

`GlobalGameFormModal` en `App.tsx` (y el manejador de edición local de `CollectionPage`) deben pasar los campos nuevos al despacho de `addGame` / `editGame`:

```ts
coverUrl: values.coverUrl,
coverBase64: values.coverBase64,
pros: values.pros,
cons: values.cons,
```

---

## 3. Página de detalle de colección — `/coleccion/:id`

**Archivo nuevo:** `src/features/collection/ui/CollectionDetailPage.tsx`  
**Ruta:** agregar `<Route path="/coleccion/:id" element={<CollectionDetailPage />} />` en `App.tsx`

### Navegación

- En `CollectionPage`, cada tarjeta de juego se vuelve clicleable (u obtiene un botón "Ver detalle") que navega a `/coleccion/:gameId`.
- La página de detalle tiene un enlace de retorno "← Volver a mi colección".

### Layout de la página

```
┌─────────────────────────────────────────────────────┐
│  [← Volver]                                         │
│                                                     │
│  [Imagen de portada]   Título                       │
│                  Plataforma · Año · Género          │
│                  Badge de estado    Calificación    │
│                  [Editar] [Eliminar]                │
│                                                     │
│  ┌────────────┐  ┌──────────────────────────────┐   │
│  │ Mi opinión │  │ Notas                        │   │
│  │(pros/contras)│  │ (texto libre)               │   │
│  └────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Responsivo (móvil, breakpoint < md):** una sola columna, portada a ancho completo arriba, luego la información del encabezado, luego la tarjeta "Mi opinión", luego la tarjeta de Notas.

**Visualización de la imagen de portada:**  
- Se muestra en el área superior izquierda, máximo 200 px de ancho, esquinas redondeadas  
- Resolución: `coverBase64` → `coverUrl` → respaldo de iniciales (igual que la tarjeta de colección)

**Tarjeta "Mi opinión":**  
- Solo se renderiza si `game.pros` tiene al menos una línea no vacía O `game.cons` tiene al menos una línea no vacía  
- Título de la tarjeta: "Mi opinión"  
- Sección "✓ Puntos positivos" en verde — solo se renderiza si pros no está vacío, renderiza cada línea como una viñeta  
- `Divider` de Ant Design entre secciones (solo si ambas secciones se renderizan)  
- Sección "✗ Puntos negativos" en rojo — solo se renderiza si cons no está vacío, renderiza cada línea como una viñeta  

**Tarjeta de Notas:**  
- Solo se renderiza si `game.notes` no está vacío  

**Editar / Eliminar:**  
- "Editar" abre el mismo `GameFormModal` en modo edición  
- "Eliminar" muestra un diálogo de confirmación, despacha `removeGame`, y luego navega de vuelta a `/coleccion`

---

## 4. Tarjeta de colección (CollectionPage)

- La imagen de portada se muestra como miniatura de la tarjeta: `coverBase64` → `coverUrl` → portada en vivo de IGDB (desde `useCollectionCovers`) → respaldo de iniciales  
- Al hacer clic en la tarjeta (o en un enlace "Ver detalle") se navega a `/coleccion/:id`  
- El botón "Ver detalle" existente (actualmente solo en tarjetas con `igdbId`) se reemplaza por un enlace universal a `/coleccion/:id`

---

## 5. Almacenamiento

Sin cambio en la clave de almacenamiento. El spread de la función `migrateStoredGame` ya preserva campos desconocidos, así que los campos nuevos se preservan correctamente en el ida y vuelta. Solo `isValidGame` necesita actualizarse para los cuatro nuevos campos opcionales.

---

## 6. Tests

- Los 24 tests unitarios de Vitest existentes deben seguir pasando.
- `gamesStorage.test.ts` debería obtener nuevos casos que cubran:
  - Un juego almacenado con los cuatro campos nuevos pasa `isValidGame`
  - Un juego almacenado sin los campos nuevos se migra a un `Game` válido (los campos quedan en `undefined`)
  - Un juego almacenado con un campo `pros` que no es string es rechazado por `isValidGame`

---

## 7. Fuera de alcance

- IGDB no provee datos de pros/contras — la sección "Mi opinión" es exclusivamente escrita por el usuario.
- Sin compresión de imagen ni advertencia de límite de tamaño (las imágenes en base64 pueden ser grandes; se acepta el trade-off).
- Sin funcionalidad de compartir o exportar la página de detalle.
- La página de detalle de IGDB existente (`/juego/:id`) no se modifica.
