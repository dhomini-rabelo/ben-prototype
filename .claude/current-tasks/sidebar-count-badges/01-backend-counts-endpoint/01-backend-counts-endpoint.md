# Deep Plan — Count-only `GET /captures/counts` backend endpoint

## Context

The menu sidebar needs count badges (Tasks: "N active", Notes: total, Reminders: total) without fetching full lists. This plan adds a single, lightweight, auth-protected `project-backend` endpoint that returns **only counts**, computed via each repository's `count(...)` method (no `findMany` + in-memory length).

This plan touches **only `project-backend`**. It runs in parallel with a frontend plan that consumes the contract below; it must not depend on or modify any `project-web` file. **No formatting step** (`npm run lint:fix`) is included.

The three capture entities (`task`, `note`, `reminder`) already group under `src/domain/use-cases/captures/`, so the use case, route, and presenter all live in the `captures` feature folder for consistency.

### Fixed contract (must match exactly)

`GET /captures/counts` — auth required (same `authMiddleware` as the list endpoints).

| Status | Body |
| --- | --- |
| 200 | `{ "tasks": { "active": number }, "notes": { "total": number }, "reminders": { "total": number } }` |

Where `tasks.active` = count of the authenticated user's tasks with `status !== 'finished'`, using `NotEqualQuery({ input: 'finished' })` — the same "active" semantics as the `/tasks/list` default. `notes.total` and `reminders.total` are the unfiltered per-user counts.

Auth errors, validation errors, etc. funnel through the existing `errorHandler` via `next(err)` — no error formatting in this plan.

## Decisions

1. **Endpoint path & grouping.** `GET /captures/counts`, registered alongside the other capture-domain reads in `app.ts`. The route file lives in a new `routes/captures/` folder to mirror the `use-cases/captures/` grouping (there is currently no `routes/captures/` folder — notes/reminders/tasks each have their own route folder, but counts is genuinely cross-entity and aggregated, so `captures/` is the correct home).
2. **One aggregated use case** (not three). A single `GetCapturesCountsUseCase` receives the three repositories via constructor (precedent: `ResolveCaptureUseCase` injects note/reminder/task repositories in that order). One request → one use case → all three badges.
3. **Use `repository.count(...)`** on each repository — never `findMany`. `count` is already on the `Repository` base and implemented by `InMemoryRepository` (`repository.ts:286-290`).
4. **Active-task query reuse.** Reuse `new NotEqualQuery({ input: 'finished' })` for `status`, matching `ListTasksUseCase.buildStatusQuery` (`list-tasks.ts:30-34`). Counts are scoped per user with `userId: createID(payload.userId)` (same id-typing convention as the list use cases).
5. **Response shape via `ItemResponse<T>`.** The use case returns the aggregated counts under `item` (`ItemResponse<CapturesCounts>`), consistent with the shared response-type rule — the use case never returns a bare object. A dedicated presenter maps that to the HTTP body. Because the contract is a hand-specified aggregate shape (not an entity projection), the presenter is a small stateless class typed against a plain `CapturesCounts` interface rather than `Serialize<…Props>` — `Serialize`/`WithID` apply to entity-prop projections, which this is not.
6. **`execute` decomposition.** Three counts are three distinct read responsibilities, so `execute` reads as a summary that delegates to `countActiveTasks`, `countNotes`, `countReminders` (per the use-case-structure pattern: "extract a private method for each distinct responsibility").

## Existing code to reuse (concrete)

- Route registration site: `src/infra/http/app.ts` (e.g. `app.get('/tasks/list', authMiddleware, listTasks)` at line 56; capture-domain reads at lines 66-70).
- Route-handler pattern: `src/infra/http/routes/tasks/list-tasks.ts` (module-level schema + use-case instantiation, thin `parse → execute → present`, `next(err)`).
- Use-case + active-task query: `src/domain/use-cases/tasks/list-tasks.ts` (`NotEqualQuery({ input: 'finished' })`, `createID(payload.userId)`).
- Multi-repository injection precedent: `src/domain/use-cases/captures/resolve-capture.ts` (note, reminder, task order).
- Shared repository instances: `src/infra/http/repositories.ts` (`taskRepository`, `noteRepository`, `reminderRepository`).
- `count(...)`: `src/modules/domain/repository/repository.ts` (abstract `count` at lines 89-91; in-memory impl at 286-290).
- `NotEqualQuery`: `src/modules/domain/repository/queries.ts` (lines 97-107).
- `createID`: `src/modules/domain/entity/id.ts` (line 23).
- `ItemResponse<T>`: `src/modules/domain/responses.ts`.
- `UseCase`: `src/modules/domain/use-case.ts`.
- `HttpStatus`: `src/modules/utils/http.ts` (`HttpStatus.OK`).
- `authMiddleware` (sets `req.userId`): `src/infra/http/middlewares/auth.ts`.

