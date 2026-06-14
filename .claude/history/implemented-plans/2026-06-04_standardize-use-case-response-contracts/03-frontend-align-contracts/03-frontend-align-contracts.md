# Deep Plan — Plan 2 [Frontend]: Align project-web API contracts, client functions, and hooks

## Context

The backend is standardizing its HTTP response contracts (parallel plan). The
frontend `project-web` API client layer must consume the new wrapped shapes
while keeping call sites unchanged. All changes are confined to `project-web`.

Current canonical types in `src/api/types.ts`:

- `Pagination<T>` — `{ items, page, totalItems }` (legacy offset; **keep as-is**)
- `CursorPagination<T>` — `{ items, hasMore, nextCursor }` → rename to `CursorPaginationResponse<T>`
- `ItemAPIResponse<T>` — `{ item: T }` → rename to `ItemResponse<T>`
- **New:** `ListingResponse<T>` — `{ items: T[] }`

`ItemAPIResponse` has **no current importers** (grep shows only its definition),
so the rename is internal-only churn plus new adoption in `tasks.ts`.
`CursorPagination` is imported only by `use-api-cursor-paginated.ts`.

## Decisions

- **Unwrap inside `api/tasks.ts`** so hook/page callers keep receiving a plain
  `Task` (lowest churn). `sendTaskMessage` keeps returning the existing
  `TaskMessageReply` shape by mapping `{ item, benMessage }` → `{ task, benMessage }`.
- **`use-task-workspace.ts` detail fetch** routes the type through
  `useAPIRequest<ItemResponse<Task>>` and reads `.data.item` (the `getTaskDetail`
  client fn is not used by this hook — the hook uses `useAPIRequest` for its
  refetch/loading state, so we keep that and just retype + unwrap).
- **Bug fix (in-scope):** `use-task-workspace.ts` `sendMessageText` sets
  `setState({ task: reply.task, ... })`, but `WorkspaceState` has no `task`
  field — the field is `taskOverride`. This is a latent bug in the call site
  that consumes the message contract. Fix to `taskOverride: reply.task`.
- Leave `/auth/login-or-register`, `/chat`, `/transcription` untouched.

## Contracts table (endpoint → consumed shape → client return)

| Endpoint | Consumed shape | Client fn return |
|---|---|---|
| `GET /tasks/:id/detail` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/diff/approve` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/diff/reject` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/content/update` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/todos/update` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/finish` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/reopen` | `ItemResponse<Task>` | `Task` |
| `POST /tasks/:id/messages/create` | `ItemResponse<Task> & { benMessage: string }` | `TaskMessageReply` (`{ task, benMessage }`) |
| `GET /tasks/list` | `ListingResponse<TaskListItem>` | `TaskListItem[]` |
| `GET /messages/list` | `CursorPaginationResponse<Message>` | (via hook) |

## Files to modify

### `src/api/types.ts`

```ts
export interface Pagination<T> {
  items: T[];
  page: number;
  totalItems: number;
}

export interface CursorPaginationResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ItemResponse<T> {
  item: T;
}

export interface ListingResponse<T> {
  items: T[];
}
```

### `src/api/tasks.ts`

- Import `ItemResponse`, `ListingResponse` from `./types`.
- `listActiveTasks`: use `ListingResponse<TaskListItem>` instead of inline `{ items }`.
- The seven `Task`-returning fns: request `ItemResponse<Task>`, return `response.data.item`.
- `sendTaskMessage`: request `ItemResponse<Task> & { benMessage: string }`, return
  `{ task: response.data.item, benMessage: response.data.benMessage }`.

### `src/layout/hooks/use-api-cursor-paginated.ts`

Swap `CursorPagination` → `CursorPaginationResponse` (import + both generic usages).

### `src/pages/task-workspace/hooks/use-task-workspace.ts`

- `useAPIRequest<Task>` → `useAPIRequest<ItemResponse<Task>>` (import `ItemResponse`).
- `const task = state.taskOverride ?? detailState.data?.item ?? null;`
- Fix `setState({ task: reply.task })` → `taskOverride: reply.task`.

### `src/pages/chat/components/task-picker/active-task-picker.tsx`

`useAPIRequest<{ items: TaskListItem[] }>` → `useAPIRequest<ListingResponse<TaskListItem>>`
(import `ListingResponse`).

## Existing code to reuse

- `TaskMessageReply` (`src/api/models/task.ts`) — unchanged target shape for `sendTaskMessage`.
- `useAPIRequest` / `useAPICursorPaginated` hooks — only retyped, no logic change.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

No `npm run lint:fix`. No `project-backend` files touched.
