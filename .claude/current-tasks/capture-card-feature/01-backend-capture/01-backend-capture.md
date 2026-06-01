# Deep Plan — [Backend] Capture persistence & enriched capture API

## Context

Today the chat flow (`POST /chat`) asks Gemini for a reply that may include draft `newReminders`, `newNotes`, and `newTasks`, but those drafts are **never persisted** — they are echoed back verbatim by `AgentReplyPresenter`. The Ben message is always created with `capture: null` (`persist-ben-message.ts`), and `GET /messages/list` emits the raw `Message.capture` (always `null` today). The `Message` entity already declares the target shape `capture: MessageCapture | null` where `MessageCapture = { kind, itemId }`.

This plan makes Ben actually persist captured items as real in-memory domain entities (`Note`, `Reminder`, `Task`), links the **primary** captured item to the Ben `Message`, and exposes an **enriched** `CaptureView` (`{ kind, itemId, title, meta }`) on both `POST /chat` and `GET /messages/list`.

All work is confined to `project-backend/`. The frontend plan (parallel) only touches `project-web/`, so there is no conflict. Both plans agree on the shared `CaptureView` JSON contract below.

## Decisions

- **New entities mirror `Topic`/`TopicSummary` exactly**: a `Props` interface plus a class extending `Entity<Props>` with `static create` and `static reference`. `userId` and `createdAt` follow the existing convention.
  - `Note { userId, title, body, createdAt }`
  - `Reminder { userId, title, remindAt: string | null, notes: string | null, createdAt }` — `remindAt` stored as the **raw string** the agent proposed (free-form human time, never parsed to `Date`).
  - `Task { userId, title, details: string | null, status: TaskStatus, createdAt }` where `TaskStatus = 'pending' | 'active' | 'finished'`.
- **Repositories follow the exact `Topic` pattern**: abstract `*-repository.ts` extending `Repository<X>`, plus `in-memory-*` extending `InMemoryRepository<X>` with `protected entity = X as unknown as EntityWithStatic<X>`. Registered as singletons in `repositories.ts`.
- **`CaptureView` DTO** lives in a shared module `src/adapters/capture-view.ts` (adapter layer, reused by use-cases + presenters). Shape exactly matches the contract.
- **Persist everything, then pick a primary.** `PersistCapturesUseCase` persists **all** drafts (nothing lost — future menu screens will list them) and returns an ordered `CaptureView[]` in precedence order **reminders → tasks → notes**. The route picks `views[0] ?? null` as the primary. This precedence + "first persisted wins" rule is the single source of which item the Ben message links to.
- **`meta` builder rule**: note → `null`; reminder → `remindAt ?? null`; task → `null`. Centralized so both persist and resolve produce identical `CaptureView`s.
- **`ResolveCaptureUseCase`** loads a stored `{ kind, itemId }` via `repo.findUnique({ id: new ID(itemId) })` (confirmed: `ID` constructor accepts a string, `findUnique` accepts `{ id }`). Returns `null` when the item is missing so history simply omits the card instead of failing.
- **`PersistBenMessageUseCase`** gains an optional `capture?: MessageCapture | null` (default `null`) — additive, no caller breaks.
- **Route ordering in `chat.ts`**: persist user message → build topic index → generate reply → **persist captures** → persist Ben message **with the primary capture** → persist topic summaries → respond with `AgentReplyPresenter.toHttp(reply, primaryCapture)`.

## Files to Create

### `src/domain/entities/note.ts`
```ts
import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface NoteProps {
  userId: string
  title: string
  body: string
  createdAt: Date
}

export class Note extends Entity<NoteProps> {
  static create(props: NoteProps) {
    return new Note(props)
  }

  static reference(id: ID, props: NoteProps) {
    return new Note(props, id)
  }
}
```

### `src/domain/entities/reminder.ts`
```ts
import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface ReminderProps {
  userId: string
  title: string
  remindAt: string | null
  notes: string | null
  createdAt: Date
}

export class Reminder extends Entity<ReminderProps> { static create / static reference }
```

### `src/domain/entities/task.ts`
```ts
export type TaskStatus = 'pending' | 'active' | 'finished'

export interface TaskProps {
  userId: string
  title: string
  details: string | null
  status: TaskStatus
  createdAt: Date
}

export class Task extends Entity<TaskProps> { static create / static reference }
```

### Repositories (3 abstract + 3 in-memory) — exact `Topic` pattern
`note-repository.ts`, `in-memory-note-repository.ts`, `reminder-repository.ts`, `in-memory-reminder-repository.ts`, `task-repository.ts`, `in-memory-task-repository.ts`.

### `src/adapters/capture-view.ts`
```ts
import { MessageCaptureKind } from '@/domain/entities/message'

export interface CaptureView {
  kind: MessageCaptureKind
  itemId: string
  title: string
  meta: string | null
}
```

### `src/domain/use-cases/captures/persist-captures.ts`
Persists all drafts, returns ordered `CaptureView[]` (reminders → tasks → notes).

### `src/domain/use-cases/captures/resolve-capture.ts`
Given `{ kind, itemId }`, loads the entity and builds a `CaptureView`; returns `null` if missing.

## Files to Modify

- `src/infra/http/repositories.ts` — add `noteRepository`, `reminderRepository`, `taskRepository`.
- `src/domain/use-cases/messages/persist-ben-message.ts` — add optional `capture`.
- `src/infra/http/routes/chat.ts` — wire persist-captures + primary capture + enriched response.
- `src/infra/http/presenters/agent-reply-presenter.ts` — `toHttp(reply, capture)` adds `capture`.
- `src/infra/http/routes/messages.ts` — resolve each message's capture into `CaptureView`.
- `src/infra/http/presenters/message-presenter.ts` — `toHttp(message, capture)` emits enriched `capture`.

## Existing Code to Reuse

- `Entity` / `EntityWithStatic`, `ID` (string ctor), `InMemoryRepository` (`create`, `findUnique`).
- `Topic`/`TopicSummary` entities and their repos as the literal template.
- `AgentReply` draft types (`ReminderDraft`, `NoteDraft`, `TaskDraft`) from `adapters/agent-provider.ts`.
- `MessageCapture` / `MessageCaptureKind` from `domain/entities/message.ts`.

## Contract

### CaptureView
| field  | type                              | source |
|--------|-----------------------------------|--------|
| kind   | `'note' \| 'reminder' \| 'task'`  | entity kind |
| itemId | `string`                          | persisted entity id |
| title  | `string`                          | entity `title` |
| meta   | `string \| null`                  | note→null, reminder→`remindAt ?? null`, task→null |

### POST /chat — adds `capture: CaptureView | null` (primary item this turn).
### GET /messages/list item — `capture: CaptureView | null` (enriched; null when no/missing item).

### Primary selection precedence: reminders → tasks → notes; first persisted wins.

## Verification

- `npx tsc --noEmit` inside `project-backend/` passes with no new errors.
- Do NOT run `npm run lint:fix` (formatting handled later, once, across both plans).
