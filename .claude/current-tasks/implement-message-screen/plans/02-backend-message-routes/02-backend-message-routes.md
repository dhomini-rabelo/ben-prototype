# Plan 2 (Deep) — Backend Message Routes (Text MVP)

Deep, code-level implementation plan for the Text-MVP message/chat backend in `project-backend`. It mirrors the existing `auth` flow's layering precisely: domain entity → repository port + in-memory implementation → use-cases → http route handlers + presenters → router registration in `app.ts`.

This plan is implementation-ready but contains **no implementation** — it is the blueprint. It only touches `project-backend` files this plan owns and touches **no** `project-web` file. No formatting step (`npm run lint:fix`) is part of this plan.

---

## 1. Context

### What exists today

The backend (`project-backend`) is an Express 5 + TypeScript + Zod app built around a small DDD-flavored kernel in `src/modules/domain`:

- **Entity kernel** (`src/modules/domain/entity/entity.ts`): `Entity<Props>` holds `props` + an `ID`; subclasses expose static `create(props)` and `reference(id, props)`. `getProp(name)` returns props plus `id`.
- **ID** (`src/modules/domain/entity/id.ts`): UUID wrapper, `toValue()`, `isEqual()`.
- **Repository port + in-memory base** (`src/modules/domain/repository/repository.ts`): abstract `Repository<Entity>` declares the full CRUD/query surface; `InMemoryRepository<Entity>` implements it with an in-process array, a `compare()` matcher, and `applyQueryParams()` for `orderBy`/`order`/`limit`/`page`.
- **Query objects** (`src/modules/domain/repository/queries.ts`): `GreaterQuery`, `LowerOrEqualQuery`, etc. used as prop values in `findMany`. `LowerOrEqualQuery`/`GreaterQuery` already support `Date` comparison — exactly what a `before` cursor needs.
- **Domain errors** (`src/modules/domain/domain-errors.ts`): `DomainError` (with `DangerErrors` → HTTP status map in the error handler) and `ValidationError`.

The **auth slice** is the template to mirror, end to end:

| Layer | File |
| --- | --- |
| Entity | `src/domain/entities/user.ts` |
| Use-case | `src/domain/use-cases/auth/login-or-register.ts`, `.../verify-authentication.ts` |
| Repo port | `src/adapters/repositories/user-repository.ts` |
| Repo impl | `src/adapters/repositories/in-memory-user-repository.ts` |
| Presenter | `src/infra/http/presenters/user-presenter.ts` |
| Route handler | `src/infra/http/routes/login-or-register.ts` |
| Auth middleware | `src/infra/http/middlewares/auth.ts` (sets `req.userId`) |
| Registration | `src/infra/http/app.ts` |
| Error handler | `src/infra/http/error-handler.ts` (Zod + Domain errors → status) |

Key observed conventions to copy verbatim:
- Handlers instantiate their own dependencies at module scope (repo + use-case), then `try { ... } catch (err) { next(err) }`.
- Input is validated with a `zod` schema (`z.object`), `userId` comes from `req.userId` (set by `authMiddleware`), **never** from body/query.
- Presenters are static classes exposing `toHttp(entity)` returning a plain DTO; `id` is `entity.id.toValue()`.
- `@/*` path alias → `./src/*` (tsconfig `paths`).
- No code comments; descriptive names; `payload.x` access over destructuring (per `code-write-code` general practices).

### What this change achieves

A working Text-MVP chat API behind auth:
- `GET /messages/list` — paginated, latest-first message history for the authenticated user, with a `before` cursor.
- `POST /messages/create` — persist the user's text message, generate + persist Ben's (stubbed) reply, return both plus an optional `capture` reference.

---

