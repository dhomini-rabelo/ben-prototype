# Use Case Response Structure Patterns

A use case never returns a bare entity or a bare array. Its `Response` is always
an object that names what it carries, so callers read `result.item` or
`result.items` instead of guessing the shape. Use these patterns whenever you
type the `Response` of a `UseCase` and what its `execute` returns.

## Use the shared response types

Do not redeclare these shapes inline — import the shared types and type the
`Response` with them. There are four canonical types:

| Type | Shape | Import from | Use for |
| --- | --- | --- | --- |
| `ItemResponse<T>` | `{ item: T }` | `@/modules/domain/responses` | create / update / patch / get of one object |
| `ListingResponse<T>` | `{ items: T[] }` | `@/modules/domain/responses` | a non-paginated listing |
| `CursorPaginationResponse<T>` | `{ items: T[]; hasMore: boolean; nextCursor: string \| null }` | `@/modules/domain/repository/repository` | cursor-based pagination |
| `PaginationResponse<T>` | `{ items: T[]; totalItems: number; page: number }` | `@/modules/domain/repository/repository` | offset / page-based pagination |

`ItemResponse` and `ListingResponse` accept any `T` (entities are class
instances). `CursorPaginationResponse` and `PaginationResponse` constrain their
type to `AnyRecord`, matching the repository pagination helpers that return them.

When the response needs extra fields alongside the item, intersect the shared
type instead of redeclaring it: `ItemResponse<Task> & { benMessage: string }`.

## Wrap a single object in `ItemResponse<T>`

- Use cases that create, update, patch, or get one specific object return it
  under an `item` key.
- The response may carry extra data alongside `item` (for example a related
  count or a flag), but the object itself always lives under `item`.

```typescript
import { ItemResponse } from '@/modules/domain/responses'

// Wrong way
async execute(payload: Payload): Promise<Task> {
  return loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)
}

// Correct way
async execute(payload: Payload): Promise<ItemResponse<Task>> {
  const item = await loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)

  return { item }
}

// Correct way — extra data alongside item
type Response = ItemResponse<Task> & {
  benMessage: string
}

async execute(payload: Payload): Promise<Response> {
  const item = await this.applyReplyToTask(task, reply)

  return { item, benMessage: reply.message }
}
```

## Return a non-paginated listing as `ListingResponse<T>`

- Use cases that list every matching row without pagination return them under
  `items`, never as a bare array.

```typescript
import { ListingResponse } from '@/modules/domain/responses'

// Wrong way
async execute(payload: Payload): Promise<Task[]> {
  return this.taskRepository.findMany(
    { userId: payload.userId },
    { orderBy: 'lastActivityAt', order: 'desc' },
  )
}

// Correct way
async execute(payload: Payload): Promise<ListingResponse<Task>> {
  const items = await this.taskRepository.findMany(
    { userId: payload.userId },
    { orderBy: 'lastActivityAt', order: 'desc' },
  )

  return { items }
}
```

## Return cursor pagination as `CursorPaginationResponse<T>`

- Paginated use cases return the page rows under `items`, a `hasMore` boolean,
  and a `nextCursor` that is a string or `null`.
- The repository's `findManyWithCursorPagination` already returns this exact
  shape, so the use case forwards it under the shared type.

```typescript
import { CursorPaginationResponse } from '@/modules/domain/repository/repository'

// Correct way
async execute(payload: Payload): Promise<CursorPaginationResponse<Message>> {
  const page = await this.messageRepository.findManyWithCursorPagination(
    { userId: payload.userId },
    { orderBy: 'createdAt', order: 'desc', limit: payload.limit ?? DEFAULT_LIMIT, cursor: payload.cursor },
  )

  return {
    items: page.items,
    hasMore: page.hasMore,
    nextCursor: page.nextCursor,
  }
}
```

## Return offset pagination as `PaginationResponse<T>`

- Page/offset-based listings return the page rows under `items`, the total row
  count under `totalItems`, and the current page under `page`.

```typescript
import { PaginationResponse } from '@/modules/domain/repository/repository'

// Correct way
async execute(payload: Payload): Promise<PaginationResponse<Task>> {
  const page = await this.taskRepository.findManyWithPagination(
    { userId: payload.userId },
    { orderBy: 'createdAt', order: 'desc', page: payload.page, limit: payload.limit },
  )

  return {
    items: page.items,
    totalItems: page.totalItems,
    page: page.page,
  }
}
```
