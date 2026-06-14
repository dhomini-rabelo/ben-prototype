# Plan 23 — Task workspace top bar + banners

**Plan 14 [Frontend] (parallel)**: Rewrite the task-workspace top bar and banners.

- Depends on task logic (20), UI primitives (05), shared banner (11). Owns `src/pages/task-workspace/components/workspace-top-bar/`, `workspace-top-banner.tsx`, `workspace-sub-thread-banner.tsx`, `sub-thread-banner/`. Distinct folders from plans 22/24/25/26, so it runs in parallel.

## Goal

Rewrite the workspace top bar (back navigation, title, lifecycle actions) and the top/sub-thread banners for RN.

## Scope / owned files

- `project-mobile/src/pages/task-workspace/components/workspace-top-bar/`.
- `project-mobile/src/pages/task-workspace/components/workspace-top-banner.tsx`.
- `project-mobile/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`.
- `project-mobile/src/pages/task-workspace/components/sub-thread-banner/`.

## Verification

`npx tsc --noEmit` passes.
