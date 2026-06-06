# Plan 2 [Backend] (parallel): Notes & Reminders list + detail endpoints — SIMPLE

## Objective

Implement 4 authenticated, user-scoped read endpoints in `project-backend`, mirroring the
existing tasks endpoints:

- `GET /notes/list` → `{ items: NoteListItem[] }` (reverse-chronological by `createdAt`)
- `GET /notes/:id/detail` → `{ item: Note }` (404 if not found / not owned)
- `GET /reminders/list` → `{ items: ReminderListItem[] }`
- `GET /reminders/:id/detail` → `{ item: Reminder }` (404 if not found / not owned)

## Steps

1. Add `loadOwnedNote` / `loadOwnedReminder` helpers in `src/domain/utils/`.
2. Add 4 use cases under `src/domain/use-cases/captures/`:
   `list-notes`, `get-note-detail`, `list-reminders`, `get-reminder-detail`.
3. Add presenters `note-presenter.ts` and `reminder-presenter.ts`
   (reminder presenter derives `status` and maps `remindAt→firesAt`, `notes→body`, `createdAt→capturedAt`).
4. Add 4 route handlers under `src/infra/http/routes/notes/` and `.../reminders/`.
5. Register the 4 routes in `src/infra/http/app.ts` with `authMiddleware`.

## Files owned (project-backend only)

- `src/domain/utils/notes.ts`, `src/domain/utils/reminders.ts`
- `src/domain/use-cases/captures/list-notes.ts`, `get-note-detail.ts`,
  `list-reminders.ts`, `get-reminder-detail.ts`
- `src/infra/http/presenters/note-presenter.ts`, `reminder-presenter.ts`
- `src/infra/http/routes/notes/list-notes.ts`, `get-note-detail.ts`
- `src/infra/http/routes/reminders/list-reminders.ts`, `get-reminder-detail.ts`
- `src/infra/http/app.ts` (route registration only)

Repositories (`noteRepository`, `reminderRepository`) are ALREADY wired in
`src/infra/http/repositories.ts` — no wiring change needed.

## Verification

`cd project-backend && npx tsc --noEmit` passes with no new errors.
(Do NOT run `npm run lint:fix` — formatting handled after all parallel plans.)
