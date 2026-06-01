**Plan 2 [Frontend] (parallel)**: Implement the chat (message) screen in `project-web`, visually matching `project-design`, wired to the contract.

## Goal

Build the chat screen in `project-web` for the Text MVP. The **visual design** must match the chat screens in `project-design` (ChatShell, MessageBubble, ChatInput, ActiveTaskPeek layout, Tailwind v4 tokens), while the **code structure and patterns** follow `project-web` conventions (its `core/routes.ts`, `core/router.tsx`, pages folder layout, data-fetching patterns).

Text-MVP states to cover:

- Empty (no messages, welcome state).
- Populated (message history rendered as bubbles).
- Composing (text input focused, send button).
- Awaiting reply (Ben typing indicator after send).
- Loading history.

Data layer calls the message API against the **Plan 1 contract** (`GET /messages/list`, `POST /messages/create`). Audio/voice, offline, permission-denied, and error-recovery states are OUT of scope for this MVP.

## Why parallel

Depends only on the contract from Plan 1. It touches its own frontend files (new chat page, chat components, the project-web route additions, the message API client) and does NOT touch any backend file, so it runs alongside the backend plan.

## Files owned

- `project-web/src/pages/**` new chat page + chat-specific components.
- `project-web/src/core/routes.ts` and `project-web/src/core/router.tsx` (add the chat route — owned solely by this frontend plan, no backend overlap).
- `project-web/src/**` message API client / data hooks.
- Must NOT touch any `project-backend` file.