## Files to create

### 1. `src/domain/use-cases/captures/get-captures-counts.ts` (new)

Aggregated use case. Injects the three repositories, computes each count with `count(...)`, returns under `item`.

```typescript
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { createID } from '@/modules/domain/entity/id'
import { NotEqualQuery } from '@/modules/domain/repository/queries'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
}

export interface CapturesCounts {
  tasks: { active: number }
  notes: { total: number }
  reminders: { total: number }
}

export class GetCapturesCountsUseCase implements UseCase<
  ItemResponse<CapturesCounts>
> {
  constructor(
    private noteRepository: NoteRepository,
    private reminderRepository: ReminderRepository,
    private taskRepository: TaskRepository,
  ) {}

  async execute(payload: Payload): Promise<ItemResponse<CapturesCounts>> {
    const userId = createID(payload.userId)

    const item: CapturesCounts = {
      tasks: { active: await this.countActiveTasks(userId) },
      notes: { total: await this.countNotes(userId) },
      reminders: { total: await this.countReminders(userId) },
    }

    return { item }
  }

  private countActiveTasks(userId: ReturnType<typeof createID>): Promise<number> {
    return this.taskRepository.count({
      userId,
      status: new NotEqualQuery({ input: 'finished' }),
    })
  }

  private countNotes(userId: ReturnType<typeof createID>): Promise<number> {
    return this.noteRepository.count({ userId })
  }

  private countReminders(userId: ReturnType<typeof createID>): Promise<number> {
    return this.reminderRepository.count({ userId })
  }
}
```

Notes:
- `createID` returns an `ID` instance (the project's id-typing convention; `task.userId` etc. are `ID`-typed). Typing the private params as `ReturnType<typeof createID>` keeps them honest without importing `ID` separately; if the reviewer prefers the explicit class, `import { ID } from '@/modules/domain/entity/id'` and type as `ID` — both compile. Default to the explicit `ID` import for readability:

```typescript
import { ID, createID } from '@/modules/domain/entity/id'
// ...
private countActiveTasks(userId: ID): Promise<number> { ... }
```

- `status: new NotEqualQuery({ input: 'finished' })` is accepted by `count`'s `Partial<Complement<WithID<Props>, Query>>` param (the repository's `compare` routes `Query` values through `queryHandler`).

### 2. `src/infra/http/presenters/captures-counts-presenter.ts` (new)

Stateless presenter mapping the use-case result to the HTTP body. Typed against the `CapturesCounts` interface (the contract is an aggregate, not an entity-prop projection, so `Serialize`/`WithID` do not apply here).

```typescript
import { CapturesCounts } from '@/domain/use-cases/captures/get-captures-counts'

export class CapturesCountsPresenter {
  static toHttp(counts: CapturesCounts): CapturesCounts {
    return {
      tasks: { active: counts.tasks.active },
      notes: { total: counts.notes.total },
      reminders: { total: counts.reminders.total },
    }
  }
}
```

The explicit field-by-field rebuild (rather than returning `counts` directly) keeps the presenter the single source of the wire shape and prevents any future internal field from leaking into the response — consistent with how `TaskPresenter` rebuilds its object literal.

### 3. `src/infra/http/routes/captures/get-captures-counts.ts` (new)

Thin handler: no request body/params/query to validate (the only input is the authenticated `req.userId`), so there is no Zod schema — matching the briefing's "validate input and route errors through the existing error-handling flow" (there is no client input to validate here; `req.userId` is guaranteed by `authMiddleware`). Instantiate the use case once at module level with the shared repositories (same order as the use-case constructor).

