# Deep Plan — Wire app.ts to per-route task files and delete grouped tasks.ts

## Context / Findings

- `app.ts` (`project-backend/src/infra/http/app.ts`) currently imports all 9 task
  handlers via a single grouped block from `@/infra/http/routes/tasks` (lines 6-16).
- All 9 per-route files already exist under
  `project-backend/src/infra/http/routes/tasks/` and each exports the expected named
  `async function` handler:
  - `approve-task-diff.ts` → `approveTaskDiff`
  - `create-task-message.ts` → `createTaskMessage`
  - `finish-task.ts` → `finishTask`
  - `get-task-detail.ts` → `getTaskDetail`
  - `list-tasks.ts` → `listTasks`
  - `reject-task-diff.ts` → `rejectTaskDiff`
  - `reopen-task.ts` → `reopenTask`
  - `update-task-content.ts` → `updateTaskContent`
  - `update-task-todos.ts` → `updateTaskTodos`
- Grep confirms the ONLY importer of `@/infra/http/routes/tasks` is `app.ts:16`.
  Deleting the old file is therefore safe.

## Steps

1. Replace the grouped import block (lines 6-16) in `app.ts` with 9 single-line,
   per-file imports, ordered to match the existing alphabetical handler order.
2. Leave every other line in `app.ts` untouched — in particular all
   `app.<method>('/tasks/...', authMiddleware, handler)` registrations, paths,
   middleware, and ordering remain exactly as-is.
3. Delete `project-backend/src/infra/http/routes/tasks.ts`.

## Verification

- `npx tsc --noEmit` in `project-backend` must pass with zero errors.
- `grep` confirms no source file still imports `@/infra/http/routes/tasks`.
- Do NOT run `npm run lint:fix` (main agent runs it once at the end).

## Out of scope

- No route path, middleware, or handler behavior changes.
- No changes to the per-route files themselves.
