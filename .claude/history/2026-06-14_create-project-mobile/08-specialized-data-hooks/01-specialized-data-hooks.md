# Plan 08 — Specialized data hooks (`src/layout/hooks/api/`)

Implementation plan for porting the `project-web` entity-specific React Query data
hooks into `project-mobile`. **Plan only — do not implement yet.**

## Objective

Port the 8 specialized data hooks from `project-web/src/layout/hooks/api/` into
`project-mobile/src/layout/hooks/api/`. Each hook is a **thin per-domain wrapper**
over a generic hook (`useAPIRequest` or `useAPICursorPaginated`), bound to a specific
route (`API_ROUTES`) and a typed response envelope. They are platform-agnostic: React
Query and axios live entirely inside the generic hooks (plan 06), so these files
contain no DOM/web APIs. The port is **copy-intact**; only the source location changes,
and the `@/` aliased imports resolve identically once the mobile path alias is set up.

## Context & key facts

- Each file is tiny (300–550 bytes) and follows the [API Data Hooks pattern](../../../skills/code-write-code/coding-patterns/api-data-hooks.md):
  wrap one endpoint, bind the generic hook to the route + typed envelope, nothing else.
- The generic hooks return `{ state, actions }`; these wrappers just pass the return
  through unchanged.
- All imports use the `@/` alias. **No relative paths.** The exact import strings are
  identical to `project-web` and must be copied verbatim.

## Dependencies (must exist before this plan runs)

- **Plan 06 (generic hooks)** provides `@/layout/hooks/use-api-request` (`useAPIRequest`)
  and `@/layout/hooks/use-api-cursor-paginated` (`useAPICursorPaginated`).
- **Plan 04 (API layer)** provides:
  - `@/api/routes` → `API_ROUTES` with: `messages.list` (`"/messages/list"`),
    `tasks.list` (`"/tasks/list"`), `tasks.detail(id)`, `notes.list`,
    `notes.detail(id)`, `reminders.list`, `reminders.detail(id)`,
    `captures.counts` (`"/captures/counts"`). (Verified present in `project-web/src/api/routes.ts`.)
  - `@/api/types` → `ItemResponse<T>`, `ListingResponse<T>`, `CursorPaginationResponse<T>`.
  - `@/api/models/message` → `Message`.
  - `@/api/models/task` → `Task`, `TaskStatus` (`"created" | "active" | "finished"`).
  - `@/api/models/note` → `Note`, `NoteListItem`.
  - `@/api/models/reminder` → `Reminder`, `ReminderListItem`.
  - `@/api/responses/task` → `TaskListItem`.
  - `@/api/responses/captures` → `CapturesCountsResponse`.

> The task-list hook intentionally imports `TaskStatus` from `@/api/models/task` but
> `TaskListItem` from `@/api/responses/task` — keep these two separate sources exactly
> as in `project-web` (do not "tidy" them into one import).

## Owned files

This plan touches **only** `project-mobile/src/layout/hooks/api/`. No other directory
is modified. No barrel/index file is created (re-export-only files are forbidden per
project rules). No formatting step. No lint step in this plan.

## Steps

### 1. Create `project-mobile/src/layout/hooks/api/` and port the 8 hooks verbatim

Copy each file byte-for-byte from the `project-web` counterpart. The `@/` imports are
unchanged. Below is each target file with its exact content and the exported signature.

---

**`use-message-list-data.ts`** — `useMessageListData(): ReturnType<typeof useAPICursorPaginated<Message>>`
Cursor-paginated `Message` feed for the chat history.

```typescript
import type { Message } from "@/api/models/message";
import { API_ROUTES } from "@/api/routes";
import { useAPICursorPaginated } from "@/layout/hooks/use-api-cursor-paginated";

export function useMessageListData() {
  return useAPICursorPaginated<Message>({
    url: API_ROUTES.messages.list,
  });
}
```

---