## 2. Decisions

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | `Message` is a plain `Entity` (not `AggregateRoot`), like `User`. | Auth's `User` extends `Entity`; mirror it. No aggregate behavior needed. |
| D2 | `userId` stored on `MessageProps` as a **string** (the JWT subject / `req.userId`), not an `ID`. | `req.userId` is a string; `InMemoryRepository.compare()` matches plain string equality fine; avoids ID-wrapping ceremony the repo doesn't require for foreign keys. |
| D3 | `role` typed as `'user' \| 'ben'`; `capture` typed as an optional structured prop on the **Ben** reply only. | Matches the contract (Plan 1): role union, optional inline capture describing what Ben filed. |
| D4 | `capture` is a domain value carried in `MessageProps` as `capture: MessageCapture \| null`. | Contract says capture is "absent when nothing was filed"; storing `null` keeps the in-memory shape consistent and serializes cleanly. The user message always has `capture: null`. |
| D5 | Pagination via `createdAt` desc + `before` cursor (a timestamp). Cursor returned to client = `createdAt` of the **oldest** returned message (ISO string). | The kernel has `GreaterQuery`/`LowerOrEqualQuery` on `Date` and `orderBy/order` in `applyQueryParams`; no new kernel code needed. `before` selects messages strictly older than the cursor. |
| D6 | `hasMore` computed by fetching `limit + 1` rows and trimming, OR by a follow-up `count`. **Chosen: fetch `limit + 1`, trim to `limit`, `hasMore = fetched.length > limit`.** | One repo call, avoids a second `count` round-trip; robust against ties because we over-fetch by one. |
| D7 | Ben reply generation lives in a small domain util `generateBenReply` (pure/stub), injected-free. Capture generation also stubbed there (returns `null` for MVP, with a clearly-named seam). | Briefing: "stubbed/mock reply is acceptable." Keeps the use-case readable and the AI seam obvious for later. Mirrors `src/domain/utils/auth.ts` placement. |
| D8 | `nextBefore` is `null` when `hasMore` is false (empty result or end of history). | Contract's agreed empty/end-of-history behavior: client recognizes "no more history" via a null cursor. |
| D9 | Both endpoints registered in `app.ts` **after** `app.use(authMiddleware-style guard)` — but since the existing app applies `authMiddleware` per-route is NOT shown, we apply `authMiddleware` directly as the first handler on each message route: `app.get('/messages/list', authMiddleware, listMessages)`. | The auth middleware sets `req.userId`. The existing `/auth/login-or-register` is public; message routes must be protected, so the middleware is attached on the route itself. |
| D10 | The `before` query param is validated as an optional ISO datetime string; `limit` as an optional coercible int defaulting to 20 (contract default). | Query params arrive as strings; `z.coerce.number()` + `z.string().datetime()` handle this. Default 20 matches Plan 1. |

> Open assumption (low risk, no blocker): the contract's `capture.kind` enum is `'note' \| 'reminder' \| 'task'` and `capture.itemId` is a string, per Plan 1. The plan models exactly this. If Plan 1's final contract names differ, only the `MessageCapture` type + presenter keys change.

---

## 3. Files to Create

### 3.1 `src/domain/entities/message.ts` — Message entity

Mirrors `user.ts` exactly (static `create`/`reference`, `Entity<Props>`).

```typescript
import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export type MessageRole = 'user' | 'ben'

export type MessageCaptureKind = 'note' | 'reminder' | 'task'

export interface MessageCapture {
  kind: MessageCaptureKind
  itemId: string
}

export interface MessageProps {
  userId: string
  role: MessageRole
  content: string
  capture: MessageCapture | null
  createdAt: Date
}

export class Message extends Entity<MessageProps> {
  static create(props: MessageProps) {
    return new Message(props)
  }

  static reference(id: ID, props: MessageProps) {
    return new Message(props, id)
  }
}
```

### 3.2 `src/adapters/repositories/message-repository.ts` — Repository port

Mirrors `user-repository.ts` (one-liner extending `Repository`).

```typescript
import { Repository } from '@/modules/domain/repository/repository'

import { Message } from '@/domain/entities/message'

export abstract class MessageRepository extends Repository<Message> {}
```

### 3.3 `src/adapters/repositories/in-memory-message-repository.ts` — In-memory impl

Mirrors `in-memory-user-repository.ts` exactly. All querying (filter by `userId`, `before` via `LowerOrEqualQuery`/`GreaterQuery`, `orderBy: 'createdAt'`, `order: 'desc'`, `limit`) is inherited from `InMemoryRepository`; no per-repo overrides needed.

```typescript
import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Message } from '@/domain/entities/message'
import { MessageRepository } from './message-repository'

export class InMemoryMessageRepository
  extends InMemoryRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
}
```

