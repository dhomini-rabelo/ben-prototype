# Plan 1 [Backend] (parallel) — Count-only `GET /captures/counts` endpoint

## Plan line

**Plan 1 [Backend] (parallel)**: Create a count-only `GET /captures/counts` endpoint in `project-backend` that returns only the counts the menu sidebar needs — never the full list data.

## Goal

The menu sidebar must show count badges (Tasks: "N active", Notes: total, Reminders: total) plus its own loading/error state. To avoid fetching all tasks/notes/reminders just to display a number, the backend must expose a dedicated, lightweight endpoint that returns **only counts**.

Implement a single aggregated endpoint (one request powers the whole sidebar):

```
GET /captures/counts        (auth required, same auth as the list endpoints)
200 →
{
  "tasks":     { "active": number },   // tasks with status !== 'finished'
  "notes":     { "total":  number },
  "reminders": { "total":  number }
}
```

- "tasks.active" must match the same semantics as the existing `/tasks/list` default (`status !== 'finished'`, i.e. a `NotEqualQuery({ input: 'finished' })`).
- Use the existing `repository.count(...)` method on each repository (already implemented on `InMemoryRepository`) — do **not** call `findMany` and count in memory.
- All three (`note`, `reminder`, `task`) are capture entities, so grouping under `captures/` is consistent with the existing `src/domain/use-cases/captures/` folder.

## Files this plan OWNS (project-backend only)

- New route handler under `src/infra/http/routes/` (e.g. a new `captures/` folder, or wherever most consistent with conventions).
- New use case under `src/domain/use-cases/captures/`.
- A presenter / response shape for the counts (new presenter or inline — follow existing presenter conventions).
- Route registration in `src/infra/http/app.ts` (this plan owns the single new line it adds).

This plan must **not** touch any `project-web` file. The frontend plan runs in parallel and consumes the contract above.

## Reference (existing patterns to reuse)

- Route registration: `src/infra/http/app.ts` (e.g. `app.get('/tasks/list', authMiddleware, listTasks)`).
- Route handler pattern: `src/infra/http/routes/tasks/list-tasks.ts`.
- List use cases: `src/domain/use-cases/tasks/list-tasks.ts` (status query via `NotEqualQuery`), `src/domain/use-cases/captures/list-notes.ts`, `src/domain/use-cases/captures/list-reminders.ts`.
- Repository `count()`: `src/modules/domain/repository/repository.ts` + `InMemoryRepository`.
- Repositories instances: `src/infra/http/repositories.ts` (`taskRepository`, `noteRepository`, `reminderRepository`).
- Queries: `src/modules/domain/repository/queries.ts` (`NotEqualQuery`).
- Presenters: `src/infra/http/presenters/*` and `UseCase` base in `src/modules/domain/use-case.ts`.
- Auth middleware: `src/infra/http/middlewares/auth.ts` (sets `req.userId`).
