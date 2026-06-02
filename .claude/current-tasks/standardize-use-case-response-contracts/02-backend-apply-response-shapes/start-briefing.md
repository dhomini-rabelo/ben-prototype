# Plan 2 [Backend] (parallel): Apply standardized response shapes across backend use cases and HTTP layer

**Plan line:** Plan 2 [Backend] (parallel)

## Goal

Update the backend use cases (and the HTTP routes that serialize them) to return the standardized response shapes using the shared interfaces created in Plan 1. Runs in parallel with Plan 2 [Frontend]; it touches only backend files and never frontend files.

## Depends on

- Plan 1 [Backend]: imports `ItemResponse`, `ListingResponse`, `CursorPaginationResponse` from `project-backend/src/modules/domain/responses.ts`.

## Scope — exact conversions

### `{ item }` via `ItemResponse<T>` (use case Response + route wrapping)

- `tasks/get-task-detail.ts` → `ItemResponse<Task>`
- `tasks/finish-task.ts` → `ItemResponse<Task>`
- `tasks/reopen-task.ts` → `ItemResponse<Task>`
- `tasks/update-task-content.ts` → `ItemResponse<Task>`
- `tasks/update-task-todos.ts` → `ItemResponse<Task>`
- `tasks/approve-task-diff.ts` → `ItemResponse<Task>`
- `tasks/reject-task-diff.ts` → `ItemResponse<Task>`
- `tasks/create-task-message.ts` → `{ item: Task; benMessage: string }` (item with extra data; can extend `ItemResponse<Task>`)

### `{ items }` via `ListingResponse<T>`

- `tasks/list-tasks.ts` → `ListingResponse<Task>`

### Cursor pagination — retype only (shape already correct)

- `messages/list-messages.ts` → type `Response` as `CursorPaginationResponse<Message>`

### HTTP routes (serialization layer)

- `infra/http/routes/tasks.ts`:
  - detail + all task mutation handlers: wrap presenter output as `{ item: TaskPresenter.toHttp(result.item) }`
  - create-message handler: `{ item: TaskPresenter.toHttp(result.item), benMessage: result.benMessage }`
  - list handler: read `result.items` then `{ items: result.items.map(TaskPresenter.toListItemHttp) }`
- `infra/http/routes/messages.ts`: list-messages route already emits `{ items, hasMore, nextCursor }` — verify it still compiles against the retyped use case; minimal/no change expected.

## Out of scope (keep as-is)

`auth/login-or-register.ts`, `auth/verify-authentication.ts`, `transcription/transcribe-audio.ts`, the chat route / `AgentReply` presenter, and all topic/capture/persist orchestration use cases (`persist-user-message`, `persist-ben-message`, `persist-captures`, `resolve-capture`, `build-topic-index`, `get-history-context`, `persist-topic-summaries`). They are protocol/composite responses or internal-only and are not part of this standardization.

## Files owned by this plan

- `project-backend/src/domain/use-cases/tasks/*.ts` (the 9 listed)
- `project-backend/src/domain/use-cases/messages/list-messages.ts`
- `project-backend/src/infra/http/routes/tasks.ts`
- `project-backend/src/infra/http/routes/messages.ts`

## Constraints

- Do not touch frontend (`project-web`) files.
- Do not edit `responses.ts` (owned by Plan 1) or `repository.ts`.
- Update every internal caller of the changed use cases (e.g. routes) so the project compiles. Check for any in-codebase callers of the task use cases beyond routes.
- Do not run `npm run lint:fix`.
