# Plan 13 — Chat task picker + suggestions + active-task peek

**Plan 8 [Frontend] (parallel)**: Rewrite the chat task-picker and auxiliary inline widgets.

- Depends on the chat backbone (plan 10), data hooks (plan 08), UI primitives (plan 05). Owns `src/pages/chat/components/task-picker/` and `active-task-peek.tsx`. Distinct folders from plans 12/14/15, so it runs in parallel.

## Goal

Rewrite the task-picker (select an active task to attach a message to) and the active-task peek for RN.

## Scope / owned files

- `project-mobile/src/pages/chat/components/task-picker/` — RN list/sheet of active tasks (uses `useTaskListData`); `task-picker/active-task-picker.tsx` consumes `active-task-peek` (both owned here, no cross-plan dependency).
- `project-mobile/src/pages/chat/components/active-task-peek.tsx`.

## Stage 3 overlap resolution

`suggested-action.tsx` was reassigned **out** of this plan to plan 14 (`14-chat-shell-bars`), because its only consumer is `chat-empty-state` (owned by plan 14). This removes the cross-parallel dependency.

## Verification

`npx tsc --noEmit` passes.
