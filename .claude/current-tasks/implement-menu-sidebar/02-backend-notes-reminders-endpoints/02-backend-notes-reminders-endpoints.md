# Plan 2 [Backend] (parallel): Notes & Reminders list + detail endpoints — DEEP

## Context

The frontend menu sidebar (Notes / Reminders views) and the inline capture detail modals
need read endpoints that do not exist yet. Tasks already have the full pattern
(`GET /tasks/list`, `GET /tasks/:id/detail`). Notes and reminders are created server-side
via the chat tool-use flow (`PersistCapturesUseCase`) and are read-only in v1 — so only
list + detail are needed.

Entities (already exist):

- `Note` props: `{ userId, title, body, createdAt: Date }`
- `Reminder` props: `{ userId, title, remindAt: string | null, notes: string | null, createdAt: Date }`

Repositories `noteRepository` / `reminderRepository` are already instantiated and exported
from `src/infra/http/repositories.ts`, and their abstracts (`NoteRepository`,
`ReminderRepository`) extend `Repository<T>` — so `findMany` / `findUnique` / `orderBy` are
all available. No wiring changes are required; `PersistCapturesUseCase` already consumes them.

## Decisions

- **Folder convention**: new use cases go under `src/domain/use-cases/captures/` (where
  `persist-captures.ts` / `resolve-capture.ts` already live — notes & reminders are captures).
- **Ownership + 404**: mirror `loadOwnedTask` (`src/domain/utils/tasks.ts`) with
  `loadOwnedNote` / `loadOwnedReminder` helpers that throw
  `DomainError({ code, errorType: DangerErrors.NOT_FOUND })`. New codes: `NOTE_NOT_FOUND`,
  `REMINDER_NOT_FOUND`.
- **List ordering**: `findMany({ userId }, { orderBy: 'createdAt', order: 'desc' })` — the
  in-memory repo sorts `Date` props correctly (reverse-chronological).
- **Response types**: use shared `ListingResponse<T>` / `ItemResponse<T>` from
  `@/modules/domain/responses`, exactly like the task use cases.
- **Presenters** own the HTTP shape mapping:
  - `NotePresenter.toHttp` / `toListItemHttp` → `{ id, title, body, capturedAt }`
    (same shape for both; `capturedAt = createdAt.toISOString()`).
  - `ReminderPresenter.toHttp` / `toListItemHttp` → `{ id, title, firesAt, body, status, capturedAt }`:
    `firesAt = remindAt` (already ISO string | null), `body = notes`,
    `capturedAt = createdAt.toISOString()`, and `status` derived:
    `"upcoming"` if `remindAt` is null OR `new Date(remindAt) > now`, else `"fired"`.
- **Route handlers**: copy the tasks handlers verbatim in structure — instantiate the use
  case with the repository at module scope, parse params/query with `zod`, call
  `res.status(HttpStatus.OK).json(...)`, forward errors to `next(err)`.

## Files to Create

### `src/domain/utils/notes.ts`

```ts
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ID } from '@/modules/domain/entity/id'

export async function loadOwnedNote(
  noteRepository: NoteRepository,
  noteId: string,
  userId: string,
): Promise<Note> {
  const note = await noteRepository.findUnique({ id: new ID(noteId) })

  if (!note || note.props.userId !== userId) {
    throw new DomainError({
      code: 'NOTE_NOT_FOUND',
      errorType: DangerErrors.NOT_FOUND,
    })
  }

  return note
}
```

### `src/domain/utils/reminders.ts`

```ts
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { Reminder } from '@/domain/entities/reminder'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ID } from '@/modules/domain/entity/id'

export async function loadOwnedReminder(
  reminderRepository: ReminderRepository,
  reminderId: string,
  userId: string,
): Promise<Reminder> {
  const reminder = await reminderRepository.findUnique({ id: new ID(reminderId) })

  if (!reminder || reminder.props.userId !== userId) {
    throw new DomainError({
      code: 'REMINDER_NOT_FOUND',
      errorType: DangerErrors.NOT_FOUND,
    })
  }

  return reminder
}
```

### `src/domain/use-cases/captures/list-notes.ts`

```ts
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { ListingResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
}

export class ListNotesUseCase implements UseCase<ListingResponse<Note>> {
  constructor(private noteRepository: NoteRepository) {}

  async execute(payload: Payload): Promise<ListingResponse<Note>> {
    const items = await this.noteRepository.findMany(
      { userId: payload.userId },
      { orderBy: 'createdAt', order: 'desc' },
    )

    return { items }
  }
}
```

### `src/domain/use-cases/captures/get-note-detail.ts`

