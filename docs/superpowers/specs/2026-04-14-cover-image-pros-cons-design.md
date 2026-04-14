# Spec: Cover Image + Pros/Cons — vg-collection

**Date:** 2026-04-14  
**Status:** Approved  
**Stack:** React 19 + TypeScript strict + Vite + Ant Design 6 + Vitest

---

## Overview

Two new features:

1. **Cover image** — each game in the collection can display a cover/photo, sourced from IGDB (auto) or from the user (file upload or URL paste).
2. **Pros/Cons card** — a "Mi opinión" card on the collection game detail page listing the user's positive and negative points about the game.

Both features surface in a **new dedicated detail page** at `/coleccion/:id` (one per collection game).

---

## 1. Data Model Changes

### `Game` interface — add four optional fields

```ts
// src/shared/types/game.ts
export interface Game {
  // ...existing fields unchanged...
  coverUrl?: string      // URL string (IGDB CDN or user-pasted)
  coverBase64?: string   // base64 data-URI (user file upload)
  pros?: string          // newline-separated list of positive points
  cons?: string          // newline-separated list of negative points
}
```

**Cover resolution rule (read time):** prefer `coverBase64` → fall back to `coverUrl` → fall back to no image.

### Storage migration

`migrateStoredGame` in `gamesStorage.ts` already handles partial records via the spread pattern. Because all four new fields are optional, existing stored records are valid as-is — no active migration logic is needed. The four fields simply default to `undefined` when absent.

`isValidGame` must be updated to accept the new optional string fields (reject if present but not a string).

---

## 2. Form — Cover Image Section

**File:** `src/features/games/ui/GameFormFields.tsx`  
**Form values:** add to `GameFormValues` in `GameFormModal.tsx`:

```ts
coverUrl?: string
coverBase64?: string
pros?: string
cons?: string
```

### Cover input UI

A tab selector with two tabs labeled **"Subir archivo"** and **"Pegar URL"**, placed after the existing "Notas" field.

**Tab: Subir archivo**  
- Ant Design `Upload` component, `accept="image/*"`, single file, no server upload (`beforeUpload` returns `false`)  
- On file select: read via `FileReader.readAsDataURL`, store result in `coverBase64` form field, clear `coverUrl`  
- Shows a small preview (max 120 px tall) below the upload button when a file is selected  

**Tab: Pegar URL**  
- A plain text input bound to `coverUrl` form field, placeholder `https://...`  
- On change: clear `coverBase64`  
- Shows a small preview below the input (rendered as `<img>`) when the field is non-empty. Preview only appears if the URL looks valid (starts with `http`). No network validation.

**IGDB games:** when the form is opened in create mode with an `igdbId` prefill that also carries a `coverUrl` in the prefill object (set by the caller — e.g., the IGDB detail page — before opening the modal), `coverUrl` is pre-populated in the form. The cover tabs are still visible so the user can override if desired. The `GameFormPrefill` type must be extended to include `coverUrl?: string`.

**Edit mode:** load existing `coverUrl` and `coverBase64` from the `Game` object into the form on open.

### Pros/Cons textarea fields

Two `<textarea>` fields (Ant Design `Input.TextArea`), placed after the cover section:

- **"Puntos positivos"** — bound to `pros`, placeholder `Un punto por línea`  
- **"Puntos negativos"** — bound to `cons`, placeholder `Un punto por línea`  
- Both optional, no validation

### Form submission

`GlobalGameFormModal` in `App.tsx` (and `CollectionPage`'s local edit handler) must pass the new fields through to the `addGame` / `editGame` dispatch:

```ts
coverUrl: values.coverUrl,
coverBase64: values.coverBase64,
pros: values.pros,
cons: values.cons,
```

---

## 3. Collection Detail Page — `/coleccion/:id`

**New file:** `src/features/collection/ui/CollectionDetailPage.tsx`  
**Route:** add `<Route path="/coleccion/:id" element={<CollectionDetailPage />} />` in `App.tsx`

### Navigation

- In `CollectionPage`, each game card becomes clickable (or gets a "Ver detalle" button) that navigates to `/coleccion/:gameId`.
- The detail page has a "← Volver a mi colección" back link.

### Page layout

```
┌─────────────────────────────────────────────────────┐
│  [← Volver]                                         │
│                                                     │
│  [Cover image]   Title                              │
│                  Platform · Year · Genre            │
│                  Status badge    Rating             │
│                  [Editar] [Eliminar]                │
│                                                     │
│  ┌────────────┐  ┌──────────────────────────────┐   │
│  │ Mi opinión │  │ Notas                        │   │
│  │ (pros/cons)│  │ (free text)                  │   │
│  └────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Responsive (mobile, < md breakpoint):** single column, cover full-width at top, then header info, then "Mi opinión" card, then Notas card.

**Cover image display:**  
- Shown in the top-left area, max 200 px wide, rounded corners  
- Resolution: `coverBase64` → `coverUrl` → initials fallback (same as collection card)

**"Mi opinión" card:**  
- Only rendered if `game.pros` has at least one non-empty line OR `game.cons` has at least one non-empty line  
- Card title: "Mi opinión"  
- Section "✓ Puntos positivos" in green — only rendered if pros non-empty, renders each line as a bullet  
- Ant Design `Divider` between sections (only if both sections are rendered)  
- Section "✗ Puntos negativos" in red — only rendered if cons non-empty, renders each line as a bullet  

**Notas card:**  
- Only rendered if `game.notes` is non-empty  

**Edit / Delete:**  
- "Editar" opens the same `GameFormModal` in edit mode  
- "Eliminar" shows a confirm dialog, dispatches `removeGame`, then navigates back to `/coleccion`

---

## 4. Collection Card (CollectionPage)

- Cover image shown as the card's thumbnail: `coverBase64` → `coverUrl` → live IGDB cover (from `useCollectionCovers`) → initials fallback  
- Clicking the card (or a "Ver detalle" link) navigates to `/coleccion/:id`  
- The existing "Ver detalle" button (currently only on cards with `igdbId`) is replaced with a universal link to `/coleccion/:id`

---

## 5. Storage

No storage key change. The `migrateStoredGame` function's spread already preserves unknown fields, so new fields round-trip correctly. Only `isValidGame` needs updating for the four new optional fields.

---

## 6. Tests

- Existing 24 Vitest unit tests must continue to pass.
- `gamesStorage.test.ts` should get new cases covering:
  - Stored game with all four new fields passes `isValidGame`
  - Stored game without new fields is migrated to valid `Game` (fields are `undefined`)
  - Stored game with a non-string `pros` field is rejected by `isValidGame`

---

## 7. Out of Scope

- IGDB does not provide pros/cons data — the "Mi opinión" section is exclusively user-written.
- No image compression or size-limit warning (base64 images can be large; trade-off accepted).
- No sharing or export of the detail page.
- The existing IGDB detail page (`/juego/:id`) is not modified.
