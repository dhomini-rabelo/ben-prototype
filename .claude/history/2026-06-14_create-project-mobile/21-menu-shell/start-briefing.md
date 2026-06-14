# Plan 21 — Menu shell (sidebar/overlay/sheet + generic list states)

**Plan 13 [Frontend] (parallel)**: Rewrite the menu container and the generic list-state components.

- Depends on UI primitives (05), menu store (07). Owns `src/layout/components/menu/` and `src/layout/components/menu-list/`. Runs in parallel with plan 20 (task logic) — distinct trees. The menu feature lists (25) and detail (26) build on these.

## Goal

Rewrite the menu container (sidebar/overlay/sheet) and the reusable list-state shell (loading/empty/error/row) for RN. The web overlay was state-driven over the page; per the analysis it can become a native sheet/modal — here build the presentational shell; the modal routing is wired in plan 28.

## Scope / owned files

- `project-mobile/src/layout/components/menu/` — `menu-sidebar.tsx`, `menu-sidebar-view.tsx`, `menu-sidebar-count-badge.tsx`, `menu-overlay.tsx`, `menu-sheet.tsx` (RN `Modal`/sheet primitives).
- `project-mobile/src/layout/components/menu-list/` — `menu-list-shell.tsx`, `menu-list-row.tsx`, `menu-list-loading.tsx`, `menu-list-empty.tsx`, `menu-list-error.tsx` (the web-feature-state-components pattern).

## Verification

`npx tsc --noEmit` passes.
