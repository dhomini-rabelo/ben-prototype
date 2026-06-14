# Plan 26 — Menu detail (note/reminder) + settings

**Plan 14 [Frontend] (parallel)**: Rewrite the menu item-detail views and the settings sheet.

- Depends on the menu shell (21), data hooks (08), `format-time` (03). Owns `src/layout/components/menu-detail/` and `src/layout/components/menu-settings/`. Distinct folders from plans 22/23/24/25, so it runs in parallel.

## Goal

Rewrite the item-detail container with its per-state components (loading/error/gone), the note and reminder detail bodies, the captured/reminder meta, and the settings view/sheet for RN. Per the analysis, detail can become a native modal — presentational here; modal routing wired in plan 28.

## Scope / owned files

- `project-mobile/src/layout/components/menu-detail/` — `item-detail-root.tsx`, `item-detail-content.tsx`, `item-detail-captured-meta.tsx`, `item-detail-reminder-meta.tsx`, `item-detail-loading.tsx`, `item-detail-error.tsx`, `item-detail-gone.tsx`, `note-detail.tsx`, `reminder-detail.tsx`.
- `project-mobile/src/layout/components/menu-settings/` — `settings-sheet.tsx`, `settings-view.tsx` (logout uses `useAuthStore.clear`).

## Verification

`npx tsc --noEmit` passes.
