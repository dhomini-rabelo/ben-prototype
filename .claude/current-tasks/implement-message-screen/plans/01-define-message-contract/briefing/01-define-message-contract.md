# Plan 1 — Define the shared message API contract (Text MVP)

This plan produces the single source of truth for the message (chat) Text-MVP API contract so the backend and frontend can be built in parallel against identical shapes. It defines shapes only — it does not implement routes, use-cases, entities, repositories, or UI.

## Plan

1. **Establish the contract source of truth**
   - Place the contract as a standalone markdown document inside this task's plan folder, so both the backend plan and the frontend plan reference one agreed location (the two projects share no code package).
   - State that the contract is scoped to the Text MVP only — voice/audio fields (`audioUrl`, `transcriptionStatus`, the create-audio endpoint) are explicitly out of scope.
   - Note the shared transport conventions inherited from the project: REST over JSON, authentication via the standard auth headers, `userId` taken from auth context (never the body or query), and errors surfaced through the central error handler.

2. **Define the Message DTO (text MVP)**
   - Specify the fields the client receives for a single message: a string `id`, a `role` of either `user` or `ben`, the text `content`, and a `createdAt` timestamp.
   - Specify the optional inline `capture` reference describing what Ben filed from the message: its kind (note, reminder, or task) and the referenced item id. The capture is absent when nothing was filed.
   - Confirm that audio-only fields are not part of this DTO for the MVP.

3. **Define the message-history (list) contract**
   - Describe the request: a `limit` (defaulting to 20) and an optional `before` cursor for scrolling back through history, with results returned latest-first.
   - Describe the response: the window of messages plus the pagination signal the client needs to request the next older page and to know when no more history exists.
   - Define what the pagination cursor represents and how the client derives the `before` value for the following request.

4. **Define the send-message (create) contract**
   - Describe the request: a single text `content` field, with the userId coming from auth context rather than the body.
   - Describe the response: the persisted user message, Ben's reply message, and the optional capture produced from the exchange — each expressed using the Message DTO and capture shape defined above.
   - Note the ordering and relationship between the returned user message and Ben reply so the client can render them correctly.

5. **Agree shared edge-case and error expectations**
   - State the agreed empty and end-of-history behavior for the list endpoint.
   - State which failure conditions are transient/client-side (e.g. a failed Ben reply or failed capture save) and therefore not represented as persisted contract fields, so both sides handle them consistently without inventing extra shapes.

## Locked field names (source of truth — added during main-agent review)

Pinned so the parallel backend and frontend plans implement identical shapes:

**Message DTO** — `{ id: string; role: 'user' | 'ben'; content: string; createdAt: string (ISO); capture?: { kind: 'note' | 'reminder' | 'task'; itemId: string } }`. `capture` is present only on Ben messages that filed something; user messages and non-filing Ben messages omit it (`null` on the wire is acceptable and treated as absent).

**`GET /messages/list`** — request: query `limit` (default 20) + optional `before` (ISO cursor). Response: `{ messages: Message[] (latest-first); nextBefore: string | null; hasMore: boolean }`. `nextBefore` is the value the client passes back as the next request's `before`; it is `null` at end-of-history. (Field is named `nextBefore`, NOT `nextCursor`.)

**`POST /messages/create`** — request body: `{ content: string }` (`userId` derived server-side from auth). Response: `{ userMessage: Message; benMessage: Message; capture?: <capture shape> }` — `capture` is returned **top-level** in the create response (mirroring `benMessage.capture`).

**Auth headers** — both endpoints require `jwtauthenticationtoken` and `providerauthenticationtoken` (the existing backend `authMiddleware` contract), NOT `Authorization: Bearer`.