```typescript
import { GetCapturesCountsUseCase } from '@/domain/use-cases/captures/get-captures-counts'
import { CapturesCountsPresenter } from '@/infra/http/presenters/captures-counts-presenter'
import {
  noteRepository,
  reminderRepository,
  taskRepository,
} from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const getCapturesCountsUseCase = new GetCapturesCountsUseCase(
  noteRepository,
  reminderRepository,
  taskRepository,
)

export async function getCapturesCounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getCapturesCountsUseCase.execute({
      userId: req.userId,
    })

    return res
      .status(HttpStatus.OK)
      .json(CapturesCountsPresenter.toHttp(result.item))
  } catch (err) {
    next(err)
  }
}
```

Note: the response is the bare contract object `{ tasks, notes, reminders }` (not wrapped in `{ item }`), because the fixed contract specifies the top-level shape exactly. The `{ item }` wrapper is the use-case-layer convention; the presenter/route is the boundary that produces the exact wire body.

## Files to modify

### `src/infra/http/app.ts`

Add the handler import (alphabetically among the route imports, before the `chat` import to keep the existing ordering style) and register the route alongside the other capture-domain GET reads. This plan owns **only** the import line and the single `app.get(...)` line it adds.

Import (add near the top route imports):

```typescript
import { getCapturesCounts } from '@/infra/http/routes/captures/get-captures-counts'
```

Registration — add a `captures` block grouped with the other capture reads (place it just above the `notes/reminders/tasks` read group, e.g. directly before line 56 `app.get('/tasks/list', ...)` or right after the task block; group it logically as the cross-entity capture endpoint):

```typescript
app.get('/captures/counts', authMiddleware, getCapturesCounts)
```

Recommended placement: immediately after the existing reminders block (line 70), so all capture-related reads sit together:

```typescript
app.get('/reminders/list', authMiddleware, listReminders)
app.get('/reminders/:id/detail', authMiddleware, getReminderDetail)

app.get('/captures/counts', authMiddleware, getCapturesCounts)   // new
```

`errorHandler` stays mounted last (line 72) — unchanged.

## Response shape table (final wire contract)

| Field | Type | Source |
| --- | --- | --- |
| `tasks.active` | `number` | `taskRepository.count({ userId, status: NotEqualQuery({ input: 'finished' }) })` |
| `notes.total` | `number` | `noteRepository.count({ userId })` |
| `reminders.total` | `number` | `reminderRepository.count({ userId })` |

HTTP status: `200` (`HttpStatus.OK`). Auth failures produce the standard auth error via `authMiddleware` → `errorHandler` (unchanged behavior).

## Impact on other flows

- No existing route, use case, presenter, or repository is modified — all three new files are additive, and `app.ts` only gains one import + one registration line.
- No shared repository state changes (`repositories.ts` already exports the three instances; the new use case reuses them, so counts reflect the same data the list endpoints serve).
- No `project-web` files touched; the frontend plan consumes the contract independently.

## Verification

1. **Type-check** (no formatting):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
   ```

   Expect no errors. Key things the compiler validates: `count(...)` accepts `{ userId, status: NotEqualQuery }`; `ItemResponse<CapturesCounts>` matches the use-case return; the presenter return matches `CapturesCounts`; the handler imports resolve.

2. **Route smoke test** (with the dev server running and a valid auth pair):

   ```bash
   curl -s -X GET http://localhost:3000/captures/counts \
     -H 'jwtauthenticationtoken: <valid-jwt>' \
     -H 'providerauthenticationtoken: <valid-provider-token>'
   ```

   Expect `200` and a body shaped exactly `{ "tasks": { "active": N }, "notes": { "total": N }, "reminders": { "total": N } }`. (Adjust the port/host to the actual `server.ts` config.)

3. **Active-task semantics check.** Confirm `tasks.active` equals the length of `GET /tasks/list` with the default (`status=active`) filter for the same user — both must exclude only `finished` tasks (i.e. `created` + `active` count toward "active").

4. **Error path.** Call the endpoint without the auth headers and confirm it returns the same auth error the other protected reads return (routed through `errorHandler`), proving auth is enforced and no error is formatted inside the new handler.

## Out of scope / explicitly not done

- No `npm run lint:fix` (per task instructions).
- No `project-web` changes.
- No new repository method (the existing `count` covers every need).
- No request schema (the endpoint has no client-supplied input beyond the authenticated user).
