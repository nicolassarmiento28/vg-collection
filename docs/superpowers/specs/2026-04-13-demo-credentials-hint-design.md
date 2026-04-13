# Spec: Demo Credentials Hint on LoginPage

**Date:** 2026-04-13
**Status:** Approved

## Summary

Add a permanently visible hint on the `LoginPage` that shows the demo account credentials (`demo@vg.com` / `Demo1234`), so users can log in without having to remember or look them up.

## Scope

Purely presentational change. No state, reducer, context, storage, or routing logic is touched.

**Files affected:**
- `src/features/auth/ui/LoginPage.tsx` — add `Alert` component
- `src/features/auth/ui/LoginPage.test.tsx` — add assertions for hint content

## Design

### Component

Use Ant Design `<Alert>` with the following props:

```tsx
<Alert
  type="info"
  showIcon
  message="Cuenta demo"
  description={
    <>
      <div>Email: demo@vg.com</div>
      <div>Contrasena: Demo1234</div>
    </>
  }
  style={{ marginBottom: 20 }}
/>
```

### Placement

Inside the existing card `<div>`, immediately after the "INICIAR SESION" title block and before the `<Form>`.

### Import

Add `Alert` to the existing `antd` named import in `LoginPage.tsx`. No new dependencies required.

## Testing

In `LoginPage.test.tsx`, add one test (or extend an existing render test) that asserts:

- The text `demo@vg.com` is present in the rendered output.
- The text `Demo1234` is present in the rendered output.

Existing tests must continue to pass without modification.

## Acceptance Criteria

- `Alert` is always visible on the login screen regardless of auth state or environment.
- `Alert` displays `demo@vg.com` and `Demo1234` clearly.
- 73 existing tests still pass.
- New test covering the hint content passes.
- `npm run lint` and `npm run build` pass with no errors.
