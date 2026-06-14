# Plan 1 [Backend] (sync) — Agent contract & env (deep plan)

## Context

This is **Plan 1 of 3** in the `chat-agent-gemini-streaming` task. It runs **first and alone**; the two parallel Plan 2s (Backend `/chat` route + Gemini adapter, and Frontend `useChat`) both depend on the contract this plan pins down. This plan therefore **only defines shared shapes and configuration** — no runtime behavior, no SDK calls, no route wiring, no frontend.

The feature being built (across all three plans) is a **reply-only, latest-message-only, streaming** chat between the frontend and Ben's agent (Google Gemini Flash Lite via the Vercel AI SDK). Plan 1 owns three deliverables:

1. The **`AgentService` port** — an abstraction in `src/adapters/` that the future `/chat` route calls to obtain a streamed reply, keeping the Vercel AI SDK (`ai` / `@ai-sdk/google`) confined to its infra adapter (Plan 2 backend) and out of the route/adapters/domain layer.
2. The **`GOOGLE_GENERATIVE_AI_API_KEY`** env var: validated at startup in `src/infra/services/env.ts`, plus a placeholder in the dev/example env files.
3. A documented **`POST /chat` HTTP contract** in `docs/api-endpoints.md` capturing the shared request/response/auth shape both Plan 2s build against.

### Existing patterns observed (the source of truth for conventions)

- **Ports live in `src/adapters/`** as either a TypeScript `interface` (`AuthProviderService` in `src/adapters/auth-provider.ts`) or an `abstract class` (`JwtService` in `src/adapters/jwt.ts`, `Repository`-based `MessageRepository`). Payload/response types are declared as named `type` aliases above the port and exported.
- **`AuthProviderService` pattern** (the briefing says to mirror this): a single `interface`, one method, `Payload`/`Response` types named `Get…Payload` / `Get…Response`, all exported. The infra implementation (`FirebaseAuthProviderService`) lives in `src/infra/services/` and `implements` the port — it is the only place the third-party SDK (`firebase-admin`) is imported.
- **Env validation** (`src/infra/services/env.ts`): a flat `z.object` schema, `safeParse(process.env)`, throw on failure, export `env` and `Env` type. New required keys are added as `z.string()` entries.
- **Path alias** `@/*` → `./src/*` (tsconfig). Zod v4 is already a dependency. ESM (`"type": "module"`).
- **Auth** is enforced per-route by `authMiddleware` (`src/infra/http/middlewares/auth.ts`), registered in `src/infra/http/app.ts` as `app.<method>('/path', authMiddleware, handler)`. It reads headers `jwtauthenticationtoken` + `providerauthenticationtoken`, sets `req.userId`, and may emit `updatedjwtauthenticationtoken`. The `/chat` route (Plan 2) must keep this exact behavior.
- **Messages**: `Message` entity has roles `'user' | 'ben'`; `MessagePresenter.toHttp` is the wire shape; history is paginated via `GET /messages/list`. Mock reply helpers live in `src/domain/utils/messages.ts` (to be replaced by Plan 2 — out of scope here).

## Decisions

1. **Port form: `abstract class AgentService`.**
   `AuthProviderService` uses `interface`; `JwtService` and `MessageRepository` use `abstract class`. The briefing names the file `agent-provider.ts` and says "mirror the existing provider port" (`auth-provider.ts`, an interface). To honor the briefing's explicit file name and "mirror auth-provider" instruction, **use an `interface` named `AgentService`** in `src/adapters/agent-provider.ts`, matching `AuthProviderService` exactly (interface + exported `Payload`/`Response` types). This keeps the port consistent with the one the briefing pointed at.

