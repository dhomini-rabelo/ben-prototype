# Plan 2 [Backend] (parallel): Implement notes & reminders list + detail endpoints

**Plan line:** Plan 2 · Backend · parallel
**Why it runs in parallel:** Depends only on the contract from Plan 1. It touches **only** `project-backend/` files (use cases, presenters, routes), which the frontend plan never touches — so it runs concurrently with Plan 2 Frontend with zero file overlap.

## Goal

Implement the missing HTTP endpoints so the frontend can list and open notes and reminders, matching the contract defined in Plan 1 (`docs/api-endpoints.md`):

- `GET /notes/list` → `ListingResponse<NoteListItem>`
- `GET /notes/:id/detail` → `ItemResponse<Note>`
- `GET /reminders/list` → `ListingResponse<ReminderListItem>`
- `GET /reminders/:id/detail` → `ItemResponse<Reminder>`

Tasks endpoints already exist (`GET /tasks/list`, `GET /tasks/:id/detail`) — use them as the reference pattern.

## What exists today (reference patterns to mirror)

- Use cases: `src/domain/use-cases/tasks/list-tasks.ts`, `get-task-detail.ts`
- Presenter: `src/infra/http/presenters/task-presenter.ts` (`toHttp` / `toListItemHttp`)
- Route handlers + registration: `src/infra/http/app.ts` and its controllers
- Entities: `src/domain/entities/note.ts`, `src/domain/entities/reminder.ts`
- Repositories: in-memory repositories with `findMany` / `findUnique` (cursor & pagination helpers in `src/modules/domain/`)

## Files this plan owns (project-backend only)

- New use cases under `src/domain/use-cases/captures/` (e.g. `list-notes.ts`, `get-note-detail.ts`, `list-reminders.ts`, `get-reminder-detail.ts`) — match the actual folder convention found in the codebase.
- New presenters: `src/infra/http/presenters/note-presenter.ts`, `reminder-presenter.ts`.
- New route controllers/handlers + registration in `src/infra/http/app.ts` (the 4 new routes), wired with `authMiddleware`.
- Any repository wiring needed for notes/reminders if not already injected.

## Key decisions / notes

- **Reminder `status` derivation** happens in the presenter: `"upcoming"` if `remindAt` is null or in the future, `"fired"` if in the past. Map `remindAt → firesAt`, `notes → body`, `createdAt → capturedAt`.
- **Auth scoping**: every query must be scoped to the authenticated user's id (mirror how tasks endpoints resolve the current user).
- **Detail not-found**: return the standard 404 error path used by `get-task-detail` (reuse the existing domain/HTTP error handling).
- Do NOT run `npm run lint:fix` — formatting is handled once after all parallel plans finish.
- Verify with `cd project-backend && npx tsc --noEmit`.