> **Shared instance note:** auth handlers each `new InMemoryUserRepository()` at module scope (independent stores). For messages, list and create **must share the same in-memory store** or created messages won't appear in the list. Decision: instantiate **one** `InMemoryMessageRepository` in a tiny module the handlers import. See 3.7.

### 3.4 `src/domain/utils/messages.ts` — Ben reply + capture stub

Mirrors the placement of `src/domain/utils/auth.ts`. Pure functions, the obvious seam for a future real AI call.

```typescript
import { MessageCapture } from '@/domain/entities/message'

export function generateBenReply(userContent: string): string {
  return `Got it — I noted: "${userContent}".`
}

export function generateCaptureFromExchange(
  _userContent: string,
): MessageCapture | null {
  return null
}
```

> `generateCaptureFromExchange` returns `null` for the Text MVP (nothing filed), but exists so the create use-case wires the capture seam now. Underscore-prefixed param follows the unused-arg convention seen in the error handler (`_req`, `_next`).

### 3.5 `src/domain/use-cases/messages/list-messages.ts` — List use-case

Mirrors auth use-case structure: constructor-injected repository, `Payload`/`Response` interfaces, single `execute`.

```typescript
import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { LowerOrEqualQuery } from '@/modules/domain/repository/queries'

interface Payload {
  userId: string
  limit?: number
  before?: Date
}

interface Response {
  messages: Message[]
  nextBefore: string | null
  hasMore: boolean
}

const DEFAULT_LIMIT = 20

export class ListMessagesUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const limit = payload.limit ?? DEFAULT_LIMIT

    const fetched = await this.messageRepository.findMany(
      {
        userId: payload.userId,
        ...(payload.before
          ? { createdAt: new LowerOrEqualQuery({ input: payload.before }) }
          : {}),
      },
      {
        orderBy: 'createdAt',
        order: 'desc',
        limit: limit + 1,
      },
    )

    const hasMore = fetched.length > limit
    const messages = hasMore ? fetched.slice(0, limit) : fetched
    const oldestMessage = messages[messages.length - 1]

    return {
      messages,
      hasMore,
      nextBefore:
        hasMore && oldestMessage
          ? oldestMessage.props.createdAt.toISOString()
          : null,
    }
  }
}
```

> **Cursor semantics (matches contract, D5/D8):** results are latest-first. `before` selects messages with `createdAt <= cursor`. `nextBefore` is the oldest returned message's `createdAt` (ISO). When `hasMore` is false (empty store or last page), `nextBefore` is `null`.
>
> **Edge — cursor inclusivity:** `LowerOrEqualQuery` is inclusive, so the message at the exact cursor timestamp can repeat across pages only if two messages share the identical millisecond timestamp. Because Ben's reply is created right after the user message in the same `create` call, collisions are possible. Mitigation in 3.6: stamp the user message and Ben reply with timestamps **1ms apart** so `createdAt` is unique per user, making the cursor a stable, non-repeating boundary. (No kernel change.)

### 3.6 `src/domain/use-cases/messages/create-message.ts` — Create use-case

```typescript
import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import {
  generateBenReply,
  generateCaptureFromExchange,
} from '@/domain/utils/messages'

interface Payload {
  userId: string
  content: string
}

interface Response {
  userMessage: Message
  benMessage: Message
  capture: Message['props']['capture']
}

export class CreateMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const userMessageCreatedAt = new Date()

    const userMessage = await this.messageRepository.create({
      userId: payload.userId,
      role: 'user',
      content: payload.content,
      capture: null,
      createdAt: userMessageCreatedAt,
    })

    const capture = generateCaptureFromExchange(payload.content)

    const benMessage = await this.messageRepository.create({
      userId: payload.userId,
      role: 'ben',
      content: generateBenReply(payload.content),
      capture,
      createdAt: new Date(userMessageCreatedAt.getTime() + 1),
    })

    return { userMessage, benMessage, capture }
  }
}
```

> **Ordering/relationship (contract):** the user message is persisted first, Ben's reply second with a `createdAt` 1ms later, so list ordering (`createdAt` desc) and the `before` cursor stay deterministic and the client can render the pair in order.
>
> **Transient failures (contract D-error rule):** a failed reply/capture is **not** a persisted contract field. For the MVP both stubs are synchronous and cannot fail; if a future real generator throws, the error propagates through `next(err)` to the central handler — it is never written as a message field. No `replyStatus`/`captureStatus` field is invented.

