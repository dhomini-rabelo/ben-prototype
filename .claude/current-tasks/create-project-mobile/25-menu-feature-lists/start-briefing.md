# Plan 25 — Menu feature lists (tasks, notes, reminders)

**Plan 14 [Frontend] (parallel)**: Rewrite the menu's per-entity list views.

- Depends on the menu shell (plan 21), data hooks (08), `format-time` (03). Owns `src/layout/components/menu-tasks/`, `menu-notes/`, `menu-reminders/`. Distinct folders from plans 22/23/24/26, so it runs in parallel.

## Goal

Rewrite the three entity list views (tasks/notes/reminders) using the menu-list shell (plan 21) and the data hooks, for RN.

## Scope / owned files

- `project-mobile/src/layout/components/menu-tasks/` — `menu-tasks-view.tsx`, `menu-tasks-list.tsx` (uses `useTaskListData`).
- `project-mobile/src/layout/components/menu-notes/` — `menu-notes-view.tsx`, `menu-notes-list.tsx` (uses `useNoteListData`).
- `project-mobile/src/layout/components/menu-reminders/` — `menu-reminders-view.tsx`, `menu-reminders-list.tsx` (uses `useReminderListData`; `firesAtRelative` for display).

## Verification

`npx tsc --noEmit` passes.
