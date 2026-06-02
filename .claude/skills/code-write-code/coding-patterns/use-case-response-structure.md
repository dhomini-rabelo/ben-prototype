# Use Case Response Structure Patterns

A use case never returns a bare entity or a bare array. Its `Response` is always
an object that names what it carries, so callers read `result.item` or
`result.items` instead of guessing the shape. Use these patterns whenever you
type the `Response` of a `UseCase` and what its `execute` returns.

## Wrap a single object in `{ item }`

- Use cases that create, update, patch, or get one specific object return it
  under an `item` key.
- The response may carry extra data alongside `item` (for example a related
  count or a flag), but the object itself always lives under `item`.

```typescript
// Wrong way
async execute(payload: Payload): Promise<Task> {
  return loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)
}

// Correct way
interface Response {
  item: Task
}

async execute(payload: Payload): Promise<Response> {
  const item = await loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)

  return { item }
}

// Correct way — extra data alongside item
interface Response {
  item: Task
  pendingDiffCount: number
}

async execute(payload: Payload): Promise<Response> {
  const item = await loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)

  return { item, pendingDiffCount: item.props.diffs.length }
}
```

## Return cursor pagination as `{ items, hasMore, nextCursor }`

- Paginated use cases return the page rows under `items`, a `hasMore` boolean,
  and a `nextCursor` that is a string or `null`.

```typescript
// Correct way
interface Response {
  items: Message[]
  hasMore: boolean
  nextCursor: string | null
}

async execute(payload: Payload): Promise<Response> {
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

## Return a non-paginated listing as `{ items }`

- Use cases that list every matching row without pagination return them under
  `items`, never as a bare array.

```typescript
// Wrong way
async execute(payload: Payload): Promise<Task[]> {
  return this.taskRepository.findMany(
    { userId: payload.userId },
    { orderBy: 'lastActivityAt', order: 'desc' },
  )
}

// Correct way
interface Response {
  items: Task[]
}

async execute(payload: Payload): Promise<Response> {
  const items = await this.taskRepository.findMany(
    { userId: payload.userId },
    { orderBy: 'lastActivityAt', order: 'desc' },
  )

  return { items }
}
```
