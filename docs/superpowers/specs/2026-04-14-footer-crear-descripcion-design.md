# Spec: Footer, Página Crear Juego y Descripción en GameDetail

**Fecha:** 2026-04-14  
**Estado:** Aprobado

---

## Resumen

Tres mejoras independientes a `vg-collection`:

1. **Footer global** con texto de copyright en `AppLayout`.
2. **Nueva ruta `/crear`** con formulario inline para agregar videojuegos, accesible desde el nav.
3. **Título "Descripción"** encima del `summary` del juego en `GameDetailPage`.

---

## Feature 1: Footer

### Qué

Agregar un footer persistente en todas las páginas con el texto:
> © 2026 Nicolás Sarmiento. Todos los derechos reservados.

### Dónde

`src/shared/ui/AppLayout.tsx` — actualmente usa `const { Header, Content } = Layout` sin `Footer`.

### Diseño

- Nuevo componente `src/shared/ui/AppFooter.tsx`.
- Usa `Layout.Footer` de Ant Design.
- Estilo:
  - `background: var(--bg-surface)`
  - `borderTop: '1px solid var(--border)'`
  - `textAlign: 'center'`
  - `color: var(--text-muted)`
  - `fontSize: 12`
  - `padding: '16px 24px'`
- `AppLayout` destruye `Footer` de `Layout` y lo renderiza después de `<Content>`.

### Archivos afectados

- `src/shared/ui/AppFooter.tsx` — nuevo
- `src/shared/ui/AppLayout.tsx` — importa y usa `AppFooter`

---

## Feature 2: Página Crear Juego (`/crear`)

### Qué

Una página dedicada en `/crear` con el mismo formulario de creación de videojuegos que ya existe en `GameFormModal`, pero renderizado directamente como página (sin modal). Accesible desde el nav header al lado de "Mi Colección".

### Enfoque: Extraer `GameFormFields`

Para evitar duplicar la lógica de los campos, se extrae el conjunto de `Form.Item` a un componente reutilizable:

```
src/features/games/ui/GameFormFields.tsx
```

`GameFormFields` recibe opcionalmente las mismas props que necesite (ninguna o `formInstance` si se necesita). Es un componente presentacional puro: solo renderiza los campos `Form.Item`. No tiene estado propio.

`GameFormModal` refactorizado para usar `GameFormFields` internamente — sin cambio de comportamiento externo.

### Nueva página

`src/features/games/ui/CreateGamePage.tsx`:

- Título de página: "Crear Juego"
- `Form` de Ant Design con `layout="vertical"`, `Form.useForm()`.
- Renderiza `<GameFormFields />` dentro del form.
- Botón "Guardar juego" (tipo `primary`) al final del form.
- Al submit válido:
  1. Genera nuevo `id` con `uuidv4()`.
  2. Llama `dispatch({ type: 'addGame', payload: { ...values, id } })`.
  3. Navega a `/coleccion` con `navigate('/coleccion')`.
- El campo `igdbId` no se muestra (no aplica en creación manual).
- Auth-gate: si el usuario no está logueado, mostrar placeholder con botón de login (igual al patrón de `CollectionPage`).

### Navegación

`AppLayout.tsx` — agregar `NavLink` al nav:

```
Inicio  |  Mi Colección  |  Crear Juego
```

Ruta en `App.tsx`:
```tsx
<Route path="/crear" element={<CreateGamePage />} />
```

### Archivos afectados

- `src/features/games/ui/GameFormFields.tsx` — nuevo
- `src/features/games/ui/GameFormModal.tsx` — usa `GameFormFields` (refactor interno)
- `src/features/games/ui/CreateGamePage.tsx` — nuevo
- `src/App.tsx` — nueva ruta `/crear`
- `src/shared/ui/AppLayout.tsx` — nuevo NavLink "Crear Juego"

---

## Feature 3: Título "Descripción" en GameDetailPage

### Qué

Cuando `game.summary` existe, mostrar un label "DESCRIPCIÓN" encima del párrafo de texto, con el mismo estilo tipográfico que los demás labels de la UI.

### Dónde

`src/features/games/ui/GameDetailPage.tsx` líneas 219-232.

### Diseño

```tsx
{game.summary && (
  <div style={{ marginBottom: 28, marginTop: 0 }}>
    <div style={{
      fontSize: 11,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    }}>
      Descripción
    </div>
    <p style={{
      color: 'var(--text)',
      fontSize: 15,
      lineHeight: 1.7,
      margin: 0,
    }}>
      {game.summary}
    </p>
  </div>
)}
```

### Archivos afectados

- `src/features/games/ui/GameDetailPage.tsx` — modifica el bloque de summary

---

## Consideraciones de Testing

- Los tests existentes en `GameFormModal.test.tsx` deben seguir pasando después del refactor de `GameFormFields`.
- No se requieren tests nuevos para el footer (componente puramente visual sin lógica).
- `CreateGamePage` podría tener un test básico de render, pero no es obligatorio para este spec.
- `npx tsc --noEmit` debe pasar en todo momento.
- `npx vitest run --exclude ".worktrees/**"` debe seguir en 24 passed.

---

## Archivos nuevos

| Archivo | Descripción |
|---|---|
| `src/shared/ui/AppFooter.tsx` | Componente de footer con copyright |
| `src/features/games/ui/GameFormFields.tsx` | Campos del formulario extraídos para reutilización |
| `src/features/games/ui/CreateGamePage.tsx` | Página de creación de juego en ruta `/crear` |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/shared/ui/AppLayout.tsx` | Añadir `AppFooter` + NavLink "Crear Juego" |
| `src/App.tsx` | Añadir ruta `/crear` |
| `src/features/games/ui/GameFormModal.tsx` | Usar `GameFormFields` internamente |
| `src/features/games/ui/GameDetailPage.tsx` | Añadir label "Descripción" |
