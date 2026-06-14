# Plan 1 [Frontend] (sync) — Add the extended-wait state to the Login flow

## Context

`project-web`'s Login flow already renders an `idle → loading → (success | denied | error)`
state machine, driven by `useGoogleAuth` and consumed by the `Login` page. While the
Google sign-in is pending (`isLoading === true`) the button shows `"Signing in..."` and
is disabled — but there is no equivalent of the `login-edge-extended-wait` design, which
reveals a reassurance line **"still waiting on Google…"** below the button after the wait
has lasted a noticeable amount of time.

This plan adds that extended-wait signal. It is purely additive UI polish:

- It only fires **while** the sign-in is in its `loading` state.
- It appears **only after a short delay** (so a fast sign-in never flashes the line).
- It **resets** when a new attempt starts and when loading ends — for any reason
  (success/navigation, error, or user cancel / permission-denied).
- It does **not** touch the happy path, the error path, or the permission-denied path.

The design we are matching (`project-design/src/pages/app/login-edge-extended-wait.tsx`)
renders the reassurance line as a `Typography` directly under the button:

```tsx
<Typography
  variant="body-md"
  className="fade-in-up delay-200 text-secondary"
>
  still waiting on Google…
</Typography>
```

Note: the design is a static mock that also changes the button to the disabled
`"Redirecting…"` pulse variant. In `project-web` the **button is owned by the existing
loading path** (`{isLoading ? "Signing in..." : "Continue with Google"}`) and is out of
scope — this plan must NOT change that path. We only add the reassurance line as an
additive sibling of the existing button, gated by the new signal. We reuse the design's
exact copy (`"still waiting on Google…"`) and styling (`body-md`, `fade-in-up delay-200
text-secondary`).

## Decisions

1. **Where the signal lives — in the hook, not the page.** The briefing assigns the
   "track how long loading has lasted + reset on lifecycle" responsibility to
   `use-google-auth.ts`, and the page only renders. This matches the project's
   single-responsibility rule (a hook owns one concern; the page just reads the
   already-computed booleans like `isLoading`, `isPermissionDenied`). The hook exposes a
   new boolean `isExtendedWait`; the page renders the line when it is `true`.

2. **Derive the timer from the existing `loading` status — do not add a second source of
   truth.** The hook already knows it is loading via `state.status === 'loading'`. A
   `useEffect` keyed on that boolean is the natural trigger: it runs when loading starts,
   its cleanup runs when loading ends or a new attempt begins. This is exactly the pattern
   used by `use-elapsed-timer.ts` (effect gated on `isRunning`, `setInterval`, cleanup
   clears the timer and resets the state to `0`). We use `setTimeout` (single flip) instead
   of `setInterval`.

3. **Reset semantics come for free from the effect lifecycle.** Because the effect depends
   on `isLoading`:
   - New attempt: `signIn()` sets status back to `'loading'`. If it was already loading the
     dependency does not change, but a fresh attempt from a terminal state (`error`/`denied`)
     re-runs the effect → cleanup resets `isExtendedWait` to `false` and a new timer starts.
   - Loading ends (success → navigate, or `setState` to `error`/`denied`): `isLoading`
     flips to `false`, the cleanup runs → timer cleared and `isExtendedWait` reset to
     `false`. No leftover timer can flip the signal after loading is over.

4. **Delay threshold: `4000ms` (4 seconds).** There is no existing constant for this in the
   codebase, so we choose a sensible default. Rationale: a Google popup/redirect that
   resolves normally completes well under a couple of seconds, so 4s reliably avoids a flash
   on the happy path while still reassuring a genuinely-stalled user reasonably quickly. We
   express it as a named module-level constant `EXTENDED_WAIT_DELAY_MS` (mirroring the
   existing `COOKIE_MAX_AGE_DAYS` module-level constant style in the same file).

5. **No new files.** The change fits entirely inside the two owned files. The timer logic is
   small and specific to this hook's `loading` lifecycle, so it stays inline in
   `use-google-auth.ts` rather than being extracted into a shared hook (it is not reused
   elsewhere). This respects "do not over-split" / keep it where it is used.

## Existing Code to Reuse

- **`use-elapsed-timer.ts` pattern** (`src/pages/chat/hooks/use-elapsed-timer.ts`): the
  `useEffect(() => { if (!isRunning) return; const t = setTimer(...); return () =>
  { clearTimer(t); resetState(); } }, [isRunning])` shape — copied structurally with
  `setTimeout` instead of `setInterval`.
- **`COOKIE_MAX_AGE_DAYS`** module-level constant in `use-google-auth.ts` — the convention
  for the new `EXTENDED_WAIT_DELAY_MS` constant.
- **`Typography`** primitive already imported in `page.tsx` — reused with the design's
  `variant="body-md"` and `className="fade-in-up delay-200 text-secondary"`.
- The existing `isLoading` boolean already returned by the hook is the trigger; we do not
  introduce a parallel loading flag.

