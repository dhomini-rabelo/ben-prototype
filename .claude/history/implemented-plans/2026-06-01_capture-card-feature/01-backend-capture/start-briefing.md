# Plan 1 [Backend] (parallel) — Capture persistence & enriched capture API

## Plan line

**Plan 1 [Backend] (parallel)**: Persist the agent's `newReminders / newNotes / newTasks` drafts into real `Note` / `Reminder` / `Task` domain entities (in-memory), link the primary captured item to `Message.capture` (`{ kind, itemId }`), and expose an **enriched** capture object on both the `POST /chat` and `GET /messages/list` responses.

- Runs in **parallel** with the Frontend plan. It touches only files under `project-backend/`, so it can never conflict with the Frontend plan (which lives entirely under `project-web/`).
- The two plans agree on the **shared JSON contract** documented below — implement the backend side of that contract exactly.

## Goal

Today `Message.capture` is always `null`, no `Note/Reminder/Task` entities exist, and `/chat` returns only the drafts. Make Ben actually persist captured items and tell the web which item a Ben message created, with enough display data to render a capture card both live and after reload.

## Scope — files this plan OWNS (only `project-backend/`)

New:
- `src/domain/entities/note.ts`, `reminder.ts`, `task.ts`
- `src/adapters/repositories/note-repository.ts` + `in-memory-note-repository.ts`
- `src/adapters/repositories/reminder-repository.ts` + `in-memory-reminder-repository.ts`
- `src/adapters/repositories/task-repository.ts` + `in-memory-task-repository.ts`
- A shared capture-view DTO type (e.g. `src/adapters/capture-view.ts` or co-located) — see contract.
- `src/domain/use-cases/captures/persist-captures.ts` — persist all drafts → entities, return ordered `CaptureView[]`.
- `src/domain/use-cases/captures/resolve-capture.ts` — given a stored `{ kind, itemId }`, load the entity and build a `CaptureView` (for history listing).

Modified:
- `src/infra/http/repositories.ts` — register the three new repositories.
- `src/domain/use-cases/messages/persist-ben-message.ts` — accept an optional `capture: MessageCapture | null` (default `null`).
- `src/infra/http/routes/chat.ts` — persist captures, pick the primary, set the Ben message's capture, include the primary `CaptureView` in the response.
- `src/infra/http/presenters/agent-reply-presenter.ts` — add `capture: CaptureView | null` to the response.
- `src/infra/http/routes/messages.ts` — resolve each listed message's capture into a `CaptureView`.
- `src/infra/http/presenters/message-presenter.ts` — accept an optional resolved `CaptureView` and emit it as `capture`.

## SHARED JSON CONTRACT (authoritative — both plans must match)

### CaptureView (enriched capture object, used by BOTH endpoints)
```jsonc
{
  "kind": "note" | "reminder" | "task",
  "itemId": "string",        // id of the persisted Note/Reminder/Task
  "title": "string",         // item title — what the card shows as its main line
  "meta": "string | null"    // optional secondary line (e.g. reminder time); null when none
}
```

### POST /chat response (extends today's AgentReply HTTP shape — keep all existing fields)
```jsonc
{
  "message": "string",
  "newReminders": [ ... ],
  "newNotes": [ ... ],
  "newTasks": [ ... ],
  "historyTopics": [ { "topic": "...", "summary": "..." } ],
  "capture": CaptureView | null   // NEW: the primary captured item this turn, or null
}
```

### GET /messages/list item (was `capture: { kind, itemId } | null`; now enriched)
```jsonc
{
  "id": "...", "role": "user"|"ben", "content": "...", "createdAt": "ISO",
  "capture": CaptureView | null   // enriched with title + meta; null for messages with no capture
}
```

## Domain decisions (make these, justified)

- **Entities (in-memory, mirror existing `Topic`/`TopicSummary` style):**
  - `Note { userId, title, body, createdAt }`
  - `Reminder { userId, title, remindAt: string | null, notes: string | null, createdAt }` — store `remindAt` as the **raw string** the agent proposed (do NOT parse to `Date`; agent values are free-form human time expressions). `notes`/`remindAt` default `null`.
  - `Task { userId, title, details: string | null, status: 'pending' | 'active' | 'finished', createdAt }` — `status` defaults to `'pending'`, `details` defaults `null`.
- **Primary capture selection:** persist **all** returned drafts (nothing is lost — future menu screens will list them), then pick the **primary** in precedence order **reminders → tasks → notes** (first persisted item wins). Link the Ben message + `/chat` response to that primary. Document this rule in the deep plan.
- **`meta` builder:** note → `null`; reminder → `remindAt ?? null`; task → `null`.
- **resolve-capture** loads by id (`repo.findUnique({ id: new ID(itemId) })` — confirm `ID` usage in `src/modules/domain/entity/id.ts`); returns `null` if the item is missing so the card is simply omitted.

## Constraints

- Follow existing patterns exactly: entity `create`/`reference` statics, abstract `*-repository.ts` extending `Repository`, `in-memory-*` extending `InMemoryRepository` with `protected entity = X as unknown as EntityWithStatic<X>`, use-cases implementing `UseCase<T>`, static presenters.
- Do **not** run `npm run lint:fix` — formatting happens once after both parallel plans finish.
- Verify with `npx tsc --noEmit` inside `project-backend/`.
