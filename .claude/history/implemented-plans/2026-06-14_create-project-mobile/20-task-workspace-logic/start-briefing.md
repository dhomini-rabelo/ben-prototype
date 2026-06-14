# Plan 20 — Task workspace logic (stores, state, utils, hooks)

**Plan 13 [Frontend] (parallel)**: Port the task-workspace non-UI logic.

- Depends on Phase 1 foundation + auth (01–09) and data hooks (08). Owns `src/pages/task-workspace/stores/`, `states/`, `utils/`, `hooks/`. Runs in parallel with plan 21 (menu shell), which owns `src/layout/components/menu*`. Distinct trees.

## Goal

Port the task-workspace store cluster intact (Zustand, platform-agnostic): root task store, cache helpers, and the per-concern stores (chat, content, todos, diff, lifecycle), plus the page hooks and utils.

## Scope / owned files

- `project-mobile/src/pages/task-workspace/stores/` — `task-store.ts`, `task-cache.ts` (direct `queryClient` access), `task-chat-store.ts`, `task-content-store.ts`, `task-todos-store.ts`, `task-diff-store.ts`, `task-lifecycle-store.ts`.
- `project-mobile/src/pages/task-workspace/states/task-workspace-state.ts`.
- `project-mobile/src/pages/task-workspace/utils/` — `diff-summary.ts`, `todo-order.ts`.
- `project-mobile/src/pages/task-workspace/hooks/` — `use-workspace-task.ts`, `use-workspace-input.ts`.

## Verification

`npx tsc --noEmit` passes.