2. **The port returns a provider-agnostic streaming result — it must NOT leak the AI SDK.**
   The route (Plan 2) will call `agentService.streamReply(payload)` and then pipe the result to the Express response. The challenge: the actual piping uses the SDK's `result.pipeUIMessageStreamToResponse(res)`. To keep the SDK out of the route, the **port returns an object exposing a single `pipeUIMessageStreamToResponse(res)` method** typed against Express's `Response`. The Gemini adapter (Plan 2) wraps the SDK's `streamText` result and satisfies this shape; the route depends only on the port's `AgentStreamResult` type, never on `ai`. This is the key contract decision that lets the two backend plans proceed in parallel without the route importing the SDK.

3. **Input to the port is a normalized "latest user message", not raw `UIMessage[]`.**
   Scope is **latest-message-only, reply-only**. The route extracts the latest user message text from the `useChat` payload and passes a minimal `{ userId, message }` payload to the port. This keeps the port domain-friendly (plain strings, no `UIMessage` type from the SDK) and matches the documented `streamText({ messages })` / `system` usage where only the current turn matters. The port does **not** receive prior turns.

4. **Persistence is the route's concern, not the port's.**
   The contract states Ben's reply is persisted on stream completion (SDK `onFinish`). That wiring belongs to Plan 2's adapter/route. Plan 1's port stays focused on "produce a streamable reply"; we document persistence in the contract and expose an optional `onFinish` hook in the payload so Plan 2 can wire persistence without changing the port signature later.

5. **Env: add `GOOGLE_GENERATIVE_AI_API_KEY` as required `z.string()`.**
   Mirrors `FIREBASE_*` / `JWT_*`. The Google provider reads this exact var name by default, but we still validate it so startup fails fast when missing (per the simple plan). No code consumes it in Plan 1 — only Plan 2's adapter will.

6. **Env files: update tracked `.env.development` + add a tracked `.env.example`.**
   The repo currently tracks only `.env.development`; `.env` is gitignored and no `.env.example` exists. The briefing asks for "env example/development files." Decision: add the key to the existing tracked `.env.development` (so dev startup keeps working) **and** create a tracked `.env.example` that lists every required key as a placeholder (the conventional "example" file the briefing refers to). `.env.example` is not matched by `.gitignore` (`node_modules`, `dist`, `.env`), so it will be tracked. Use an obvious placeholder value, not a real key.

7. **Contract doc lives in `docs/api-endpoints.md`.**
   The briefing offers a choice ("or the AI SDK doc"); `docs/api-endpoints.md` is the canonical endpoint registry and already documents the Chat screen's other routes, so the `/chat` contract belongs there alongside `POST /messages/create`. `docs/vercel-ai-sdk.md` stays the integration/usage reference and already covers the SDK mechanics.

## Files to Create / Modify

### CREATE — `project-backend/src/adapters/agent-provider.ts`

The port. Mirrors `auth-provider.ts` (interface + exported `Payload`/`Response` types). The streaming result is a narrow, SDK-free shape: the only thing the route needs is the ability to pipe a UI-message stream to an Express `Response`. The optional `onFinish` lets Plan 2 wire persistence of Ben's completed reply without a future port change.

```ts
import { Response } from 'express'

export interface AgentStreamResult {
  pipeUIMessageStreamToResponse(res: Response): void
}

export type StreamReplyOnFinishPayload = {
  text: string
}

export type StreamReplyPayload = {
  userId: string
  message: string
  onFinish?: (payload: StreamReplyOnFinishPayload) => void | Promise<void>
}

export interface AgentService {
  streamReply(payload: StreamReplyPayload): AgentStreamResult
}
```

Notes for Plan 2 (documented here, not implemented):
- `streamReply` is **synchronous** and returns immediately with a streamable handle — this matches the AI SDK's `streamText` (which is not awaited; you call `.pipeUIMessageStreamToResponse(res)` on its result). The Gemini adapter (`src/infra/services/`) will return an object whose `pipeUIMessageStreamToResponse` delegates to the SDK result's method of the same name.
- `message` is the **latest user message text only** (reply-only, latest-message-only scope). The route extracts it from the `useChat` payload before calling the port.
- `userId` comes from `req.userId` (auth context), never the body — consistent with the rest of the API.
- `onFinish` receives the full assembled reply `text` once the stream completes, where Plan 2 persists Ben's `Message`.

