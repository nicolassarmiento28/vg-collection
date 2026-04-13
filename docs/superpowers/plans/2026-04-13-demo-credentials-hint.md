# Demo Credentials Hint on LoginPage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a permanently visible `Alert` with the demo credentials (`demo@vg.com` / `Demo1234`) on the `LoginPage`, immediately below the "INICIAR SESION" title and above the form.

**Architecture:** Single-file presentational change — add an Ant Design `<Alert>` inside the existing card `<div>` in `LoginPage.tsx`. One new test assertion in `LoginPage.test.tsx`.

**Tech Stack:** React 19, TypeScript strict, Ant Design 5, Vitest + Testing Library

---

### Task 1: Add failing test for demo credentials hint

**Files:**
- Modify: `src/features/auth/ui/LoginPage.test.tsx`

- [ ] **Step 1: Add the failing test**

Open `src/features/auth/ui/LoginPage.test.tsx` and add this test inside the existing `describe('LoginPage', ...)` block, after the last `it(...)`:

```tsx
  it('shows demo credentials hint', () => {
    renderLoginPage()
    expect(screen.getByText('demo@vg.com')).toBeInTheDocument()
    expect(screen.getByText('Demo1234')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npm run test -- src/features/auth/ui/LoginPage.test.tsx
```

Expected: FAIL — `Unable to find an element with the text: demo@vg.com`

---

### Task 2: Implement the Alert in LoginPage

**Files:**
- Modify: `src/features/auth/ui/LoginPage.tsx`

- [ ] **Step 1: Add `Alert` to the antd import**

Change the existing import line from:

```tsx
import { Button, Form, Input, Typography } from 'antd'
```

to:

```tsx
import { Alert, Button, Form, Input, Typography } from 'antd'
```

- [ ] **Step 2: Insert the Alert between the title block and the Form**

Locate the closing `</div>` of the title block (the one that ends with `INICIAR SESION`) and insert the `<Alert>` immediately after it, before `<Form ...>`:

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

The relevant section of `LoginPage.tsx` should look like this after the edit:

```tsx
        <div
          style={{
            color: '#39ff14',
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 3,
            textAlign: 'center',
            textShadow: '0 0 10px #39ff14',
            marginBottom: 24,
            fontFamily: "'Courier New', Consolas, monospace",
          }}
        >
          INICIAR SESION
        </div>

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

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={(values) => void login(values.email, values.password)}
        >
```

- [ ] **Step 3: Run the targeted test and confirm it passes**

```bash
npm run test -- src/features/auth/ui/LoginPage.test.tsx
```

Expected: 5 tests pass (4 existing + 1 new)

- [ ] **Step 4: Run the full test suite**

```bash
npm run test
```

Expected: 74 tests pass across 19 files, 0 failures

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: no errors or warnings

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: build completes with no errors

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/ui/LoginPage.tsx src/features/auth/ui/LoginPage.test.tsx
git commit -m "feat: show demo credentials hint on LoginPage"
```
