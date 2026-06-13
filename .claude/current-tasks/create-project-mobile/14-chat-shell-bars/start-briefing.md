# Plan 14 — Chat shell: empty state, top bar, top banner

**Plan 8 [Frontend] (parallel)**: Rewrite the chat empty state and top chrome.

- Depends on the chat backbone (plan 10), shared banner (plan 11), UI primitives (plan 05). Owns `src/pages/chat/components/chat-empty-state/`, `chat-top-bar/`, `chat-top-banner/`, and `suggested-action.tsx`. Distinct folders from plans 12/13/15, so it runs in parallel.

## Goal

Rewrite the empty state, the top bar (menu trigger + branding), and the top banner (connectivity / status) for RN. The menu trigger in the top bar is wired to navigation later by the menu-integration plan (plan 28).

## Scope / owned files

- `project-mobile/src/pages/chat/components/chat-empty-state/` — RN empty state (uses `brand-mark` and `suggested-action`, both owned here / by shared plans).
- `project-mobile/src/pages/chat/components/suggested-action.tsx` — RN suggested-action chip (its only consumer is the empty state, owned here).
- `project-mobile/src/pages/chat/components/chat-top-bar/` — RN top bar with a menu-trigger `IconButton` (exposes an `onOpenMenu` prop; wiring done in plan 28).
- `project-mobile/src/pages/chat/components/chat-top-banner/` — uses shared `chat-banner` + connectivity.

## Stage 3 overlap resolution

`suggested-action.tsx` was **moved into this plan** from plan 13. Grep confirmed its only consumer is `chat-empty-state` (this plan), so co-locating ownership removes the cross-parallel dependency. `active-task-peek` stays with plan 13 (consumed only inside its own `task-picker`).

## Verification

`npx tsc --noEmit` passes.
