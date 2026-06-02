# Plan 2 [Frontend] (parallel): Align project-web API contracts, client functions, and hooks to the new response shapes

**Plan line:** Plan 2 [Frontend] (parallel)

## Goal

Align the `project-web` API client layer to the new backend HTTP contracts. Runs in parallel with Plan 2 [Backend]; it touches only `project-web` files. The new contract shapes are fully known (below), so this plan does not depend on backend files.

## New HTTP contracts the frontend must consume

| Endpoint | New response shape |
|---|---|
| `GET /tasks/:id/detail` | `{ item: Task }` |
| `POST /tasks/:id/diff/approve` | `{ item: Task }` |
| `POST /tasks/:id/diff/reject` | `{ item: Task }` |
| `POST /tasks/:id/content/update` | `{ item: Task }` |
| `POST /tasks/:id/todos/update` | `{ item: Task }` |
| `POST /tasks/:id/finish` | `{ item: Task }` |
| `POST /tasks/:id/reopen` | `{ item: Task }` |
| `POST /tasks/:id/messages/create` | `{ item: Task; benMessage: string }` |
| `GET /tasks/list` | `{ items: TaskListItem[] }` (already aligned) |
| `GET /messages/list` | `{ items, hasMore, nextCursor }` (already aligned) |

Unchanged endpoints: `/auth/login-or-register`, `/chat`, `/transcription` keep their current custom shapes.

## What to do

### Canonical shared interfaces in `src/api/types.ts`

Establish the canonical names matching the backend convention. Current file has `ItemAPIResponse<T>`, `CursorPagination<T>`, `Pagination<T>`.

- `ItemResponse<T>` → `{ item: T }` (rename from `ItemAPIResponse`)
- `ListingResponse<T>` → `{ items: T[] }` (new)
- `CursorPaginationResponse<T>` → `{ items: T[]; hasMore: boolean; nextCursor: string | null }` (rename from `CursorPagination`)
- Leave the legacy offset `Pagination<T>` as-is unless unused-rename is trivial.

### API client functions in `src/api/tasks.ts`

- `getTaskDetail`, `approveTaskDiff`, `rejectTaskDiff`, `updateTaskContent`, `updateTaskTodos`, `finishTask`, `reopenTask`: request `ItemResponse<Task>` and return `response.data.item` so call sites keep receiving a `Task`.
- `sendTaskMessage` (create message): request `{ item: Task; benMessage: string }` (use `ItemResponse<Task> & { benMessage: string }`); map to the existing `TaskMessageReply` shape (`{ task, benMessage }`) so its callers don't change, OR update its caller — pick the lower-churn option and keep it consistent.

### Hooks / direct consumers

- `src/layout/hooks/use-api-cursor-paginated.ts`: switch the generic type from `CursorPagination` to `CursorPaginationResponse`.
- `src/pages/task-workspace/hooks/use-task-workspace.ts`: the task detail is fetched via `useAPIRequest<Task>({ url: detail(taskId) })`; update to `useAPIRequest<ItemResponse<Task>>` and read `.data.item` (or route the fetch through `getTaskDetail` from `api/tasks.ts`). Keep the resulting `task` value a `Task`.
- `src/pages/chat/components/task-picker/active-task-picker.tsx`: retype `useAPIRequest<{ items: TaskListItem[] }>` to `useAPIRequest<ListingResponse<TaskListItem>>` (shape unchanged).

## Files owned by this plan (all under `project-web`)

- `src/api/types.ts`
- `src/api/tasks.ts`
- `src/layout/hooks/use-api-cursor-paginated.ts`
- `src/pages/task-workspace/hooks/use-task-workspace.ts`
- `src/pages/chat/components/task-picker/active-task-picker.tsx`
- Any other `project-web` consumer that breaks from the rename — search and fix within `project-web` only.

## Constraints

- Do not touch backend (`project-backend`) files.
- Keep call sites working: prefer unwrapping inside `api/tasks.ts` so page/hook code that expects a `Task` keeps working.
- Do not run `npm run lint:fix`.