**`use-task-list-data.ts`** — `useTaskListData({ status }?: { status?: TaskStatus }): ReturnType<typeof useAPIRequest<ListingResponse<TaskListItem>>>`
Task listing with optional `status` filter forwarded as a query param.

```typescript
import type { TaskStatus } from "@/api/models/task";
import type { TaskListItem } from "@/api/responses/task";
import { API_ROUTES } from "@/api/routes";
import type { ListingResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

interface UseTaskListDataProps {
  status?: TaskStatus;
}

export function useTaskListData({ status }: UseTaskListDataProps = {}) {
  return useAPIRequest<ListingResponse<TaskListItem>>({
    url: API_ROUTES.tasks.list,
    params: status ? { status } : undefined,
  });
}
```

---

**`use-task-detail-data.ts`** — `useTaskDetailData(taskId: string): ReturnType<typeof useAPIRequest<ItemResponse<Task>>>`

```typescript
import type { Task } from "@/api/models/task";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useTaskDetailData(taskId: string) {
  return useAPIRequest<ItemResponse<Task>>({
    url: API_ROUTES.tasks.detail(taskId),
  });
}
```

---

**`use-note-list-data.ts`** — `useNoteListData(): ReturnType<typeof useAPIRequest<ListingResponse<NoteListItem>>>`

```typescript
import type { NoteListItem } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ListingResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useNoteListData() {
  return useAPIRequest<ListingResponse<NoteListItem>>({
    url: API_ROUTES.notes.list,
  });
}
```

---

**`use-note-detail-data.ts`** — `useNoteDetailData(noteId: string): ReturnType<typeof useAPIRequest<ItemResponse<Note>>>`

```typescript
import type { Note } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useNoteDetailData(noteId: string) {
  return useAPIRequest<ItemResponse<Note>>({
    url: API_ROUTES.notes.detail(noteId),
  });
}
```

---

**`use-reminder-list-data.ts`** — `useReminderListData(): ReturnType<typeof useAPIRequest<ListingResponse<ReminderListItem>>>`

```typescript
import type { ReminderListItem } from "@/api/models/reminder";
import { API_ROUTES } from "@/api/routes";
import type { ListingResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useReminderListData() {
  return useAPIRequest<ListingResponse<ReminderListItem>>({
    url: API_ROUTES.reminders.list,
  });
}
```

---

**`use-reminder-detail-data.ts`** — `useReminderDetailData(reminderId: string): ReturnType<typeof useAPIRequest<ItemResponse<Reminder>>>`

```typescript
import type { Reminder } from "@/api/models/reminder";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useReminderDetailData(reminderId: string) {
  return useAPIRequest<ItemResponse<Reminder>>({
    url: API_ROUTES.reminders.detail(reminderId),
  });
}
```

---

**`use-captures-counts-data.ts`** — `useCapturesCountsData(): ReturnType<typeof useAPIRequest<ItemResponse<CapturesCountsResponse>>>`

```typescript
import type { CapturesCountsResponse } from "@/api/responses/captures";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useCapturesCountsData() {
  return useAPIRequest<ItemResponse<CapturesCountsResponse>>({
    url: API_ROUTES.captures.counts,
  });
}
```

### 2. Verify

From `project-mobile/`:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. This confirms every specialized hook resolves its generic
hook, its entity/response types, and its route correctly. No formatting and no lint
step are part of this plan.

## Notes & guardrails

- **Copy intact**: do not refactor, rename, reorder imports, or change signatures. The
  only difference from `project-web` is the file's location on disk.
- **Parallel-safe**: this plan writes only inside `src/layout/hooks/api/`; it does not
  create the generic hooks, the API layer, or any index/barrel file.
- **One export per file**, named function export, kebab-case filename — already
  satisfied by the verbatim copies.
- If `npx tsc --noEmit` fails on a missing module, the cause is an unfinished
  dependency (plan 06 or 04), not this plan — do not work around it by changing import
  paths here.
