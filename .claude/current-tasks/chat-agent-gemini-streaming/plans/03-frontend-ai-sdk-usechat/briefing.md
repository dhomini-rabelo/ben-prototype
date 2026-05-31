# Plan 2 [Frontend] (parallel) — Adopt @ai-sdk/react useChat

**Plan line:** Plan 2 [Frontend] (parallel)

## Goal

Replace the bespoke chat send flow with `@ai-sdk/react`'s `useChat` consuming the streaming `POST /chat` endpoint, while preserving the existing chat UI features (history pagination, captures, scroll). Runs in parallel with the backend plan; touches only `project-web` files.

## Scope

1. Install `@ai-sdk/react` and `ai` in `project-web`.
2. Rework `src/pages/chat/hooks/use-chat.ts` to use `useChat` + `DefaultChatTransport`:
   - `api` points to the backend `/chat` URL (reuse the existing API base config).
   - `headers` carry the JWT the way `authClient` does today.
3. Seed history: keep loading `/messages/list` (paginated) and map it into the initial `useChat` messages (UIMessage `parts` format).
4. Adapt the chat components (`message-bubble`, `chat-history`, `chat-input`, etc.) to read UIMessage `parts` instead of the old `Message` model, preserving capture rendering for historical messages.
5. Preserve optimistic UX / scroll-to-bottom behavior on send.

## Files owned

- `project-web/package.json` (add deps).
- `project-web/src/pages/chat/**` (hook + components).
- `project-web/src/api/**` chat-related contracts/models as needed for mapping history.

## Dependencies

- Plan 1 (the `/chat` contract: request shape, UIMessage-stream response, auth headers). Build against the contract, not the backend implementation.
- Must NOT touch any `project-backend` file.

## Out of scope

- Backend route/agent (Plan 2 Backend).
- Capture classification (captures only need to keep rendering for history; new replies are reply-only).

## Reference

- `docs/vercel-ai-sdk.md` — `useChat`, `DefaultChatTransport`, UIMessage `parts`.
- `src/api/client.ts` + `src/api/routes.ts` — existing auth client / base URL.
- `src/layout/hooks/use-api-cursor-paginated.ts` — existing history pagination.
