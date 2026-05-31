# Plan 2 [Backend] (parallel) — Gemini streaming agent & `/chat` route (deep plan)

## Context

This is **Plan 2 of 3** in the `chat-agent-gemini-streaming` task. It runs **in parallel** with the Frontend plan, after **Plan 1 (sync)** has pinned the shared contract. Plan 1 owns and ships (before this plan runs):

- The **`AgentService` port** at `src/adapters/agent-provider.ts` (interface + exported `Payload`/`Response` types, **SDK-free**). Its exact shape (consumed verbatim here):

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

- The **`GOOGLE_GENERATIVE_AI_API_KEY`** env var, validated as a required `z.string()` in `src/infra/services/env.ts` (so `env.GOOGLE_GENERATIVE_AI_API_KEY: string` exists), plus `.env.development` / `.env.example` placeholders.
- The documented **`POST /chat`** HTTP contract in `docs/api-endpoints.md`.

This plan implements the **runtime behavior** behind that contract: the Gemini Flash Lite adapter, the persisting `POST /chat` route, its registration in `app.ts`, and reconciling the mock persistence helpers. The feature scope is **reply-only, latest-message-only, streaming** (no capture classification, no multi-turn context).

### Existing patterns observed (source of truth for conventions)

- **Infra adapters** (`src/infra/services/firebase-auth-provider.ts`): a class `implements` the port from `src/adapters/`, imports the third-party SDK (`firebase-admin`) **only here**, and reads config from `./env`. The Gemini adapter mirrors this exactly: it is the **only** file importing `ai` / `@ai-sdk/google`.
- **Routes** (`src/infra/http/routes/messages.ts`): module-level singleton wiring (`new InMemoryMessageRepository()`, use cases) at the top; each handler is `async (req, res, next)`, `try/catch` with `next(err)`, Zod-parses input, reads `req.userId` (never the body), returns via a `*Presenter`. `HttpStatus` from `@/modules/utils/http`.
- **Route registration** (`src/infra/http/app.ts`): `app.<method>('/path', authMiddleware, handler)`; `errorHandler` registered last.
- **Auth** (`src/infra/http/middlewares/auth.ts`): sets `req.userId` from validated headers; the type augmentation `Request.userId: string` is declared there (global). `/chat` reuses `authMiddleware` as-is — no changes to auth.
- **Persistence**: `MessageRepository extends Repository<Message>`; `repository.create(props)` takes the full `MessageProps` (`{ userId, role, content, capture, createdAt }`) and returns a `Message`. The current `CreateMessageUseCase` creates a `user` message then a `ben` message (mock reply) in one synchronous call; `MessagePresenter.toHttp` is the wire shape; history paginates via `GET /messages/list` (ordered `createdAt desc`).
- **Mock helpers** (`src/domain/utils/messages.ts`): `generateBenReply(content)` (string) and `generateCaptureFromExchange(content)` (`MessageCapture | null`, currently always `null`). The streamed agent **replaces** `generateBenReply`; capture stays `null`.
- **`Message` entity**: roles `'user' | 'ben'`; `MessageProps.capture: MessageCapture | null`; `createdAt: Date`.
- **Module system / aliases**: ESM (`"type": "module"`), path alias `@/*` → `./src/*`, Zod v4 present, `tsx` dev runner, `express` 5.

### Coding conventions to honor (from `code-write-code`)