### 3.7 `src/infra/http/routes/messages.ts` — Both route handlers + shared deps

Single file holding the shared repo instance and both handlers (one file keeps the shared in-memory store trivially co-located; mirrors the self-contained style of `login-or-register.ts`).

```typescript
import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'
import { CreateMessageUseCase } from '@/domain/use-cases/messages/create-message'
import { ListMessagesUseCase } from '@/domain/use-cases/messages/list-messages'
import { MessagePresenter } from '@/infra/http/presenters/message-presenter'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  before: z.string().datetime().optional(),
})

const createBodySchema = z.object({
  content: z.string().min(1),
})

const messageRepository = new InMemoryMessageRepository()
const listMessagesUseCase = new ListMessagesUseCase(messageRepository)
const createMessageUseCase = new CreateMessageUseCase(messageRepository)

export async function listMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(req.query)

    const result = await listMessagesUseCase.execute({
      userId: req.userId,
      limit: query.limit,
      before: query.before ? new Date(query.before) : undefined,
    })

    return res.status(200).json({
      messages: result.messages.map(MessagePresenter.toHttp),
      nextBefore: result.nextBefore,
      hasMore: result.hasMore,
    })
  } catch (err) {
    next(err)
  }
}

export async function createMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createBodySchema.parse(req.body)

    const result = await createMessageUseCase.execute({
      userId: req.userId,
      content: body.content,
    })

    return res.status(201).json({
      userMessage: MessagePresenter.toHttp(result.userMessage),
      benMessage: MessagePresenter.toHttp(result.benMessage),
      capture: result.capture,
    })
  } catch (err) {
    next(err)
  }
}
```

> `req.userId` is typed globally already (the `declare global { namespace Express { interface Request { userId: string } } }` block in `middlewares/auth.ts` is ambient and applies app-wide). No re-declaration needed here.

### 3.8 `src/infra/http/presenters/message-presenter.ts` — Presenter

Mirrors `user-presenter.ts`. Produces the contract Message DTO; `capture` passed through (already a plain object or `null`).

```typescript
import { Message } from '@/domain/entities/message'

export class MessagePresenter {
  static toHttp(message: Message) {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      content: message.props.content,
      capture: message.props.capture,
      createdAt: message.props.createdAt.toISOString(),
    }
  }
}
```

