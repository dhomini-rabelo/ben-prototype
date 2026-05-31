**Plan 2 [Backend] (parallel)**: Implement the Message entity, list/create use-cases, repository, and route handlers against the contract.

## Goal

Build the backend for the Text-MVP message API in `project-backend`, following the existing domain / use-case / adapter / infra-http architecture (mirror the `auth` flow already in the repo):

- A `Message` domain entity (text-MVP fields: `role`, `content`, optional `capture` reference, `createdAt`, `userId`).
- A repository port + implementation for persisting and listing messages.
- Use-cases:
  - `list-messages` — paginated history (`limit`, `before` cursor).
  - `create-message` — persist the user's text message, generate Ben's reply (mock/stub reply is acceptable for the prototype), persist it, return both.
- HTTP route handlers + presenters for `GET /messages/list` and `POST /messages/create`, and **registering them in the main Express router (`app.ts`)** following the existing `/auth/login-or-register` mounting pattern.

## Why parallel

Depends only on the contract from Plan 1. It owns the entire backend side (entity, use-cases, repository, route handlers, and the `app.ts` registration) and does NOT touch any frontend file, so it runs alongside the frontend plan. No other plan touches `app.ts`, so registering routes here causes no conflict.

## Files owned

- `project-backend/src/domain/entities/message.ts` (and related).
- `project-backend/src/domain/use-cases/messages/*`.
- `project-backend/src/adapters/**` message repository port + implementation.
- `project-backend/src/infra/http/**` message route handler file(s) + presenters.
- `project-backend/src/infra/http/app.ts` (register the message routes).
- Must NOT touch any `project-web` file.