- English, **no comments**, self-explanatory names; descriptive booleans (`isX`, `shouldX`).
- **No destructuring in `const` declarations** — use `object.property` access (e.g. `payload.userId`, not `const { userId } = payload`). The one principled exception is the SDK callback signature `onFinish: ({ text }) => ...`, which is a function parameter (the SDK's own destructured shape), not a `const` declaration — kept to match `docs/vercel-ai-sdk.md`.

## Decisions

1. **Adapter file name & class: `GeminiAgentProviderService` in `src/infra/services/gemini-agent-provider.ts`.**
   Matches the briefing's owned-files list and the `FirebaseAuthProviderService` naming (`<Provider>...Service`, `implements` the port). It is the sole importer of `ai` / `@ai-sdk/google`.

2. **Explicit provider instance via `createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })`.**
   `docs/vercel-ai-sdk.md` shows both the default-env form and the explicit form. We use the **explicit** form so the key flows through the validated `env` object (consistent with how `FirebaseAuthProviderService` reads `env.FIREBASE_*`) and fails fast at startup if missing. The provider instance + model (`gemini-2.5-flash-lite`) are created once at module scope inside the adapter file.

3. **`streamReply` is synchronous and wraps the `streamText` result.**
   Per Plan 1's contract, `streamReply(payload): AgentStreamResult` is **not** `async`. `streamText(...)` is called (not awaited) and returns a result object that already exposes `pipeUIMessageStreamToResponse`. The adapter returns `{ pipeUIMessageStreamToResponse: (res) => result.pipeUIMessageStreamToResponse(res) }`, satisfying the `AgentStreamResult` shape while keeping the SDK type out of the port. The port's `onFinish` is forwarded straight into `streamText`'s `onFinish`.

4. **Latest-message-only `prompt`, concise Ben `system` prompt.**
   The port hands the adapter a single `message: string` (the latest user message text). The adapter passes it as `prompt` (single-turn) to `streamText`, with a `system` prompt establishing Ben's persona: concise, reply-only, no prior context. No `messages[]` array — scope is explicitly single-turn.

5. **The route extracts the latest user message text from the `useChat` payload itself** — the SDK `UIMessage` shape stays out of the port.
   `useChat` POSTs `{ messages: UIMessage[] }` where each message is `{ role, parts: [{ type, text? }, ...] }`. The route reads the **last** message with `role === 'user'`, concatenates its text parts (`part.type === 'text'`), and passes that plain string as `StreamReplyPayload.message`. The `UIMessage` body is validated with a **minimal local Zod schema** in the route (only the fields we read), so the route does not import any SDK type and stays resilient to extra fields. If no user text is found → `400` via the error handler.

6. **Persistence orchestration lives in a new use case `StreamChatMessageUseCase`, not inline in the route.**
   The existing `CreateMessageUseCase` is synchronous (creates both messages eagerly) and serves the non-streaming `POST /messages/create` — it must keep working unchanged (it is still wired in `messages.ts`). For `/chat`, persistence is split across the stream lifecycle: the **user** message is persisted **before** streaming; the **ben** message is persisted in `onFinish` with the assembled `text`. A dedicated use case keeps the repository access in the domain layer (consistent with `messages.ts` wiring) and keeps the route thin. The use case exposes two methods: `persistUserMessage({ userId, content })` and `persistBenMessage({ userId, content })` (capture `null`), each returning the created `Message`. Both go through the **same** `MessageRepository.create` path, so `/chat` and `/messages/create` history stay uniform and `GET /messages/list` sees both.

7. **`createdAt` ordering: ben message timestamp strictly after the user message.**
   `GET /messages/list` orders by `createdAt desc`; the mock `CreateMessageUseCase` already uses `userCreatedAt + 1ms` for the ben message to guarantee deterministic ordering. The `/chat` flow persists the ben message in `onFinish` (real wall-clock time, always later than the user message persisted before streaming), so natural `new Date()` ordering is already correct — no manual offset needed. The user message uses `new Date()` at persist time; the ben message uses `new Date()` in `onFinish`.

8. **Repository singleton sharing.**
   `messages.ts` instantiates its own `new InMemoryMessageRepository()` at module scope. The in-memory repo holds state in instance memory, so a **separate** instance in `chat.ts` would not share history with `/messages/list`. To keep `/chat`-persisted messages visible to `GET /messages/list`, the repository instance must be **shared**. Decision: extract a single shared repository instance into a small module `src/infra/http/repositories.ts` (exports `messageRepository`) and have **both** `messages.ts` and `chat.ts` import it. This is the minimal change that keeps history consistent across both routes. (`messages.ts` is owned by this plan per the briefing's "persistence orchestration" scope.)

   - **Open the question** below if a shared-repository module is considered out-of-scope; otherwise proceed with `repositories.ts`.

9. **Mock helper cleanup.**
   `generateBenReply` is replaced by the real streamed agent and becomes dead code for `/chat`. It is **still used** by `CreateMessageUseCase` (the non-streaming `/messages/create` route), which remains in scope. Decision: **keep `generateBenReply` and `generateCaptureFromExchange`** as-is for `/messages/create`, and do **not** route `/chat` through them. Repurposing is limited to a clarifying note; capture generation stays the empty `generateCaptureFromExchange` placeholder (returns `null`) and `/chat` persists ben messages with `capture: null` directly. No deletion, to avoid breaking the still-live `/messages/create` flow. (If the intent is to retire `/messages/create` entirely, that is a separate decision — flagged below.)

10. **Streaming + error handling.**
    `streamText` errors surface either synchronously (rare) or during the piped stream. Pre-stream work (header validation, extracting the message, persisting the user message) is wrapped in `try/catch` → `next(err)` like every other route. Once `pipeUIMessageStreamToResponse(res)` is called, the response is owned by the SDK; we do not also call `next` or send JSON. The user message is persisted **before** piping, so a mid-stream failure still leaves the user's turn recorded.

## Files to Create / Modify

### ADD DEPENDENCIES — `project-backend/package.json`

Install in `project-backend` (per `docs/vercel-ai-sdk.md`):

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npm install ai @ai-sdk/google
```

Adds `ai` (core, provider-agnostic) and `@ai-sdk/google` (Gemini provider) to `dependencies`. `zod` is already present (the SDK reuses it). **Do not** install `@ai-sdk/react` here (frontend-only). No frontend files touched.

### CREATE — `project-backend/src/infra/services/gemini-agent-provider.ts`

The infra adapter. Sole importer of the SDK. Implements Plan 1's `AgentService`. Mirrors `firebase-auth-provider.ts` (class `implements` port, reads `env`, SDK confined here).

```ts
import {
  AgentService,
  AgentStreamResult,
  StreamReplyPayload,
} from '@/adapters/agent-provider'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { env } from './env'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const model = google('gemini-2.5-flash-lite')

const BEN_SYSTEM_PROMPT = [
  'You are Ben, a concise, friendly personal assistant.',
  'Reply to the latest user message only, in one or two short sentences.',
  'Do not ask follow-up questions unless strictly necessary.',
  'Acknowledge what the user said naturally, without inventing details.',
].join(' ')

export class GeminiAgentProviderService implements AgentService {
  streamReply(payload: StreamReplyPayload): AgentStreamResult {
    const result = streamText({
      model,
      system: BEN_SYSTEM_PROMPT,
      prompt: payload.message,
      onFinish: ({ text }) => payload.onFinish?.({ text }),
    })

    return {
      pipeUIMessageStreamToResponse: (res) =>
        result.pipeUIMessageStreamToResponse(res),
    }
  }
}
```

Notes:
- `payload.onFinish?.({ text })` forwards the assembled reply text to the route's persistence callback (the only place ben messages are saved for `/chat`). The `?.` guards the optional port hook.
- `onFinish: ({ text }) => ...` is the SDK's own destructured callback parameter (documented form), not a `const` destructure — allowed.
- The SDK result type is never named in the return; the returned object literal structurally satisfies `AgentStreamResult`, so the SDK type does not leak past this file.

### CREATE — `project-backend/src/infra/http/repositories.ts`

Single shared in-memory repository instance so `/chat` and `/messages/*` see the same history (Decision 8).

```ts
import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'

export const messageRepository = new InMemoryMessageRepository()
```

### MODIFY — `project-backend/src/infra/http/routes/messages.ts`

Replace the local repository instantiation with the shared one. Only the wiring lines change; handlers are untouched.

```ts
import { CreateMessageUseCase } from '@/domain/use-cases/messages/create-message'
import { ListMessagesUseCase } from '@/domain/use-cases/messages/list-messages'
import { MessagePresenter } from '@/infra/http/presenters/message-presenter'
import { messageRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
```

Remove the `import { InMemoryMessageRepository } ...` line and the `const messageRepository = new InMemoryMessageRepository()` line; keep:

```ts
const listMessagesUseCase = new ListMessagesUseCase(messageRepository)
const createMessageUseCase = new CreateMessageUseCase(messageRepository)
```

### CREATE — `project-backend/src/domain/use-cases/messages/stream-chat-message.ts`

Persistence orchestration for the streaming flow, kept in the domain layer like the other message use cases. Two methods so the route can persist the user message before streaming and the ben message in `onFinish`. Capture stays `null` (placeholder).

```ts
import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'

interface PersistMessagePayload {
  userId: string
  content: string
}

export class StreamChatMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async persistUserMessage(payload: PersistMessagePayload): Promise<Message> {
    return this.messageRepository.create({
      userId: payload.userId,
      role: 'user',
      content: payload.content,
      capture: null,
      createdAt: new Date(),
    })
  }

  async persistBenMessage(payload: PersistMessagePayload): Promise<Message> {
    return this.messageRepository.create({
      userId: payload.userId,
      role: 'ben',
      content: payload.content,
      capture: null,
      createdAt: new Date(),
    })
  }
}
```

### CREATE — `project-backend/src/infra/http/routes/chat.ts`

Authenticated streaming route. Validates the `useChat` body with a minimal local schema, extracts the latest user message text, persists it, then streams Ben's reply, persisting the reply in `onFinish`.

```ts
import { GeminiAgentProviderService } from '@/infra/services/gemini-agent-provider'
import { StreamChatMessageUseCase } from '@/domain/use-cases/messages/stream-chat-message'
import { messageRepository } from '@/infra/http/repositories'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        parts: z.array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        ),
      }),
    )
    .min(1),
})

const agentService = new GeminiAgentProviderService()
const streamChatMessageUseCase = new StreamChatMessageUseCase(messageRepository)

function extractLatestUserMessageText(
  messages: z.infer<typeof chatBodySchema>['messages'],
): string | null {
  const userMessages = messages.filter((message) => message.role === 'user')
  const latestUserMessage = userMessages[userMessages.length - 1]

  if (!latestUserMessage) {
    return null
  }

  const text = latestUserMessage.parts
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
    .trim()

  return text.length > 0 ? text : null
}

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const body = chatBodySchema.parse(req.body)
    const message = extractLatestUserMessageText(body.messages)

    if (!message) {
      return res.status(400).json({ message: 'No user message provided.' })
    }

    await streamChatMessageUseCase.persistUserMessage({
      userId: req.userId,
      content: message,
    })

    const result = agentService.streamReply({
      userId: req.userId,
      message,
      onFinish: async ({ text }) => {
        await streamChatMessageUseCase.persistBenMessage({
          userId: req.userId,
          content: text,
        })
      },
    })

    result.pipeUIMessageStreamToResponse(res)
  } catch (err) {
    next(err)
  }
}
```

Notes:
- The 400 uses a literal status (the project also exposes `HttpStatus` from `@/modules/utils/http`; use `HttpStatus.BAD_REQUEST` if such a member exists — verify against `@/modules/utils/http` during implementation and prefer the enum for consistency with `messages.ts`).
- `req.userId` comes from `authMiddleware` (the global `Request.userId` augmentation is already declared in `auth.ts`); never from the body.
- After `pipeUIMessageStreamToResponse(res)` the response is owned by the SDK; no further `res`/`next` calls on the happy path.
- `onFinish` is `async` and awaited internally by the SDK before the stream closes (persists the ben message); the route does not await it.

### MODIFY — `project-backend/src/infra/http/app.ts`

Register `POST /chat` with `authMiddleware`, alongside the other authenticated routes.

```ts
import { authMiddleware } from '@/infra/http/middlewares/auth'
import { errorHandler } from '@/infra/http/middlewares/error-handler'
import { loginOrRegister } from '@/infra/http/routes/auth'
import { chat } from '@/infra/http/routes/chat'
import { createMessage, listMessages } from '@/infra/http/routes/messages'
import { HttpStatus } from '@/modules/utils/http'
import cors from 'cors'
import Express, { json, urlencoded } from 'express'
```

And in the route block:

```ts
app.get('/messages/list', authMiddleware, listMessages)
app.post('/messages/create', authMiddleware, createMessage)
app.post('/chat', authMiddleware, chat)
```

`errorHandler` stays last. No change to CORS / body parsers (`json` already parses the `useChat` payload).

### MODIFY (clarifying note only) — `project-backend/src/domain/utils/messages.ts`

No functional change. `generateBenReply` / `generateCaptureFromExchange` remain for the still-live `POST /messages/create` flow (Decision 9). `/chat` does not use them; capture generation stays the empty placeholder (returns `null`). If `/messages/create` is later retired, these helpers and `CreateMessageUseCase` can be removed — out of scope here.

## Existing Code to Reuse

- **`src/adapters/agent-provider.ts`** (Plan 1) — the `AgentService` port + `AgentStreamResult` / `StreamReplyPayload` / `StreamReplyOnFinishPayload` types. Consumed verbatim; not redefined.
- **`src/infra/services/firebase-auth-provider.ts`** — structural template for the Gemini adapter (class `implements` port, reads `env`, SDK confined to the file).
- **`src/infra/services/env.ts`** (extended by Plan 1) — `env.GOOGLE_GENERATIVE_AI_API_KEY` read by the adapter.
- **`src/infra/http/middlewares/auth.ts`** — `authMiddleware` reused as-is; provides `req.userId` and the global `Request.userId` type.
- **`src/adapters/repositories/message-repository.ts` + `in-memory-message-repository.ts`** — `MessageRepository.create(props)` persists user + ben messages.
- **`src/domain/entities/message.ts`** — `Message` / `MessageProps` (`role: 'user' | 'ben'`, `capture: MessageCapture | null`).
- **`src/infra/http/routes/messages.ts`** — route handler conventions (try/catch + `next(err)`, Zod parse, `req.userId`, module-scope wiring).
- **`docs/vercel-ai-sdk.md`** — `streamText`, model `gemini-2.5-flash-lite`, `createGoogleGenerativeAI`, `pipeUIMessageStreamToResponse`, `onFinish`.
- **`@/modules/utils/http` `HttpStatus`** — for status codes (verify `BAD_REQUEST` member before use).

## Contracts / Tables

### `POST /chat` — behavior implemented here (matches Plan 1 contract)

| Aspect | Value |
| --- | --- |
| Method / path | `POST /chat`, registered with `authMiddleware` in `app.ts` |
| Auth | `authMiddleware` → `req.userId`; `userId` never from body |
| Request body | `{ messages: UIMessage[] }` from `useChat`; validated by a minimal local Zod schema (only `role` + `parts[].{type,text?}`) |
| Server reads | Latest `role === 'user'` message; text = concatenated `parts` where `part.type === 'text'`; prior turns ignored |
| User persistence | Before streaming, via `StreamChatMessageUseCase.persistUserMessage` (`role: 'user'`, `capture: null`, `createdAt: now`) |
| Stream | `agentService.streamReply({ userId, message, onFinish }).pipeUIMessageStreamToResponse(res)` |
| Ben persistence | In `onFinish({ text })` → `persistBenMessage` (`role: 'ben'`, `capture: null`, `createdAt: now`) |
| Empty/no user text | `400` JSON `{ message }` before streaming |
| Provider | Gemini `gemini-2.5-flash-lite` via Vercel AI SDK, confined to `gemini-agent-provider.ts` |

### `AgentService` port consumption

| Member | Used as |
| --- | --- |
| `streamReply(payload)` | Called synchronously in the route; returns `AgentStreamResult` |
| `StreamReplyPayload.userId` | `req.userId` |
| `StreamReplyPayload.message` | Latest user message text (route-extracted) |
| `StreamReplyPayload.onFinish` | Persists ben message with assembled `text` |
| `AgentStreamResult.pipeUIMessageStreamToResponse(res)` | Pipes the UI message stream to the Express `res` |

### Files

| File | Action |
| --- | --- |
| `project-backend/package.json` | Add `ai`, `@ai-sdk/google` |
| `src/infra/services/gemini-agent-provider.ts` | CREATE — Gemini adapter implementing `AgentService` |
| `src/infra/http/repositories.ts` | CREATE — shared `messageRepository` singleton |
| `src/domain/use-cases/messages/stream-chat-message.ts` | CREATE — persist user/ben messages for `/chat` |
| `src/infra/http/routes/chat.ts` | CREATE — authenticated streaming route |
| `src/infra/http/routes/messages.ts` | MODIFY — use shared `messageRepository` |
| `src/infra/http/app.ts` | MODIFY — register `POST /chat` |
| `src/domain/utils/messages.ts` | No functional change (clarifying note) |

## Boundary / Parallel-safety notes

- Touches **only** `project-backend`. No `project-web` / `project-design` files.
- Does **not** modify Plan 1's owned files (`agent-provider.ts`, `env.ts`, `.env.*`, `docs/api-endpoints.md`) — it only **imports** the port and `env`. This plan assumes Plan 1 has already merged (sync dependency).
- Does **not** depend on any file owned by the Frontend plan; the route reads the `useChat` body via its own local Zod schema, not a shared frontend type.
- **No `npm run lint:fix`** here — formatting runs once after all parallel plans finish.

## Verification

Run from `project-backend`:

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```

Expected: clean. The adapter must type-check against `AgentService` (Plan 1's port must be present); `streamText`'s result must structurally satisfy `pipeUIMessageStreamToResponse(res: Response)`; `env.GOOGLE_GENERATIVE_AI_API_KEY` must exist (Plan 1).

Inspection checks:
- `gemini-agent-provider.ts` is the **only** file importing `ai` / `@ai-sdk/google` (`grep -rn "@ai-sdk\|from 'ai'" src` returns only that file).
- `chat.ts` imports nothing from `ai` / `@ai-sdk/*`; it depends only on the port-backed `GeminiAgentProviderService`, the use case, and the shared repo.
- `app.ts` has `app.post('/chat', authMiddleware, chat)` and `errorHandler` is still last.
- `messages.ts` and `chat.ts` import the **same** `messageRepository` from `@/infra/http/repositories`.

Manual smoke of the streaming endpoint (dev server, real Gemini key in `.env.development`):

```bash
cd /home/fael/so/repos/ben-prototype/project-backend && npm run dev
```

Then (replace tokens with valid auth headers; `userId` comes from auth):

```bash
curl -N -X POST http://localhost:3333/chat \
  -H 'Content-Type: application/json' \
  -H 'jwtauthenticationtoken: <jwt>' \
  -H 'providerauthenticationtoken: <firebase-token>' \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Remind me to call the dentist tomorrow."}]}]}'
```

Expected:
- A **streamed** UI-message-protocol response (tokens arrive incrementally; `-N` disables curl buffering), not a single JSON blob.
- After the stream ends, `GET /messages/list` (same auth) returns both the new `user` message and the new `ben` message (the streamed reply text), ordered with the ben message most recent.
- Missing/empty user text → `400 { "message": "No user message provided." }` and nothing persisted as a ben message.
- Missing auth headers → handled by `authMiddleware` → `errorHandler` (same as other routes).

## Open questions (ask before implementing if unresolved)

1. **Shared repository module (`src/infra/http/repositories.ts`).** The in-memory repo is per-instance, so `/chat` and `/messages/list` only share history if they share the instance. This plan extracts a shared singleton and updates `messages.ts` to use it. If introducing `repositories.ts` (and editing `messages.ts` wiring) is considered out of this plan's scope, the alternative is that `/chat` history is invisible to `/messages/list` until a real (shared) datastore exists — confirm which is intended.
2. **Fate of `POST /messages/create`.** It remains live and still uses the mock `generateBenReply`. The briefing says "retire or repurpose the mock reply helpers that the real streamed agent now replaces." This plan keeps them because `/messages/create` still calls them. Confirm whether `/messages/create` should be retired (then the helpers + `CreateMessageUseCase` can be removed) or kept alongside `/chat`.
