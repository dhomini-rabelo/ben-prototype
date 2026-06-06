# Simple Plan — Backend API contract for menu sidebar

## Objective
Pin down exact HTTP request/response shapes for notes & reminders list + detail so backend and frontend build in parallel without divergence.

## Steps
1. Edit `docs/api-endpoints.md`:
   - Add precise `{ item: ... }` shapes to `GET /notes/:id/detail` and `GET /reminders/:id/detail`.
   - Add precise `{ items: [...] }` shapes to `GET /notes/list` and `GET /reminders/list`.
   - Mark `GET /sidebar/counts` and `GET /me/detail` as not implemented in this block (counts derived client-side; profile from auth user).
   - Document reminder field mapping (`remindAt→firesAt`, `notes→body`, `createdAt→capturedAt`) and `status` derivation.

## Contract (final)
- Note: `{ id, title, body, capturedAt }`
- Reminder: `{ id, title, firesAt: string|null, body: string|null, status: "upcoming"|"fired", capturedAt }`
- Conventions: `ListingResponse<T> = { items: T[] }`, `ItemResponse<T> = { item: T }`.

## Files owned
- `docs/api-endpoints.md`

## Verification
- Doc review only (no code).
