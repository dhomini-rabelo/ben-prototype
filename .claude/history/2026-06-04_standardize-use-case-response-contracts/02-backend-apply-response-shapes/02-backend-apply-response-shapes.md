# Deep Plan — Plan 2 [Backend]: Apply standardized response shapes

## Context

Plan 1 created shared response contracts in
`project-backend/src/modules/domain/responses.ts`:

```typescript
export { type CursorPaginationResponse } from '@/modules/domain/repository/repository'

export type ItemResponse<T> = {
  item: T
}

export type ListingResponse<T> = {
  items: T[]
}
```

Today the task use cases return either a bare `Task`, a bare `Task[]`, or an ad-hoc
`{ task, benMessage }` object, and the HTTP routes serialize the presenter output at
the top level (`res.json(TaskPresenter.toHttp(task))`) or under ad-hoc keys
(`{ benMessage, task }`, `{ items }`). The `use-case-response-structure` pattern
requires a named wrapper (`item` / `items`) on every use-case `Response`, and Plan 1's
shared interfaces are the single source of truth for those wrappers.

`messages/list-messages.ts` already returns `{ items, hasMore, nextCursor }`; it only
needs to be retyped to `CursorPaginationResponse<Message>`.

The only in-codebase callers of the converted use cases are the HTTP routes
(`infra/http/routes/tasks.ts` and `infra/http/routes/messages.ts`) — confirmed via
grep, no tests or other orchestrators reference them.

## Decisions

1. **Import the shared contracts** from `@/modules/domain/responses` — never redefine
   `{ item }` / `{ items }` locally.
2. **Single-item task use cases** implement `UseCase<ItemResponse<Task>>`, build the
   task into a local `item`, and `return { item }`.
3. **`create-task-message`** keeps its extra `benMessage` field. Its `Response` extends
   the item shape: `ItemResponse<Task> & { benMessage: string }`. The field `task` is
   renamed to `item` to match the contract.
4. **`list-tasks`** implements `UseCase<ListingResponse<Task>>`, builds `items`, returns
   `{ items }`.
5. **`list-messages`** is retyped only: `Response = CursorPaginationResponse<Message>`.
   `CursorPaginationResponse` is generic (see repository.ts) so it parametrizes over
   `Message`. The runtime return is unchanged.
6. **Routes** read `result.item` / `result.items` from the use case and wrap the
   presenter output: detail/mutations emit `{ item: TaskPresenter.toHttp(result.item) }`,
   create-message emits `{ item: TaskPresenter.toHttp(result.item), benMessage }`, list
   emits `{ items: result.items.map(TaskPresenter.toListItemHttp) }`.
7. `messages.ts` already reads `result.items/hasMore/nextCursor` and emits the correct
   HTTP shape — verify-only, no change expected.

## Existing code to reuse

- `loadOwnedTask(this.taskRepository, taskId, userId)` — ownership guard, already used.
- `TaskPresenter.toHttp` / `TaskPresenter.toListItemHttp` — HTTP serializers.
- `MessagePresenter.toHttp` and `ResolveCaptureUseCase` in messages.ts — untouched.
- `CursorPaginationResponse` re-exported from `responses.ts`.

## Contracts (endpoint → use-case Response → HTTP shape)

| Use case | Use-case `Response` | HTTP body |
| --- | --- | --- |
| get-task-detail | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| finish-task | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| reopen-task | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| update-task-content | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| update-task-todos | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| approve-task-diff | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| reject-task-diff | `ItemResponse<Task>` | `{ item: TaskHttp }` |
| create-task-message | `ItemResponse<Task> & { benMessage: string }` | `{ item: TaskHttp, benMessage }` |
| list-tasks | `ListingResponse<Task>` | `{ items: TaskListItemHttp[] }` |
| list-messages | `CursorPaginationResponse<Message>` | `{ items, hasMore, nextCursor }` (unchanged) |

## Files to modify

### Single-item use cases (7)

Pattern, e.g. `get-task-detail.ts`:

```typescript
import { ItemResponse } from '@/modules/domain/responses'

export class GetTaskDetailUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const item = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    return { item }
  }
}
```

For `finish-task`, `reopen-task`, `reject-task-diff`: the update result becomes the
`item`:

```typescript
async execute(payload: Payload): Promise<ItemResponse<Task>> {
  const task = await loadOwnedTask(...)
  const item = await this.taskRepository.update(task.id, { ... })
  return { item }
}
```

For `update-task-content` and `update-task-todos`: the private `applyTextContent` /
`applyTodoItems` keep returning `Task`; `execute` wraps it:

```typescript
async execute(payload: Payload): Promise<ItemResponse<Task>> {
  const task = await loadOwnedTask(...)
  this.ensureTaskHoldsTextContent(task)
  const item = await this.applyTextContent(task, payload.textContent)
  return { item }
}
```

For `approve-task-diff`: same — capture `update(...)` into `item`, return `{ item }`.

### `create-task-message.ts`

```typescript
import { ItemResponse } from '@/modules/domain/responses'

type Response = ItemResponse<Task> & {
  benMessage: string
}

export class CreateTaskMessageUseCase implements UseCase<Response> {
  ...
  async execute(payload: Payload): Promise<Response> {
    const task = await loadOwnedTask(...)
    const reply = await this.generateAgentReply(payload, task)
    const item = await this.applyReplyToTask(task, reply)
    return { item, benMessage: reply.message }
  }
}
```

### `list-tasks.ts`

```typescript
import { ListingResponse } from '@/modules/domain/responses'

export class ListTasksUseCase implements UseCase<ListingResponse<Task>> {
  async execute(payload: Payload): Promise<ListingResponse<Task>> {
    const items = await this.taskRepository.findMany(
      { userId: payload.userId, status: this.buildStatusQuery(payload.status) },
      { orderBy: 'lastActivityAt', order: 'desc' },
    )
    return { items }
  }
}
```

### `list-messages.ts`

Replace the local `interface Response` with the shared generic contract:

```typescript
import { CursorPaginationResponse } from '@/modules/domain/responses'

type Response = CursorPaginationResponse<Message>
```

(runtime `execute` body unchanged)

### `infra/http/routes/tasks.ts`

- list handler:

```typescript
const result = await listTasksUseCase.execute({ userId: req.userId, status: query.status ?? 'active' })
return res.status(HttpStatus.OK).json({
  items: result.items.map((task) => TaskPresenter.toListItemHttp(task)),
})
```

- detail + each mutation handler:

```typescript
const result = await getTaskDetailUseCase.execute({ ... })
return res.status(HttpStatus.OK).json({ item: TaskPresenter.toHttp(result.item) })
```

- create-message handler:

```typescript
const result = await createTaskMessageUseCase.execute({ ... })
return res.status(HttpStatus.OK).json({
  item: TaskPresenter.toHttp(result.item),
  benMessage: result.benMessage,
})
```

### `infra/http/routes/messages.ts`

Verify-only. Already reads `result.items/hasMore/nextCursor` and emits
`{ items, hasMore, nextCursor }`. No change expected.

## Out of scope

`responses.ts`, `repository.ts`, all `project-web` files, auth use cases, transcription,
chat/AgentReply, and topic/capture/persist orchestration use cases.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```

Must complete with no errors. Do NOT run `npm run lint:fix`.
