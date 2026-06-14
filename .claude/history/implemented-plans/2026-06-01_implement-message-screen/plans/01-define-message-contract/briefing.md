**Plan 1 [Backend] (sync)**: Define the shared message API contract (request/response shapes) that both backend and frontend implement against.

## Goal

Produce the single source of truth for the message (chat) Text-MVP API contract, so the backend (Plan 2) and the frontend (Plan 2) can be implemented in parallel against the same agreed shapes without depending on each other's code.

The contract covers only the **Text MVP**:

- `GET /messages/list?limit=20&before={cursor}` → paginated message history (latest-first window).
- `POST /messages/create` → send a text message; returns the persisted user message plus Ben's reply (and optional inline capture reference).

It must define, for each endpoint:

- Request shape (query params / body).
- Response shape (the `Message` DTO, pagination cursor, `benMessage`, optional `capture`).
- The `Message` DTO fields relevant to text MVP (`id`, `role: 'user' | 'ben'`, `content`, `capture?`, `createdAt`). Audio fields are out of scope for this MVP.

## Why sync / first

This contract is consumed by both parallel Plan 2 (Backend) and Plan 2 (Frontend). It must finish and be approved before anything else starts, so the two sides agree on identical shapes.

## Files owned

- The contract document/definition file(s) under the task folder (and, if the design decides, a backend-side and/or frontend-side type definition that mirrors the agreed contract). The detailing sub-agent decides the concrete location following codebase conventions, but this plan owns only contract-definition artifacts — it does NOT implement routes, use-cases, entities, or UI.
