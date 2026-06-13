# Plan 08 — Specialized data hooks (`src/layout/hooks/api/`)

**Plan 5 [Frontend] (parallel)**: Port the entity-specific React Query data hooks.

- Depends on the generic hooks (plan 06) and the API requests/responses (plan 04). Owns `src/layout/hooks/api/` exclusively. Runs at its own slot after plans 06/07.

## Goal

Port the specialized data hooks that wrap the generic ones for each entity. They work in RN unchanged — only import paths adjust.

## Scope / owned files

- `project-mobile/src/layout/hooks/api/use-message-list-data.ts` — `useMessageListData()` (cursor paginated `Message`).
- `project-mobile/src/layout/hooks/api/use-task-list-data.ts` — `useTaskListData(status?)`.
- `project-mobile/src/layout/hooks/api/use-task-detail-data.ts` — `useTaskDetailData(taskId)`.
- `project-mobile/src/layout/hooks/api/use-note-list-data.ts` — `useNoteListData()`.
- `project-mobile/src/layout/hooks/api/use-note-detail-data.ts` — `useNoteDetailData(noteId)`.
- `project-mobile/src/layout/hooks/api/use-reminder-list-data.ts` — `useReminderListData()`.
- `project-mobile/src/layout/hooks/api/use-reminder-detail-data.ts` — `useReminderDetailData(reminderId)`.
- `project-mobile/src/layout/hooks/api/use-captures-counts-data.ts` — `useCapturesCountsData()`.

## Verification

`npx tsc --noEmit` passes.
