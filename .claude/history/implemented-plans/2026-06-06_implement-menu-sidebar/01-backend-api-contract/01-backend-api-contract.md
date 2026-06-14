# Deep Plan — Backend API contract (Plan 1, sync)

## Context
`project-web`'s menu sidebar needs to list/open notes, reminders, tasks. Only tasks endpoints exist. This plan documents the exact contract for the two parallel plans (backend impl + frontend feature) to build against. Documentation-only; no code.

## Decisions
- Reuse existing `ListingResponse<T> = { items: T[] }` and `ItemResponse<T> = { item: T }` conventions (already used by `/tasks/*`).
- Notes/reminders stay read-only (v1) — only list + detail.
- Sidebar counts derived client-side from the three lists; no `/sidebar/counts`.
- Settings profile uses the `user` from `POST /auth/login-or-register`; no `/me/detail`.
- Reminder presenter derives `status` from `remindAt`.

## Contract
| Endpoint | Response |
| --- | --- |
| `GET /notes/list` | `{ items: NoteListItem[] }` |
| `GET /notes/:id/detail` | `{ item: Note }` |
| `GET /reminders/list` | `{ items: ReminderListItem[] }` |
| `GET /reminders/:id/detail` | `{ item: Reminder }` |

- `Note` / `NoteListItem`: `{ id: string, title: string, body: string, capturedAt: string }`
- `Reminder` / `ReminderListItem`: `{ id: string, title: string, firesAt: string | null, body: string | null, status: "upcoming" | "fired", capturedAt: string }`

Field mapping (reminder): `remindAt→firesAt`, `notes→body`, `createdAt→capturedAt`; `status="upcoming"` if `firesAt` null/future else `"fired"`.

## Files to Modify
- `docs/api-endpoints.md` — sections "Inline capture cards & Item detail modal" and "Tela: Menu sidebar".

## Verification
- Manual doc review. No `tsc`/lint (docs only).

## Status
✅ Implemented — `docs/api-endpoints.md` updated.
