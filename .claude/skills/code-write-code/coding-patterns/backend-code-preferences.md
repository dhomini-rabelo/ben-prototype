# Back-end Code Preferences

Preferences for `project-backend`, captured from review corrections. They complement the focused back-end patterns; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [general](./general-code-preferences.md) and [front-end](./frontend-code-preferences.md) preferences.

## Domain folder boundaries

- Repository implementations belong in the **infra** layer, never in `domain`.
- `domain/use-cases` holds **use-case classes only**.
- Shared helpers go to `domain/utils`; shared validation goes to `domain/validation`.
- Folders are grouped by **subject**, and the subject is normally an entity name.
- Decompose a large use-case into small, single-responsibility helper functions.

## One use-case, one responsibility

A use-case file that does two things should be two use-cases. Each implements the shared use-case interface (`src/modules/domain/use-case.ts`).

## Enforce ownership with a compound repository query, not per-entity loaders

```typescript
// Wrong way — a dedicated loader per entity
loadOwnedNote(noteId, userId)
loadOwnedTask(taskId, userId)

// Correct way — the repository get double-queries id + ownership
repository.get({ id: createID(payload.itemId), userId: createID(payload.userId) })
```

## Request/Response contract types live in `api/contracts/`

Contract types are declared under `api/contracts/` and named with `RequestData` / `ResponseData` suffixes.

```typescript
// Correct way
export interface CreateTaskRequestData { ... }
export interface CreateTaskResponseData { ... }
```

## Type HTTP presenters via `Serialize`/`WithID` and `Omit`

Type presenter responses from the entity props with `Serialize` / `WithID` from `@/modules/domain/types`, and use `Omit` (not `Pick`) so adding a new entity field raises a type error that forces it into the serializer.

```typescript
// Wrong way — Pick silently ignores new fields
type TaskHttp = Pick<Serialize<TaskProps>, 'id' | 'title'>

// Correct way — Omit forces new fields to be handled
type TaskHttp = Omit<WithID<Serialize<TaskProps>>, 'internalToken'>
```