```ts
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { loadOwnedNote } from '@/domain/utils/notes'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  noteId: string
}

export class GetNoteDetailUseCase implements UseCase<ItemResponse<Note>> {
  constructor(private noteRepository: NoteRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Note>> {
    const item = await loadOwnedNote(
      this.noteRepository,
      payload.noteId,
      payload.userId,
    )

    return { item }
  }
}
```

### `src/domain/use-cases/captures/list-reminders.ts` / `get-reminder-detail.ts`

Mirror the note use cases, swapping `Reminder` / `reminderRepository` /
`loadOwnedReminder` / `reminderId`.

### `src/infra/http/presenters/note-presenter.ts`

```ts
import { Note } from '@/domain/entities/note'

interface NoteHttp {
  id: string
  title: string
  body: string
  capturedAt: string
}

export class NotePresenter {
  static toHttp(note: Note): NoteHttp {
    return {
      id: note.id.toValue(),
      title: note.props.title,
      body: note.props.body,
      capturedAt: note.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(note: Note): NoteHttp {
    return NotePresenter.toHttp(note)
  }
}
```

### `src/infra/http/presenters/reminder-presenter.ts`

```ts
import { Reminder } from '@/domain/entities/reminder'

type ReminderStatus = 'upcoming' | 'fired'

interface ReminderHttp {
  id: string
  title: string
  firesAt: string | null
  body: string | null
  status: ReminderStatus
  capturedAt: string
}

export class ReminderPresenter {
  static toHttp(reminder: Reminder): ReminderHttp {
    return {
      id: reminder.id.toValue(),
      title: reminder.props.title,
      firesAt: reminder.props.remindAt,
      body: reminder.props.notes,
      status: ReminderPresenter.resolveStatus(reminder.props.remindAt),
      capturedAt: reminder.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(reminder: Reminder): ReminderHttp {
    return ReminderPresenter.toHttp(reminder)
  }

  private static resolveStatus(remindAt: string | null): ReminderStatus {
    if (!remindAt) {
      return 'upcoming'
    }

    return new Date(remindAt).getTime() > Date.now() ? 'upcoming' : 'fired'
  }
}
```

### Route handlers (mirror `src/infra/http/routes/tasks/*`)

- `src/infra/http/routes/notes/list-notes.ts`
- `src/infra/http/routes/notes/get-note-detail.ts`
- `src/infra/http/routes/reminders/list-reminders.ts`
- `src/infra/http/routes/reminders/get-reminder-detail.ts`

Each: instantiate use case with the repo from `@/infra/http/repositories`, parse with zod,
map through the presenter, return `HttpStatus.OK`.

## Files to Modify

### `src/infra/http/app.ts`

Add imports + registrations after the tasks block:

```ts
app.get('/notes/list', authMiddleware, listNotes)
app.get('/notes/:id/detail', authMiddleware, getNoteDetail)
app.get('/reminders/list', authMiddleware, listReminders)
app.get('/reminders/:id/detail', authMiddleware, getReminderDetail)
```

## Existing Code to Reuse

| Reuse | From |
| --- | --- |
| `loadOwnedTask` pattern | `src/domain/utils/tasks.ts` |
| List/detail use case shape | `src/domain/use-cases/tasks/{list-tasks,get-task-detail}.ts` |
| Presenter shape | `src/infra/http/presenters/task-presenter.ts` |
| Route handler shape | `src/infra/http/routes/tasks/{list-tasks,get-task-detail}.ts` |
| `noteRepository` / `reminderRepository` | `src/infra/http/repositories.ts` (already wired) |
| `ItemResponse` / `ListingResponse` | `@/modules/domain/responses` |
| `DomainError` / `DangerErrors.NOT_FOUND` | `@/modules/domain/domain-errors` |
| `HttpStatus.OK` | `@/modules/utils/http` |

## Contracts

| Method | Path | Auth | Response |
| --- | --- | --- | --- |
| GET | `/notes/list` | yes | `{ items: NoteListItem[] }` |
| GET | `/notes/:id/detail` | yes | `{ item: Note }` (404 `NOTE_NOT_FOUND`) |
| GET | `/reminders/list` | yes | `{ items: ReminderListItem[] }` |
| GET | `/reminders/:id/detail` | yes | `{ item: Reminder }` (404 `REMINDER_NOT_FOUND`) |

- `Note` / `NoteListItem`: `{ id, title, body, capturedAt: ISO }`
- `Reminder` / `ReminderListItem`: `{ id, title, firesAt: ISO|null, body: string|null, status: "upcoming"|"fired", capturedAt: ISO }`

## Verification

`cd project-backend && npx tsc --noEmit` — no new type errors.
