# HTTP Presenter Patterns

How to write a presenter in `project-backend` (`src/infra/http/presenters/{entity}-presenter.ts`). A presenter maps a domain entity to the JSON shape sent over HTTP, keeping serialization out of use-cases and route handlers.

## Use a stateless class with static methods

- A presenter is a class with only `static` methods and no instance state.
- Expose `toHttp` for the full/detail shape and `toListItemHttp` for the lighter listing projection. Extract nested conversions into `private static` helpers.

```typescript
// Correct way
export class TaskPresenter {
  static toHttp(task: Task) {
    return {
      id: task.id.toValue(),
      title: task.props.title,
      pendingDiff: TaskPresenter.pendingDiffToHttp(task.props.pendingDiff),
      createdAt: task.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(task: Task) {
    return {
      id: task.id.toValue(),
      title: task.props.title,
      hasPendingDiff: task.props.pendingDiff !== null,
    }
  }

  private static pendingDiffToHttp(pendingDiff: PendingDiff | null) {
    // ...
  }
}
```

## Type the return shape from the entity props

- Always derive the return type from the entity props with the shared `Serialize` and `WithID` helpers (imported from `@/modules/domain/types`), never a separate hand-maintained DTO interface. `Serialize<...>` converts `ID`/`Date` to `string`, and `WithID<Props>` adds the serialized `id`.
- Serialize values at the boundary: `id.toValue()` for ids, `.toISOString()` for dates.

```typescript
import { Serialize, WithID } from '@/modules/domain/types'
```

## Always shape with `Omit`, never `Pick`

- Shape the exposed fields with `Omit` (list what is hidden), not `Pick` (list what is shown). `Omit` keeps every other prop in the return type, so **adding a new prop to the entity raises a type error in the presenter** until you serialize it or explicitly omit it. `Pick` would silently drop the new field and ship an incomplete response.
- When a field's serialized type differs from `Serialize<Props>` (e.g. a nested object with its own presenter), wrap the type with `OverWrite` instead of dropping it.

```typescript
// Wrong way — Pick lets new props slip through unnoticed
static toListItemHttp(
  task: Task,
): Pick<Serialize<WithID<TaskProps>>, 'id' | 'title' | 'status'> {}

// Correct way — Omit forces every new prop to be handled
static toHttp(
  task: Task,
): OverWrite<
  Omit<Serialize<WithID<TaskProps>>, 'userId' | 'messageId'>,
  { pendingDiff: Serialize<PendingDiff> | null }
> {}

static toListItemHttp(
  task: Task,
): Omit<
  Serialize<WithID<TaskProps>>,
  'userId' | 'messageId' | 'textContent' | 'todoItems' | 'pendingDiff' | 'summary' | 'finishedAt'
> & { hasPendingDiff: boolean } {}
```
