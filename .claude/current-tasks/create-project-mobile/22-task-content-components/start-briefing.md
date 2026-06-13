# Plan 22 — Task workspace content components (text, todo, diff bar)

**Plan 14 [Frontend] (parallel)**: Rewrite the task content editors and diff bar.

- Depends on task logic (plan 20), UI primitives (05), shared components (11). Owns `src/pages/task-workspace/components/text-content/`, `todo-content/`, `diff-bar/`. Distinct folders from plans 23/24/25/26, so it runs in parallel.

## Goal

Rewrite the editable text content, the todo list (toggle/add/reorder), and the diff approval bar for RN primitives.

## Scope / owned files

- `project-mobile/src/pages/task-workspace/components/text-content/` — editable `TextInput`-based content.
- `project-mobile/src/pages/task-workspace/components/todo-content/` — todo rows with toggle/add (uses `todo-order` util from plan 20).
- `project-mobile/src/pages/task-workspace/components/diff-bar/` — approve/reject pending diff (uses `diff-summary` util + `task-diff-store`).

## Verification

`npx tsc --noEmit` passes.