### MODIFY — `project-backend/src/infra/services/env.ts`

Add the validated key to the existing flat schema. Only the schema object changes.

```ts
const envSchema = z.object({
  API_PORT: z.coerce.number(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_EXPIRATION_TIME_IN_SECONDS: z.coerce.number(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
})
```

Everything else in the file (`safeParse`, throw, `export const env`, `export type Env`) is unchanged.

### MODIFY — `project-backend/.env.development`

Append the key with a dev placeholder (the dev server loads this file via `dotenv` when `NODE_ENV=development`). Add at the end of the file:

```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### CREATE — `project-backend/.env.example`

A tracked example listing every required key with placeholder values (no real secrets). Mirrors the keys validated in `env.ts`:

```
API_PORT=3333
NODE_ENV=development
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_PRIVATE_KEY=your-jwt-secret
JWT_EXPIRATION_TIME_IN_SECONDS=604800
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### MODIFY — `docs/api-endpoints.md`

Add a new subsection under the **`Tela: Chat (home)`** section (after `POST /messages/create-audio`, alongside the other chat routes) documenting the shared `POST /chat` contract. Proposed content (matches the project's existing pt-BR doc voice, references the AI SDK doc for mechanics):

```md
- **`POST /chat`** (streaming)
  - Rota de chat em streaming consumida pelo hook `useChat` do `@ai-sdk/react` no frontend. Escopo v1: **reply-only** e **latest-message-only** — o Ben só responde à última mensagem do usuário, sem classificação de captura e sem contexto multi-turn no request.
  - **Auth:** mesmos headers das demais rotas (`jwtauthenticationtoken` + `providerauthenticationtoken`), via `authMiddleware`. O `userId` vem do contexto de auth, nunca do body.
  - **Request body:** o payload que o `useChat` envia (protocolo de mensagens da UI do AI SDK) — uma lista de mensagens em `messages` onde cada item é um `UIMessage` com `role` e `parts[]`. O servidor lê **apenas a última mensagem do usuário** (concatenando suas `parts` de texto) e ignora o histórico anterior. O histórico para semear a conversa continua vindo de `GET /messages/list`.
  - **Response:** um **stream de mensagens da UI** (não um JSON único), produzido via `result.pipeUIMessageStreamToResponse(res)` do AI SDK e consumido pelo `useChat`. O reply do Ben é persistido (como `Message` com `role: 'ben'`) quando o stream termina (`onFinish`).
  - **Provider:** Google Gemini Flash Lite via Vercel AI SDK, isolado atrás do port `AgentService` (`src/adapters/agent-provider.ts`) — a rota nunca importa o SDK diretamente. Detalhes de integração em `docs/vercel-ai-sdk.md`.
```

## Contract reference tables (the shared agreement)

### `POST /chat` — request

| Aspect | Value |
| --- | --- |
| Method / path | `POST /chat` |
| Auth | `authMiddleware` — headers `jwtauthenticationtoken` + `providerauthenticationtoken`; sets `req.userId`; may set `updatedjwtauthenticationtoken` |
| Body | The `@ai-sdk/react` `useChat` payload: `{ messages: UIMessage[] }` (each `UIMessage` = `{ role, parts[] }`) |
| Server reads | **Latest user message only** — text concatenated from its `parts[]` where `part.type === 'text'`; prior turns ignored |
| `userId` source | Auth context (`req.userId`), never the body |
| Scope | Reply-only, latest-message-only, no capture classification, no multi-turn |

### `POST /chat` — response

| Aspect | Value |
| --- | --- |
| Type | Streamed **UI message protocol** (not a single JSON payload) |
| Mechanism | `result.pipeUIMessageStreamToResponse(res)` (AI SDK), surfaced via the `AgentStreamResult` port type |
| Consumer | Frontend `useChat` (renders tokens live) |
| Persistence | Ben's full reply persisted as a `Message` (`role: 'ben'`) on stream completion (`onFinish`) |
| History seeding | Unchanged — `GET /messages/list` still loads paginated history |

### `AgentService` port — shape

| Member | Type | Meaning |
| --- | --- | --- |
| `streamReply(payload)` | `(StreamReplyPayload) => AgentStreamResult` | Synchronous; returns a streamable handle |
| `StreamReplyPayload.userId` | `string` | From auth context |
| `StreamReplyPayload.message` | `string` | Latest user message text only |
| `StreamReplyPayload.onFinish?` | `(payload: { text }) => void \| Promise<void>` | Fires when the stream completes; where Plan 2 persists Ben's reply |
| `AgentStreamResult.pipeUIMessageStreamToResponse(res)` | `(express.Response) => void` | Pipes the UI message stream; SDK stays behind this |

## Existing Code to Reuse

- **`src/adapters/auth-provider.ts`** — the exact structural template for `agent-provider.ts` (interface + exported `Payload`/`Response` types, no SDK import).
- **`src/infra/services/env.ts`** — extended in place; do not change its parse/throw/export structure.
- **`express` `Response` type** — already a dependency (`@types/express`); imported by the port to type `pipeUIMessageStreamToResponse` without pulling in the AI SDK.
- **`docs/vercel-ai-sdk.md`** — referenced (not duplicated) from the contract for SDK mechanics (`streamText`, `pipeUIMessageStreamToResponse`, `useChat`, model `gemini-2.5-flash-lite`).
- **`authMiddleware` (`src/infra/http/middlewares/auth.ts`)** — referenced in the contract as the auth the `/chat` route must keep; not modified here.

## Out of Scope (owned by parallel Plan 2s)

- The Gemini adapter implementing `AgentService` in `src/infra/services/` (imports `ai` / `@ai-sdk/google`, calls `streamText`, wraps the result). — Plan 2 Backend.
- The `POST /chat` route in `src/infra/http/routes/chat.ts` and its registration in `src/infra/http/app.ts` (with `authMiddleware`). — Plan 2 Backend.
- Replacing the mock helpers in `src/domain/utils/messages.ts` and persisting Ben's streamed reply. — Plan 2 Backend.
- Installing `ai` / `@ai-sdk/google` / `@ai-sdk/react` and any frontend `useChat` wiring. — Plan 2 Backend / Frontend.
- Capture classification and multi-turn context — deferred entirely.

## Boundary / Parallel-safety notes

- Plan 1 touches **only** files it owns: `src/adapters/agent-provider.ts` (new), `src/infra/services/env.ts` (one schema line), `.env.development` (one line), `.env.example` (new), `docs/api-endpoints.md` (new subsection). None of these are owned by Plan 2.
- No `npm install` here — Plan 1 imports only `express` (already present) and `zod` (already present). The `ai`/`@ai-sdk/*` installs belong to the Plan 2s, keeping their dependency footprint out of this plan and avoiding lockfile churn before the parallel plans run.
- **No formatting step** (`npm run lint:fix`) — formatting is run once after all parallel plans finish.

## Verification

Run from `project-backend` (no lint here):

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```

Expected: clean (no type errors). The port file must compile with the `express` `Response` import and export `AgentService`, `AgentStreamResult`, `StreamReplyPayload`, `StreamReplyOnFinishPayload`. `env.ts` must still type-check and `Env` must now include `GOOGLE_GENERATIVE_AI_API_KEY: string`.

Manual checks:
- `agent-provider.ts` imports nothing from `ai` / `@ai-sdk/*` (SDK isolation verified by inspection).
- `.env.example` lists every key in `envSchema`; `.env.development` contains `GOOGLE_GENERATIVE_AI_API_KEY`.
- `docs/api-endpoints.md` contains the `POST /chat` subsection under the Chat screen section.