> `userId` is intentionally **not** in the DTO (contract is user-scoped via auth; client doesn't need it). `createdAt` serialized as ISO string for stable transport.

---

## 4. Files to Modify

### 4.1 `src/infra/http/app.ts` — Register routes

Add imports and two protected routes following the `/auth/login-or-register` mounting pattern, attaching `authMiddleware` per-route (the auth route stays public). Insert the routes between the existing auth route and `app.use(errorHandler)`.

```typescript
import { authMiddleware } from '@/infra/http/middlewares/auth'
import { createMessage, listMessages } from '@/infra/http/routes/messages'
```

```typescript
app.post('/auth/login-or-register', loginOrRegister)

app.get('/messages/list', authMiddleware, listMessages)
app.post('/messages/create', authMiddleware, createMessage)

app.use(errorHandler)
```

This is the only change to `app.ts`; per the briefing no other plan touches it, so there is no conflict.

---

## 5. Existing Code to Reuse (no new kernel code)

| Need | Reuse |
| --- | --- |
| Entity base + statics | `Entity` / `EntityWithStatic` — `src/modules/domain/entity/entity.ts` |
| ID generation | `ID` — `src/modules/domain/entity/id.ts` |
| Repo port + in-memory CRUD/query | `Repository`, `InMemoryRepository` — `src/modules/domain/repository/repository.ts` |
| `before` cursor filtering | `LowerOrEqualQuery` (Date-aware) — `src/modules/domain/repository/queries.ts` |
| Ordering + limit | `applyQueryParams` (`orderBy`/`order`/`limit`) — already in `InMemoryRepository` |
| Auth + `req.userId` | `authMiddleware` — `src/infra/http/middlewares/auth.ts` |
| Error → status mapping | `errorHandler`, `DomainError`, `ZodError` — `src/infra/http/error-handler.ts` |
| Handler skeleton | `loginOrRegister` — `src/infra/http/routes/login-or-register.ts` |
| Presenter shape | `UserPresenter` — `src/infra/http/presenters/user-presenter.ts` |
| Util placement convention | `src/domain/utils/auth.ts` |

---

## 6. API Contracts (as implemented)

### `GET /messages/list` (auth required)

Request (query): `limit?` (int, default 20, max 100), `before?` (ISO datetime).

Response `200`:
```jsonc
{
  "messages": [
    {
      "id": "uuid",
      "role": "ben",
      "content": "Got it — I noted: \"buy milk\".",
      "capture": null,
      "createdAt": "2026-05-31T12:00:00.001Z"
    }
    // ...latest-first
  ],
  "nextBefore": "2026-05-31T11:58:00.000Z", // or null when no more history
  "hasMore": true
}
```

### `POST /messages/create` (auth required)

Request (body): `{ "content": "buy milk" }`.

Response `201`:
```jsonc
{
  "userMessage": { "id": "uuid", "role": "user", "content": "buy milk", "capture": null, "createdAt": "...000Z" },
  "benMessage":  { "id": "uuid", "role": "ben",  "content": "Got it — ...", "capture": null, "createdAt": "...001Z" },
  "capture": null
}
```

### Message DTO

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `entity.id.toValue()` |
| `role` | `'user' \| 'ben'` | |
| `content` | string | |
| `capture` | `{ kind: 'note'\|'reminder'\|'task', itemId: string } \| null` | `null` for user messages and when nothing filed |
| `createdAt` | string (ISO) | |

### Status / error behavior

| Condition | Status | Source |
| --- | --- | --- |
| Success (list) | 200 | handler |
| Success (create) | 201 | handler |
| Invalid query/body | 400 | `ZodError` → `errorHandler` |
| Missing/invalid auth headers | 400/401 | `authMiddleware` → Zod / `DomainError(UNAUTHORIZED)` |
| Unknown server error | 500 | `errorHandler` |

---

## 7. Verification

Run from `project-backend` (no formatting step):

1. **Type check:**
   ```bash
   cd /home/fael/so/repos/ben-prototype/project-backend && npx tsc --noEmit
   ```
   Expect zero errors. Watch specifically for: `findMany` prop-map typing with the conditional `createdAt` query, `req.userId` resolving via the ambient global, and `MessagePresenter.toHttp` being usable as an `Array.map` callback.

2. **Smoke (manual, dev server):** start the server (`npm run dev` or the project's start script), then with valid auth headers:
   - `POST /messages/create` `{ "content": "buy milk" }` → 201, two messages, `benMessage.createdAt` 1ms after `userMessage.createdAt`, `capture: null`.
   - `GET /messages/list` → 200, both messages latest-first (Ben reply first), `hasMore: false`, `nextBefore: null` when under the limit.
   - Create > `limit` messages, then `GET /messages/list?limit=2` → 2 items + `hasMore: true` + non-null `nextBefore`; repeat with `?before=<nextBefore>&limit=2` → next older page, no duplicate at the boundary (validates the 1ms-stagger + inclusive cursor).

3. **Error paths:**
   - `POST /messages/create` with `{}` → 400 (Zod, `content` required).
   - `GET /messages/list?limit=abc` → 400 (Zod coerce fails).
   - Any message route without auth headers → 400/401 from `authMiddleware`.
   - Two different authenticated users do **not** see each other's messages (user-scoping via `userId` filter).

---

## 8. Scope Guardrails

- Touches only: `src/domain/entities/message.ts`, `src/domain/use-cases/messages/*`, `src/domain/utils/messages.ts`, `src/adapters/repositories/{message-repository,in-memory-message-repository}.ts`, `src/infra/http/routes/messages.ts`, `src/infra/http/presenters/message-presenter.ts`, and `src/infra/http/app.ts`.
- No `project-web` file is touched. No kernel (`src/modules/**`) file is modified. No audio/voice fields (`audioUrl`, `transcriptionStatus`, create-audio endpoint) — Text MVP only.
- No `npm run lint:fix` / formatting step is part of this plan.
