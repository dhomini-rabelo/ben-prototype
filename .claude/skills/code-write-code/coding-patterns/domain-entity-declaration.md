# Domain Entity Declaration Patterns

How to declare a domain entity in `project-backend`. Use these patterns whenever you add or refactor an entity under `src/domain/entities/`.

## Extend the domain base class with a typed Props

- An entity extends `Entity<Props>` (or `AggregateRoot<Props>` for an aggregate root) parameterized by its props type.
- Declare the props as an exported `interface` (or `type`) named `{Entity}Props`, and export the value/union types the props reference alongside it.

```typescript
// Correct way
export type TaskStatus = 'created' | 'active' | 'finished'

export interface TaskProps {
  userId: ID
  title: string
  status: TaskStatus
  createdAt: Date
}

export class Task extends Entity<TaskProps> {
  // ...
}
```

## Expose `create` and `reference` static factories

- Every entity declares two static factory methods. `create(props)` builds a new instance (a fresh `ID` is generated). `reference(id, props)` rebuilds an instance from an existing `ID` (reconstructing a persisted record).
- Do not instantiate entities with `new` from outside the entity; always go through these factories.

```typescript
// Wrong way
export class Task extends Entity<TaskProps> {}
const task = new Task(props) // bypasses the factory contract

// Correct way
export class Task extends Entity<TaskProps> {
  static create(props: TaskProps) {
    return new Task(props)
  }

  static reference(id: ID, props: TaskProps) {
    return new Task(props, id)
  }
}

const task = Task.create(props)
const persisted = Task.reference(id, props)
```

## Type id-bearing props as `ID`, not `string`

- Foreign keys and identifiers in props use the `ID` value class, not raw strings, so identity semantics are preserved through the domain.

```typescript
// Wrong way
export interface TaskProps {
  userId: string
  messageId: string | null
}

// Correct way
export interface TaskProps {
  userId: ID
  messageId: ID | null
}
```