## Files to Modify

### 1. `project-web/src/layout/hooks/use-google-auth.ts`

**a. Add `useEffect` to the React import.**

```ts
// before
import { useState } from 'react'
// after
import { useEffect, useState } from 'react'
```

**b. Add the delay constant** next to the existing `COOKIE_MAX_AGE_DAYS`.

```ts
const COOKIE_MAX_AGE_DAYS = 5

const EXTENDED_WAIT_DELAY_MS = 4000
```

**c. Add the extended-wait state and its lifecycle effect** inside `useGoogleAuth`, after
the existing `state` declaration. `isLoading` is derived once and reused by both the effect
and the return value.

```ts
export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    status: 'idle',
    error: '',
  })
  const [isExtendedWait, setIsExtendedWait] = useState(false)
  const navigate = useNavigate()

  const isLoading = state.status === 'loading'

  useEffect(() => {
    if (!isLoading) {
      return
    }

    const timeout = setTimeout(() => {
      setIsExtendedWait(true)
    }, EXTENDED_WAIT_DELAY_MS)

    return () => {
      clearTimeout(timeout)
      setIsExtendedWait(false)
    }
  }, [isLoading])

  // ... signIn() unchanged ...
```

**d. Expose `isExtendedWait`** from the return object, reusing the derived `isLoading`.

```ts
  return {
    signIn,
    isLoading,
    isExtendedWait,
    isPermissionDenied: state.status === 'denied',
    error: state.error,
  }
}
```

The `signIn` function body is **unchanged** — the happy/error/denied branches stay exactly
as they are. The effect's cleanup handles all reset cases because every terminal transition
flips `state.status` away from `'loading'`, which flips `isLoading` to `false`.

### 2. `project-web/src/pages/login/page.tsx`

**a. Read the new flag from the hook.**

```tsx
// before
const { signIn, isLoading, isPermissionDenied, error } = useGoogleAuth();
// after
const { signIn, isLoading, isExtendedWait, isPermissionDenied, error } =
  useGoogleAuth();
```

**b. Render the reassurance line as an additive sibling directly under the button**, inside
the existing `<div className="fade-in-up delay-200 flex w-full flex-col gap-3">` block, after
the `<Button>`. It only renders when `isExtendedWait` is `true` (which can only be true while
loading, per the hook). The button itself is left untouched.

```tsx
          <Button className="w-full" onClick={signIn} disabled={isLoading}>
            <GoogleIcon className="size-5 opacity-90 transition-opacity group-hover:opacity-100" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
          {isExtendedWait && (
            <Typography
              variant="body-md"
              className="fade-in-up delay-200 text-secondary"
            >
              still waiting on Google…
            </Typography>
          )}
```

No other part of `page.tsx` changes — the permission-denied block, the error block, and the
footer are all left exactly as they are.

## Cross-flow Impact

- **Happy path:** unchanged. A normal sign-in resolves and `navigate(ROUTES.chat)` runs well
  before `4000ms`, so `isExtendedWait` never turns on; even if it did, navigation unmounts the
  page. The effect cleanup also resets the flag on the status transition.
- **Error path:** unchanged. On failure `setState({ status: 'error', ... })` flips `isLoading`
  to `false` → cleanup clears the timer and resets `isExtendedWait`; the existing `error`
  Typography renders as before.
- **Permission-denied / cancel path:** unchanged. `setState({ status: 'denied', ... })` flips
  `isLoading` to `false` → same cleanup; the existing `role="status"` block renders as before.
- **Re-attempt after a terminal state:** clicking the button again sets status to `'loading'`,
  re-running the effect from a clean `isExtendedWait === false` with a fresh timer.
- **The line never appears outside the pending state**, because `isExtendedWait` can only be
  set to `true` inside the effect branch that requires `isLoading === true`, and is reset to
  `false` by the cleanup the instant loading ends.

## Contracts

The hook's return shape gains one additive field; no existing field changes:

```ts
{
  signIn: () => Promise<void>
  isLoading: boolean
  isExtendedWait: boolean   // NEW — true only while loading has exceeded EXTENDED_WAIT_DELAY_MS
  isPermissionDenied: boolean
  error: string
}
```

`use-google-auth.ts` is consumed only by `login/page.tsx` (the file this plan also owns), so
there is no other call site to update.

## Verification

From `project-web`:

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Manual reasoning checks (no test infra in this project):

- `isExtendedWait` starts `false`; only the timeout sets it `true`, only while `isLoading`.
- Every exit from `loading` (success, error, denied) flips `isLoading` to `false`, whose
  effect cleanup clears the timeout and resets `isExtendedWait` to `false`.
- The login page renders the line only when `isExtendedWait` is `true`, below the existing
  button, with the design's copy and `body-md` / `fade-in-up delay-200 text-secondary` styling.

Formatting (`npm run lint:fix`) is intentionally **not** part of this plan — it is run once
after all plans finish.
