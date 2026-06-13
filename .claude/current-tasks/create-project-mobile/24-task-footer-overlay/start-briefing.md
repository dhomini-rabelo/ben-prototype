# Plan 24 — Task workspace footer + done overlay

**Plan 14 [Frontend] (parallel)**: Rewrite the task-workspace footer and done overlay.

- Depends on task logic (20), shared `chat-input` (11), UI primitives (05). Owns `src/pages/task-workspace/components/workspace-footer/` and `workspace-done-overlay/`. Distinct folders from plans 22/23/25/26, so it runs in parallel.

## Goal

Rewrite the in-task chat footer (sends messages to the task via `task-chat-store`) and the "task done" overlay for RN. The voice record affordance here mirrors the chat footer's pattern; voice wiring for the task footer registers the task transcript handler at page assembly (plan 27).

## Scope / owned files

- `project-mobile/src/pages/task-workspace/components/workspace-footer/` — composes `chat-input`, send button, record button (exposes `onStartRecording` prop; wired at page assembly).
- `project-mobile/src/pages/task-workspace/components/workspace-done-overlay/`.

## Verification

`npx tsc --noEmit` passes.
