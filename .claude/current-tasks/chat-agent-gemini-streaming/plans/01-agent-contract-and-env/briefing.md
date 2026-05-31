# Plan 1 [Backend] (sync) — Agent contract & env

**Plan line:** Plan 1 [Backend] (sync)

## Goal

Pin down the shared contract that the backend `/chat` route and the frontend `useChat` will both depend on, define the agent port, and validate the Gemini API key. This plan runs first and alone; both Plan 2 plans depend on its output.

## Scope

1. Define the `POST /chat` HTTP contract that both sides share:
   - Request body: the message payload sent by `@ai-sdk/react`'s `useChat` (UIMessage(s)). Scope is reply-only and latest-message-only.
   - Response: a UI message stream (`pipeUIMessageStreamToResponse`).
   - Auth: the existing JWT auth header / middleware behavior the route must keep.
2. Define the `AgentService` port (interface) in `src/adapters/` that the route will use to obtain the streamed reply, keeping the Vercel AI SDK confined to the infra implementation (Plan 2 backend).
3. Add and validate `GOOGLE_GENERATIVE_AI_API_KEY` in `src/infra/services/env.ts`, and add it to the env example/development files.

## Files owned

- `project-backend/src/adapters/agent-provider.ts` (new — the port).
- `project-backend/src/infra/services/env.ts` (add the env var).
- `project-backend` env example/development files (add the key placeholder).
- A short "POST /chat contract" note in `docs/api-endpoints.md` (or the AI SDK doc) capturing the shared shape.

## Dependencies

- None. Must finish and be approved before Plan 2 (Backend) and Plan 2 (Frontend) start.

## Out of scope

- The Gemini implementation and the route (Plan 2 Backend).
- The frontend (Plan 2 Frontend).
- Capture classification, multi-turn context (latest message only).

## Reference

- `docs/vercel-ai-sdk.md` — AI SDK + Gemini streaming usage.
- `src/adapters/auth-provider.ts` — existing port pattern to mirror.
