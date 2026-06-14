# Plan 1 [Frontend] (sync) — Add extended-wait state to the Login flow

## Plan line

**Plan 1 [Frontend] (sync)**: Add the extended-wait state to the Login flow — a delayed "still waiting on Google…" message that appears while the Google sign-in is pending.

## Justification

Single frontend concern. There is no backend work. The page consumes the hook's
contract, so the hook and the page are tightly coupled and must be built together in
one plan. Runs alone (sync) — there is no parallel sibling and nothing to merge
afterwards.

## Goal

Implement the `login-edge-extended-wait` state that exists in `project-design` but is
missing from `project-web`. While the Google sign-in is in its `loading` state
(waiting on the popup / redirect to resolve), after a delay the UI should reveal the
reassurance line **"still waiting on Google…"** below the button, matching the design
at `project-design/src/pages/app/login-edge-extended-wait.tsx`.

This is a minor polish over the existing login flow — it must not change the happy
path, the error path, or the permission-denied path. The extended-wait line only
appears as an additive hint after the loading state has lasted longer than a short
threshold, and disappears as soon as loading ends (success, error, or cancel).

## Files owned by this plan

- `project-web/src/layout/hooks/use-google-auth.ts` — add the delayed
  "extended wait" signal that turns on after the loading state persists past a
  threshold, and resets whenever loading starts/ends.
- `project-web/src/pages/login/page.tsx` — render the "still waiting on Google…"
  line when the extended-wait signal is active.

## Reference (source of truth)

- `project-design/src/pages/app/login-edge-extended-wait.tsx` — the target design
  (copy: "still waiting on Google…", `fade-in-up delay-200 text-secondary`).
- `project-design/src/pages/app/login-loading.tsx` — the base loading state it builds on.
