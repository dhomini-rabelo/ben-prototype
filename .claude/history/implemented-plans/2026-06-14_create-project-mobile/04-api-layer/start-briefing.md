# Plan 04 — API layer (`src/api/`)

**Plan 3 [Frontend] (parallel)**: Port the entire `src/api/` layer.

- Depends on the scaffold (plan 01) and the storage layer (plan 02, an earlier slot). Owns `src/api/` exclusively, so it runs in parallel with plan 05 (UI primitives), which owns `src/layout/components/ui|icons`. The React Query hooks (plan 06) and every request consumer come later.

## Goal

Port `client.ts`, `routes.ts`, `types.ts`, `models/`, `requests/`, `responses/` from web. The backend contract is identical, so models/responses/routes/requests copy nearly intact. The real rewrite is **`client.ts`** (per analysis point 1) and the **transcription FormData** (point 3).

## Scope / owned files

- `project-mobile/src/api/client.ts`
  - `BASE_URL` from `src/core/env.ts` (not `import.meta.env`).
  - `basicClient` / `authClient` axios instances.
  - Request interceptor reads the token **synchronously** from `getCachedToken()` (plan 02) instead of `js-cookie`.
  - Response interceptor: on `401`, invoke a registered **navigation callback** (e.g. `setUnauthorizedHandler(fn)` exported here; default no-op) instead of `window.location`; on `updatedjwtauthenticationtoken` header, update cached + stored token.
  - Re-export `queryClient` from `src/core/query-client.ts` (owned by scaffold) OR import it where needed.
  - Export `JWT_COOKIE`/`PROVIDER_COOKIE` key constants (kept for parity, now SecureStore keys).
- `project-mobile/src/api/routes.ts` — copy `API_ROUTES` intact.
- `project-mobile/src/api/types.ts` — copy `Pagination`, `CursorPaginationResponse`, `ItemResponse`, `ListingResponse` intact.
- `project-mobile/src/api/models/` — `user.ts`, `message.ts`, `task.ts`, `note.ts`, `reminder.ts` copied intact.
- `project-mobile/src/api/responses/` — `agent-reply.ts`, `task.ts`, `transcription.ts`, `captures.ts` copied intact.
- `project-mobile/src/api/requests/` — `chat.ts`, `tasks.ts`, `notes.ts`, `reminders.ts` copied intact; **`transcription.ts`** rewritten to build `FormData` from an RN file URI (`{ uri, name: "recording.m4a", type: "audio/m4a" }`) instead of a web `Blob`.

## Verification

`npx tsc --noEmit` passes.
