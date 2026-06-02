**Plan 1 [Backend] (parallel)**: Create task diff route files

## Goal

Split the two diff route handlers currently grouped in
`project-backend/src/infra/http/routes/tasks.ts` into their own dedicated files,
one route per file, following the existing one-handler-per-file convention used by
`routes/messages.ts`, `routes/chat.ts`, `routes/auth.ts`, and `routes/transcription.ts`.

The new files live under a new `project-backend/src/infra/http/routes/tasks/` subfolder
(mirrors the `domain/use-cases/tasks/` structure and keeps the `routes/` folder clean).

## Files owned by this plan (create only)

- `project-backend/src/infra/http/routes/tasks/approve-task-diff.ts` → exports `approveTaskDiff`
- `project-backend/src/infra/http/routes/tasks/reject-task-diff.ts` → exports `rejectTaskDiff`

## Rules

- Each file is self-contained: it imports its own use case(s), instantiates them, defines
  its own Zod schema(s) inline (matching how `messages.ts` defines its own schema), and
  exports the route handler. Duplicating the small `taskParamsSchema` across files is
  acceptable and matches the existing convention.
- Copy the handler bodies verbatim from the current `tasks.ts` (do not change behavior).
- Do NOT modify `app.ts` — wiring is handled by the synchronous Plan 2.
- Do NOT delete the old `tasks.ts` — Plan 2 handles cleanup.
- Do NOT touch any file owned by the other parallel plans.
- Do NOT run formatting (`npm run lint:fix`).

## Source reference

Handlers to move (see current `routes/tasks.ts`):
`approveTaskDiff` (uses `ApproveTaskDiffUseCase`, `taskParamsSchema`),
`rejectTaskDiff` (uses `RejectTaskDiffUseCase`, `taskParamsSchema`).
Shared deps: `taskRepository` from `@/infra/http/repositories`, `TaskPresenter`, `HttpStatus`.
