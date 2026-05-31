# Plan 2 [Backend] (parallel) — Gemini streaming agent & /chat route

**Plan line:** Plan 2 [Backend] (parallel)

## Goal

Implement the Gemini Flash Lite streaming agent behind the `AgentService` port from Plan 1, and expose the persisting `POST /chat` route. Runs in parallel with the frontend plan; touches only `project-backend` files.

## Scope

1. Install `ai` and `@ai-sdk/google` in `project-backend`.
2. Implement the Gemini agent in `src/infra/services/` against the `AgentService` port, using `streamText` with model `gemini-2.5-flash-lite` and a Ben system prompt (reply-only, latest message only).
3. Create `src/infra/http/routes/chat.ts`:
   - Authenticated (reuse `authMiddleware`).
   - Persist the incoming user message via the message repository.
   - Call the agent to `streamText` the reply and pipe it with `pipeUIMessageStreamToResponse(res)`.
   - In `onFinish`, persist Ben's message (capture stays `null`).
4. Register `POST /chat` in `src/infra/http/app.ts`.
5. Clean up / repurpose the mock reply helpers in `src/domain/utils/messages.ts` as needed.

## Files owned

- `project-backend/package.json` (add deps).
- `project-backend/src/infra/services/gemini-agent-provider.ts` (new).
- `project-backend/src/infra/http/routes/chat.ts` (new).
- `project-backend/src/infra/http/app.ts` (register route).
- `project-backend/src/domain/use-cases/messages/*` and `src/domain/utils/messages.ts` (persistence orchestration / mock cleanup).

## Dependencies

- Plan 1 (port `AgentService`, `/chat` contract, env var). Do not redefine the port or env — consume them.
- Must NOT touch any `project-web` file.

## Out of scope

- Frontend changes.
- Capture classification, multi-turn context.

## Reference

- `docs/vercel-ai-sdk.md` — streaming from Express, model id, env var.
- `src/infra/services/firebase-auth-provider.ts` — existing infra adapter pattern.
- `src/infra/http/routes/messages.ts` — existing route + repository wiring pattern.
