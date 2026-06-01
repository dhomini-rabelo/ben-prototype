# Deep Plan — [Frontend] Render real capture cards from the API

## Context

The chat experience in `project-web` already renders a `CaptureCard` underneath Ben's
message bubble, but it does so with two defects:

1. `chat-history.tsx` passes the **Ben message text** as the card `title`
   (`<CaptureCard kind={capture.kind} title={text} />`) — it should show the captured
   **item's** title, not Ben's prose.
2. The **live** optimistic reply built in `use-chat.ts` never attaches a capture, so a
   card only appears after a full reload from `GET /messages/list`. Even then, the
   `MessageCapture` model only carries `{ kind, itemId }`, so there is no title/meta to
   render.

This plan implements the **web side** of a shared JSON contract (agreed with the
parallel backend plan): both `POST /chat` and `GET /messages/list` return an enriched
`CaptureView` (`kind`, `itemId`, `title`, `meta`). The card must render from
`capture.title` / `capture.meta` and must appear **both** live and on reload.

This plan touches **only** files under `project-web/`. It never modifies the
`CaptureCard` component (used as-is) and never touches `project-backend/`.

### Relevant existing files

- `src/api/models/message.ts` — `MessageCapture` + `Message` models.
- `src/api/models/agent-reply.ts` — `AgentReply` (the `POST /chat` response).
- `src/api/chat.ts` — `sendChatMessage()` returns `AgentReply` as-is (no change needed).
- `src/pages/chat/hooks/use-chat.ts` — builds the optimistic Ben message after a reply.
- `src/pages/chat/utils/chat-messages.ts` — `BenMessageMetadata.capture` + history mapper.
- `src/pages/chat/components/chat-history/chat-history.tsx` — renders the card.
- `src/pages/chat/components/capture-card/*` — **read-only**. `CaptureCardProps` is
  `{ kind; title; meta?: string; state?; ... }`.

## Decisions

1. **`MessageCapture` becomes the enriched shape**:
   `{ kind: CaptureKind; itemId: string; title: string; meta?: string | null }`.
   `meta` is optional + nullable so simpler/older captures still type-check
   (backward-tolerant per the contract). This single model is reused as the
   `CaptureView` for both endpoints — no separate alias type is needed, but the plan
   exposes a `CaptureView` alias in `agent-reply.ts` to match the contract's naming.

2. **`AgentReply` gains `capture: CaptureView | null`** where
   `CaptureView = MessageCapture`. Importing/aliasing keeps a single source of truth
   for the capture shape.

3. **`use-chat.ts` live path**: `buildBenMessage` takes an optional `capture` and sets
   `metadata: { capture }` only when present, so the card renders immediately under the
   typed-out reply. The typing animation (`animateBenReply`) only rewrites `parts`, so
   the `metadata` it set survives the animation.

4. **`chat-history.tsx` render**:
   `<CaptureCard kind={capture.kind} title={capture.title} meta={capture.meta ?? undefined} state="default" />`.
   `meta` is coerced from `string | null | undefined` → `string | undefined` because
   `CaptureCardProps.meta` is `string | undefined` (not nullable). The card keeps its
   current placement: inside the Ben `MessageBubble`, after the text. Render is gated on
   `isBen && capture`.

5. **`chat-messages.ts` mapper**: `mapHistoryToUiMessages` already copies
   `message.capture` verbatim into `metadata.capture`. Since the enriched fields are
   added to the same `MessageCapture` type, the mapper needs **no change** — the richer
   object flows through automatically. No edit required there.

6. **Display-only**: no `onAction` / state transitions yet (no backend start/complete
   endpoints exist). Card renders with `state="default"`. Noted as a follow-up.

## Files to Modify

### `src/api/models/message.ts`

Enrich `MessageCapture`; `Message.capture` already references it.

```ts
export type MessageRole = "user" | "ben";

export type CaptureKind = "note" | "reminder" | "task";

export interface MessageCapture {
  kind: CaptureKind;
  itemId: string;
  title: string;
  meta?: string | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  capture?: MessageCapture;
}
```

### `src/api/models/agent-reply.ts`

Add the `CaptureView` alias and `capture` field to `AgentReply`.

```ts
import type { MessageCapture } from "./message";

// ...existing drafts + HistoryTopic...

export type CaptureView = MessageCapture;

export interface AgentReply {
  message: string;
  newReminders: ReminderDraft[];
  newNotes: NoteDraft[];
  newTasks: TaskDraft[];
  historyTopics: HistoryTopic[];
  capture: CaptureView | null;
}
```

### `src/pages/chat/hooks/use-chat.ts`

`buildBenMessage` accepts an optional capture; the live send path passes `reply.capture`.

```ts
import type { CaptureView } from "../../../api/models/agent-reply";

function buildBenMessage(text: string, capture?: CaptureView | null): BenUiMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    parts: [{ type: "text", text }],
    metadata: capture ? { capture } : undefined,
  };
}
```

```ts
const reply = await sendChatMessage(trimmed);
const benMessage = buildBenMessage("", reply.capture);
setSessionMessages((current) => [...current, benMessage]);
animateBenReply(benMessage.id, reply.message);
```

`animateBenReply` only updates `parts`, so the `metadata.capture` set here is preserved
throughout the typing animation and the card appears live.

### `src/pages/chat/components/chat-history/chat-history.tsx`

Render the card from the capture's own fields.

```tsx
{isBen && capture && (
  <CaptureCard
    kind={capture.kind}
    title={capture.title}
    meta={capture.meta ?? undefined}
    state="default"
  />
)}
```

## Existing Code to Reuse

- `CaptureCard` (read-only) — `{ kind, title, meta?, state? }`. Used as-is.
- `BenMessageMetadata` / `BenUiMessage` in `chat-messages.ts` — already typed on
  `MessageCapture`; enriched fields flow through automatically.
- `mapHistoryToUiMessages` — unchanged; already forwards `message.capture`.
- `sendChatMessage` (`api/chat.ts`) — unchanged; returns the full `AgentReply`.

## Shared JSON Contract (web side)

| Field            | Type                                | Endpoint(s)               | Notes                                  |
| ---------------- | ----------------------------------- | ------------------------- | -------------------------------------- |
| `capture.kind`   | `"note" \| "reminder" \| "task"`    | `/chat`, `/messages/list` | drives icon + header                   |
| `capture.itemId` | `string`                            | `/chat`, `/messages/list` | id of the captured item                |
| `capture.title`  | `string`                            | `/chat`, `/messages/list` | card main line                         |
| `capture.meta`   | `string \| null`                    | `/chat`, `/messages/list` | secondary line; null/absent when none  |
| `AgentReply.capture` | `CaptureView \| null`           | `/chat`                   | primary captured item this turn        |
| `Message.capture`    | `CaptureView \| undefined`      | `/messages/list`          | now carries title + meta               |

## Verification

- `npx tsc --noEmit` inside `project-web/` passes with no new errors.
- Do **not** run `npm run lint:fix` (formatting handled once after both plans finish).
- Manual expectation: live reply with a capture shows the card under the typed reply;
  after reload the same card reappears with the same title + meta.

## Follow-ups (out of scope)

- Interactive card actions (start/complete task, etc.) once backend endpoints exist.
- Card `state` derivation (e.g. `fired` for past reminders) once status data is available.
