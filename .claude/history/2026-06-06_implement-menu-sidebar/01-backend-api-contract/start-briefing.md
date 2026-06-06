# Plan 1 [Backend] (sync): Define the shared API contract for menu sidebar lists & detail

**Plan line:** Plan 1 · Backend · sync
**Why it runs first/alone:** Both the backend endpoints plan (Plan 2 Backend) and the frontend feature plan (Plan 2 Frontend) build against this contract. It must finish before either parallel plan starts so the two sides agree on exact request/response shapes. It owns documentation only — no code conflicts.

## Goal

The "Menu sidebar" feature in `project-web` needs to list and open a user's **notes**, **reminders**, and **tasks**. Today only `GET /tasks/list` and `GET /tasks/:id/detail` exist. Notes and reminders have **no** list/detail HTTP endpoints. This plan pins down the exact HTTP contract so backend and frontend can be built in parallel without divergence.

## Files this plan owns

- `docs/api-endpoints.md` (add/clarify the notes & reminders list + detail endpoints section)

## Contract to specify (decided by architect — based on real entity fields)

Backend entities (source of truth):
- **Note** (`project-backend/src/domain/entities/note.ts`): `userId, title, body, createdAt`
- **Reminder** (`project-backend/src/domain/entities/reminder.ts`): `userId, title, remindAt: string|null, notes: string|null, createdAt`
- **Task**: already exposed via `toListItemHttp()` / `toHttp()` presenters.

Endpoints to define (all authenticated, scoped to current user):

| Method | Path | Response | Notes |
| --- | --- | --- | --- |
| GET | `/notes/list` | `ListingResponse<NoteListItem>` | reverse-chronological by `createdAt` |
| GET | `/notes/:id/detail` | `ItemResponse<Note>` | 404 if not found / not owned |
| GET | `/reminders/list` | `ListingResponse<ReminderListItem>` | all reminders; client groups by `status` |
| GET | `/reminders/:id/detail` | `ItemResponse<Reminder>` | 404 if not found / not owned |

Follow the existing `ListingResponse<T> = { items: T[] }` and `ItemResponse<T> = { item: T }` conventions already used by `/tasks/list` and `/tasks/:id/detail`.

JSON shapes:
- **Note / NoteListItem**: `{ id: string, title: string, body: string, capturedAt: string (ISO) }` (same shape for list + detail; `body` doubles as the list preview).
- **Reminder / ReminderListItem**: `{ id: string, title: string, firesAt: string | null (ISO), body: string | null, status: "upcoming" | "fired", capturedAt: string (ISO) }`.
  - `firesAt` maps from the entity's `remindAt`.
  - `body` maps from the entity's `notes`.
  - `status` is **derived**: `"upcoming"` when `firesAt` is in the future (or null = no time set, treat as upcoming), `"fired"` when `firesAt` is in the past.
  - `capturedAt` maps from `createdAt`.

Sidebar counts are **derived on the frontend** from the three list responses (no dedicated counts endpoint).

Keep it lightweight: this plan only documents the contract. The other two plans implement against it.
