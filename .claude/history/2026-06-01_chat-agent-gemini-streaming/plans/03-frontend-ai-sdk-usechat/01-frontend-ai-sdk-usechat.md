# Plan 3 [Frontend] (parallel) — Adopt @ai-sdk/react useChat (deep plan)

## Context

This is **Plan 3 of 3** in the `chat-agent-gemini-streaming` task. It runs **in parallel** with Plan 2 (Backend `/chat` route + Gemini adapter) and depends only on the **contract** pinned by Plan 1 (`.claude/current-tasks/chat-agent-gemini-streaming/plans/01-agent-contract-and-env/01-agent-contract-and-env.md`), never on backend implementation files.

This plan owns **only `project-web` files** and must NOT touch `project-backend`.

The feature is a **reply-only, latest-message-only, streaming** chat. Today the chat screen uses a bespoke `useChat` hook (`src/pages/chat/hooks/use-chat.ts`) that POSTs to `/messages/create` via `@tanstack/react-query` `useMutation`, optimistically inserts the user message, awaits a single JSON `{ userMessage, benMessage, capture? }` response, and renders a typing indicator while awaiting. This plan replaces that send-and-await flow with `@ai-sdk/react`'s `useChat` + `DefaultChatTransport` pointed at the streaming `POST /chat` endpoint, while **keeping** the existing history pagination (`GET /messages/list`), scroll behavior, and capture rendering for historical messages.

### The shared `POST /chat` contract (from Plan 1 — consumed, not redefined)

- **Method/path:** `POST /chat` (relative to `VITE_BACKEND_URL`).
- **Auth:** same two headers the existing `authClient` sends — `jwtauthenticationtoken` + `providerauthenticationtoken` (read from cookies). `userId` comes from the server's auth context, never the body.
- **Request body:** the `@ai-sdk/react` `useChat` payload — `{ messages: UIMessage[] }` where each `UIMessage = { id, role, parts[] }`. The server reads **only the latest user message** (text concatenated from its `parts[]` where `part.type === 'text'`) and ignores prior turns.
- **Response:** a **UI message stream** (not a single JSON), produced by `result.pipeUIMessageStreamToResponse(res)` on the backend and consumed natively by `useChat` (renders tokens live). Ben's reply is persisted server-side on `onFinish`.
- **History seeding:** unchanged — `GET /messages/list` (paginated) still loads past messages.

### Current frontend facts (source of truth for conventions)

- **Auth client** (`src/api/client.ts`): `authClient` is an axios instance with `baseURL = BASE_URL = import.meta.env.VITE_BACKEND_URL`, a default header `ngrok-skip-browser-warning: true`, and a request interceptor that sets `jwtauthenticationtoken` + `providerauthenticationtoken` from cookies (`JWT_COOKIE = "@ben/jwttoken"`, `PROVIDER_COOKIE = "@ben/authprovidertoken"`) via `Cookies.get(...) ?? ""`. A response interceptor refreshes the JWT cookie when `updatedjwtauthenticationtoken` is returned, and on `401` clears cookies + redirects to login. The exported `BASE_URL`, `JWT_COOKIE`, `PROVIDER_COOKIE` are reused here.
- **Routes** (`src/api/routes.ts`): `API_ROUTES.messages.list = "/messages/list"`, `API_ROUTES.messages.create = "/messages/create"`. A new `API_ROUTES.chat.send = "/chat"` is added.
- **Message model** (`src/api/models/message.ts`): `Message = { id, role: "user" | "ben", content, createdAt, capture? }`, `MessageCapture = { kind: "note" | "reminder" | "task", itemId }`.
- **History pagination** (`src/layout/hooks/use-api-cursor-paginated.ts`): `useAPICursorPaginated<Message>({ url })` wraps `useInfiniteQuery`, returns `{ actions: { fetchNextPage, refetch }, state: { items, hasMore, isLoading, isFetchingNextPage, isError, error } }`. Items come **newest-first** from the API; the hook does not reverse them (the current `use-chat.ts` does `[...items].reverse()` to get oldest-first for display).
- **Infinite scroll-to-top** (`src/pages/chat/hooks/use-infinite-scroll-top.ts`): `useInfiniteScrollTop({ hasMore, isFetchingNextPage, onLoadMore, itemCount })` returns `{ topRef }`; preserves scroll position when older pages prepend. Reused **as-is**.
- **Components** (`src/pages/chat/components/`):
  - `message-bubble/message-bubble.tsx` — `MessageBubble({ from: "user" | "ben", state?, children, footer, className })`. Renders bubble side by `from`.
  - `chat-history/chat-history.tsx` — maps `messages: Message[]`, renders `<MessageBubble from={message.role}>{message.content}{ben+capture ? <CaptureCard .../> : null}</MessageBubble>`, shows `<TypingIndicator />` while `isAwaitingReply`, has `topRef`/`bottomRef` sentinels.
  - `chat-history/chat-history-skeleton.tsx` — static skeleton; unchanged.
  - `chat-input/chat-input.tsx` — controlled input; `mode: "idle" | "composing" | "disabled" | "sending-disabled"`; `onChange`, `onSend`; Enter sends unless `disabled`; send/mic button disabled when `disabled || mode === "sending-disabled"`.
  - `chat-shell/chat-shell.tsx`, `chat-empty-state/chat-empty-state.tsx`, `capture-card/*`, `typing-indicator.tsx` — unchanged in behavior; `capture-card` is reused for historical captures.
  - `page.tsx` — wires `useChat()` to `ChatShell` + `ChatInput` + `ChatHistory`/`ChatHistorySkeleton`/`ChatEmptyState`. Reads `chat.draft`, `chat.isLoadingHistory`, `chat.handleDraftChange`, `chat.handleSend`, `chat.isEmpty`, `chat.messages`, `chat.isAwaitingReply`, `chat.isFetchingOlder`, `chat.bottomRef`, `chat.topRef`.

### AI SDK usage facts (from `docs/vercel-ai-sdk.md`, AI SDK 6.x)

- `useChat` from `@ai-sdk/react`; `DefaultChatTransport` from `ai`.
- `useChat({ messages, transport })` accepts an initial `messages` list (UIMessage[]) to seed history, and returns `{ messages, sendMessage, status, setMessages, ... }`.
- `sendMessage({ text })` sends a user turn and streams the assistant reply.
- `messages` are `UIMessage` objects with `role: "user" | "assistant" | "system"` and a `parts` array; text is read from `part.type === "text"` parts.
- `status` reflects streaming progress (`"submitted" | "streaming" | "ready" | "error"`); used to disable send + show typing.
- Transport carries `api`, `headers`, `body`, `credentials`.

## Decisions

### D1 — Keep the hook's public surface stable so `page.tsx` and components barely change

The new `useChat` (our wrapper, same file `src/pages/chat/hooks/use-chat.ts`) keeps returning the same keys the page already consumes: `isLoadingHistory`, `messages`, `draft`, `isAwaitingReply`, `isEmpty`, `isFetchingOlder`, `bottomRef`, `topRef`, `handleDraftChange`, `handleSend`. Internally it now delegates send/streaming to `@ai-sdk/react`'s `useChat` (imported under an alias to avoid the name clash, e.g. `useAiChat`). This minimizes churn in `page.tsx` (no changes there) and isolates the migration to the hook + a `messages` type swap in `chat-history`.

### D2 — How history maps to UIMessage `parts` (the core mapping)

History from `GET /messages/list` is `Message[]` (`{ id, role: "user" | "ben", content, createdAt, capture? }`), returned **newest-first**. The hook converts it to UIMessage[] (oldest-first) to seed `useChat`:

- **Order:** reverse the paginated `items` to oldest-first (same as today's `[...items].reverse()`), so the seed list and any prepended older pages render top-to-bottom chronologically.
- **`role`:** map `"ben"` → `"assistant"`, `"user"` → `"user"` (AI SDK uses `assistant`, the project uses `ben`).
- **`parts`:** wrap `content` as a single text part: `parts: [{ type: "text", text: message.content }]`. This is the shape `useChat` renders and the shape new streamed replies arrive in, so historical and live messages render through the same code path.
- **`id`:** reuse the backend `Message.id` so React keys stay stable across pages and the scroll-preservation hook keeps working.
- **Capture:** UIMessage has no native field for our `capture`. We carry it through **`UIMessage.metadata`** (the SDK's typed per-message metadata slot) as `{ capture?: MessageCapture }`. The mapper sets `metadata.capture` from `message.capture` when present (only on `ben`/`assistant` history rows). Live streamed replies are **reply-only** (no capture) per scope, so they simply have no `metadata.capture`. See D3.

A typed helper `mapHistoryToUiMessages(history: Message[]): BenUiMessage[]` lives at module level in the hook file (pure, no component scope — per general coding practices). `BenUiMessage` is `UIMessage<BenMessageMetadata>` where `BenMessageMetadata = { capture?: MessageCapture }`.

### D3 — How captures survive (history-only)

Captures only exist on **historical** `ben` messages (new replies are reply-only and never produce a capture in v1). Rather than relying on the SDK to round-trip arbitrary fields, we attach the capture to `UIMessage.metadata.capture` during the history→UIMessage mapping (D2). The rendering layer (`chat-history`) reads `message.metadata?.capture` and, when the message is from `assistant` and a capture is present, renders `<CaptureCard kind={...} title={textOf(message)} />` exactly as today (the current code passes `message.content` as the title; we pass the concatenated text of the message's text parts). Because live replies carry no `metadata.capture`, no capture card renders for them — matching the reply-only scope without any extra branching.

### D4 — Transport auth headers mirror `authClient` exactly

`DefaultChatTransport` is configured with:
- `api: \`${BASE_URL}${API_ROUTES.chat.send}\`` (absolute URL — the transport does a raw `fetch`, not axios, so it needs the full base URL; `BASE_URL` is reused from `src/api/client.ts`).
- `headers: () => ({ ... })` — a **function** so the JWT/provider tokens are read from cookies fresh on every request (matching the axios request interceptor, which reads cookies per-request). Headers: `jwtauthenticationtoken: Cookies.get(JWT_COOKIE) ?? ""`, `providerauthenticationtoken: Cookies.get(PROVIDER_COOKIE) ?? ""`, and `"ngrok-skip-browser-warning": "true"` (the project's default header). This reuses the exported `JWT_COOKIE`, `PROVIDER_COOKIE` constants.

We do **not** replicate the axios response interceptor (JWT refresh on `updatedjwtauthenticationtoken`, 401 redirect) for the streaming response in v1 — that interceptor only governs axios calls, and the streaming `fetch` is a separate channel. History/other calls still go through `authClient` and keep that behavior. (Noted as a known v1 limitation; not in scope to wire fetch-level interception.)

### D4b — `transport` is memoized

`DefaultChatTransport` is instantiated inside a `useRef`/`useMemo` so a new transport is not created on every render (it has no reactive deps — `BASE_URL` and the route are constants, and `headers` is a function that reads cookies lazily). Use `useMemo(() => new DefaultChatTransport({...}), [])`.

### D5 — Seeding `useChat` with history (initial + prepended pages)

`useChat` accepts `messages` as the initial seed. But history pagination is **async** (loads after mount) and **grows** (older pages prepend on scroll-up). `useChat`'s `messages` prop is only an *initial* value — it does not re-seed when the prop changes. Therefore:

- Pass the first-loaded history as the initial seed is not reliable (history may not be loaded at first render). Instead, after history loads/changes, **merge** history with the live session messages for display, and keep `useChat` as the owner of *session* (sent + streamed) messages only.
- Concretely, the hook computes `messages = [...mapHistoryToUiMessages(historyOldestFirst), ...aiMessages]` where `aiMessages` is from `useChat` (the session: user sends + streamed Ben replies). This mirrors today's `[...historyOldestFirst, ...sessionMessages, ...pendingMessages]` composition and avoids fighting `useChat`'s internal state on async history arrival or page prepends. `useChat` is initialized with **no** seed (`messages: []`) — history is composed outside it.
- This keeps history (server-owned, paginated, react-query-cached) and session (SDK-owned, streamed) cleanly separated, and the scroll-preservation hook continues to key off `historyState.items.length`.

### D6 — `isAwaitingReply` derives from `useChat` `status`

`isAwaitingReply = status === "submitted" || status === "streaming"`. The typing indicator in `chat-history` shows while awaiting. Note: once the assistant message begins streaming, its partial text already renders as a normal `assistant` bubble, so the standalone typing indicator is primarily for the `"submitted"` (pre-first-token) phase. We keep the existing indicator behavior (show while `isAwaitingReply`) to preserve the current UX; the streamed bubble appears alongside/after it and the indicator disappears when `status` becomes `"ready"`.

### D7 — Draft state stays local; send via `sendMessage`

`useChat` (SDK) in v6 does not manage the input value, so the wrapper keeps the local `draft` state (object-state pattern) and `handleDraftChange`. `handleSend` trims the draft, returns early if empty or `isAwaitingReply`, calls `sendMessage({ text: content })`, then clears the draft (`setState(draft: "")`). This preserves draft-clearing and send-disabled-while-streaming.

### D8 — Scroll-to-bottom preserved

Keep the `bottomRef` + `useEffect` that calls `scrollIntoView({ behavior: "smooth" })`. Re-trigger it on the last message id and on `isAwaitingReply` (as today). During streaming the last `assistant` message's `parts` text grows; to keep pinned to the bottom as tokens arrive, also include the streaming `status` and the last message's text length in the effect deps (lightweight) so the view follows the growing reply. (Decision: add `status` to deps; the smooth scroll on each token is acceptable for v1 and matches "maintain automatic scrolling as new content appears".)

### D9 — Retire the bespoke send-and-await flow

Remove from the hook: the `@tanstack/react-query` `useMutation` to `/messages/create`, the `ChatLocalState.pendingMessages`/`sessionMessages`/`isAwaitingReply` fields, the optimistic `Message` construction, and the imports of `CreateMessageRequestData`/`CreateMessageResponseData`/`Message` model (history mapping uses the `Message` *type* only for input typing). `/messages/create` route constant stays in `routes.ts` (other flows/audio may still use it; out of scope to remove). History loading (`useAPICursorPaginated`) and `useInfiniteScrollTop` stay.

### D10 — `chat-history` reads UIMessage parts

`ChatHistory` `messages` prop type changes from `Message[]` to `BenUiMessage[]`. Per message: side from `message.role` (`"user" | "assistant"`) mapped to `MessageBubble`'s `from` (`"user" | "ben"`); body text = concatenation of text parts (`message.parts.filter(p => p.type === "text").map(p => p.text).join("")`); capture from `message.metadata?.capture` (assistant-only). A module-level helper `getMessageText(message: BenUiMessage): string` keeps the JSX clean.

## Files to Modify / Create

### MODIFY — `project-web/package.json` (add deps)

Add `@ai-sdk/react` and `ai` to `dependencies`. Install via npm so the lockfile updates:

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npm install @ai-sdk/react ai
```

(Resulting `dependencies` gain `"@ai-sdk/react": "^<latest 6.x>"` and `"ai": "^<latest 6.x>"`. No other dep changes.)

### MODIFY — `project-web/src/api/routes.ts`

Add the chat route group (consumes Plan 1's `/chat` path):

```ts
export const API_ROUTES = {
  auth: {
    loginOrRegister: "/auth/login-or-register",
  },
  messages: {
    list: "/messages/list",
    create: "/messages/create",
  },
  chat: {
    send: "/chat",
  },
} as const;
```

### CREATE — `project-web/src/pages/chat/hooks/use-chat-messages.ts`

The history→UIMessage mapping + shared message types, extracted so both the hook and `chat-history` import the `BenUiMessage` type and `getMessageText` helper from one place (avoids a circular dep between the hook and the component).

```ts
import type { UIMessage } from "ai";
import type { Message, MessageCapture } from "../../../api/models/message";

export type BenMessageMetadata = {
  capture?: MessageCapture;
};

export type BenUiMessage = UIMessage<BenMessageMetadata>;

export function mapHistoryToUiMessages(history: Message[]): BenUiMessage[] {
  return history.map((message) => ({
    id: message.id,
    role: message.role === "ben" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
    metadata: message.capture ? { capture: message.capture } : undefined,
  }));
}

export function getMessageText(message: BenUiMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
```

(Note: `history` is consumed oldest-first — the hook reverses the newest-first paginated items before calling `mapHistoryToUiMessages`, matching the current `[...items].reverse()`.)

### MODIFY — `project-web/src/pages/chat/hooks/use-chat.ts`

Rework to delegate sending/streaming to `@ai-sdk/react` `useChat` (aliased) while keeping the same return surface. Replaces the entire file:

```ts
import { useChat as useAiChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_URL,
  JWT_COOKIE,
  PROVIDER_COOKIE,
} from "../../../api/client";
import type { Message } from "../../../api/models/message";
import { API_ROUTES } from "../../../api/routes";
import { useAPICursorPaginated } from "../../../layout/hooks/use-api-cursor-paginated";
import { useInfiniteScrollTop } from "./use-infinite-scroll-top";
import {
  getMessageText,
  mapHistoryToUiMessages,
} from "./use-chat-messages";

function buildChatHeaders() {
  return {
    "ngrok-skip-browser-warning": "true",
    jwtauthenticationtoken: Cookies.get(JWT_COOKIE) ?? "",
    providerauthenticationtoken: Cookies.get(PROVIDER_COOKIE) ?? "",
  };
}

export function useChat() {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${BASE_URL}${API_ROUTES.chat.send}`,
        headers: buildChatHeaders,
      }),
    [],
  );

  const { messages: sessionMessages, sendMessage, status } = useAiChat({
    transport,
  });

  const { actions: historyActions, state: historyState } =
    useAPICursorPaginated<Message>({
      url: API_ROUTES.messages.list,
    });

  const { topRef } = useInfiniteScrollTop({
    hasMore: historyState.hasMore,
    isFetchingNextPage: historyState.isFetchingNextPage,
    onLoadMore: historyActions.fetchNextPage,
    itemCount: historyState.items.length,
  });

  const isAwaitingReply = status === "submitted" || status === "streaming";

  const historyOldestFirst = [...historyState.items].reverse();
  const messages = [
    ...mapHistoryToUiMessages(historyOldestFirst),
    ...sessionMessages,
  ];

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageLength = lastMessage ? getMessageText(lastMessage).length : 0;
  useEffect(() => {
    scrollToBottom();
  }, [lastMessageId, lastMessageLength, isAwaitingReply]);

  function handleDraftChange(value: string) {
    setDraft(value);
  }

  function handleSend() {
    const content = draft.trim();
    if (!content || isAwaitingReply) {
      return;
    }
    setDraft("");
    sendMessage({ text: content });
  }

  return {
    isLoadingHistory: historyState.isLoading,
    messages,
    draft,
    isAwaitingReply,
    isEmpty: !historyState.isLoading && messages.length === 0,
    isFetchingOlder: historyState.isFetchingNextPage,
    bottomRef,
    topRef,
    handleDraftChange,
    handleSend,
  };
}
```

Notes:
- `draft` moves from the object-state to a single `useState<string>` because it is now the only local field (the other `ChatLocalState` fields were the bespoke flow's, now owned by the SDK). This stays within the "object state for *multiple related* values" guidance — there is only one value left.
- `handleSend` no longer `async` and no longer constructs optimistic messages — `useAiChat` inserts the user message and streams the reply.
- `messages` is `BenUiMessage[]` (history mapped + SDK session messages, which are `UIMessage`). The SDK session messages structurally satisfy `BenUiMessage` (metadata optional/absent for live replies).

### MODIFY — `project-web/src/pages/chat/components/chat-history/chat-history.tsx`

Switch `messages` to `BenUiMessage[]`, read text via `getMessageText`, map `assistant` → `MessageBubble from="ben"`, and read capture from `metadata`:

```tsx
import type { RefObject } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import { CaptureCard } from "../capture-card/capture-card";
import { MessageBubble } from "../message-bubble/message-bubble";
import { TypingIndicator } from "../typing-indicator";
import {
  getMessageText,
  type BenUiMessage,
} from "../../hooks/use-chat-messages";

type ChatHistoryProps = {
  messages: BenUiMessage[];
  isAwaitingReply: boolean;
  isFetchingOlder: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  topRef: RefObject<HTMLDivElement | null>;
};

export function ChatHistory({
  messages,
  isAwaitingReply,
  isFetchingOlder,
  bottomRef,
  topRef,
}: ChatHistoryProps) {
  return (
    <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
      <div ref={topRef} />

      {isFetchingOlder && (
        <div className="flex w-full justify-center py-2">
          <TypingIndicator />
        </div>
      )}

      {messages.map((message) => {
        const text = getMessageText(message);
        const isBen = message.role === "assistant";
        const capture = message.metadata?.capture;
        return (
          <MessageBubble key={message.id} from={isBen ? "ben" : "user"}>
            {text}
            {isBen && capture && (
              <CaptureCard kind={capture.kind} title={text} />
            )}
          </MessageBubble>
        );
      })}

      {isAwaitingReply && (
        <div className="flex w-full justify-start">
          <div className="flex flex-col items-start gap-1">
            <div className="ml-1">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                Ben
              </Typography>
            </div>
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
}
```

(Behavior preserved: capture cards render for historical `ben` messages with `metadata.capture`; user/ben bubble sides unchanged; typing indicator unchanged.)

### NO CHANGE — `project-web/src/pages/chat/page.tsx`

The hook's public surface is unchanged, so `page.tsx` needs no edits. (Verify after the type swap that `chat.messages` flows into `ChatHistory` without a type error — it will, since both now use `BenUiMessage[]`.)

### NO CHANGE — other chat components

`chat-input`, `chat-shell`, `chat-empty-state`, `message-bubble`, `chat-history-skeleton`, `capture-card/*`, `typing-indicator`, `use-infinite-scroll-top` are unchanged. The existing `ChatInput` already supports send-disabled via `mode`; `page.tsx` already passes `mode={chat.isLoadingHistory ? "disabled" : "idle"}` and `handleSend` already guards against sending while `isAwaitingReply`, so streaming-disable is enforced in the hook (kept). (Optional future polish: pass `mode="sending-disabled"` while `isAwaitingReply` to also dim the button — **not done** in this plan to keep the diff minimal and avoid behavior change beyond scope; the hook guard already prevents double-send.)

## Existing Code to Reuse

- `BASE_URL`, `JWT_COOKIE`, `PROVIDER_COOKIE` from `src/api/client.ts` — for the transport URL and auth headers (mirrors `authClient` behavior).
- `API_ROUTES` from `src/api/routes.ts` — `messages.list` (history) + new `chat.send`.
- `Message` / `MessageCapture` types from `src/api/models/message.ts` — input typing for the history mapper and metadata capture shape.
- `useAPICursorPaginated` (`src/layout/hooks/use-api-cursor-paginated.ts`) — history pagination, untouched.
- `useInfiniteScrollTop` (`src/pages/chat/hooks/use-infinite-scroll-top.ts`) — scroll-up pagination + position preservation, untouched.
- `MessageBubble`, `CaptureCard`, `TypingIndicator`, `Typography` — rendering primitives, untouched.
- `js-cookie` (already a dependency) — reading tokens for the transport headers.

## Out of Scope (owned by parallel plans / deferred)

- The `POST /chat` route, Gemini adapter, persistence, and the `AgentService` implementation — Plan 2 Backend / Plan 1.
- Any `project-backend` file.
- Capture **classification** for new replies (replies are reply-only; captures only render for history) — deferred.
- Audio/`/messages/create-audio` flow and `/messages/create` removal — untouched (other flows may still use them).
- Fetch-level JWT refresh / 401 handling for the streaming channel — deferred (axios interceptor still governs history calls).

## Verification

Run from `project-web` (no lint here — formatting runs once after all parallel plans finish):

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Expected: clean. Specifically:
- `@ai-sdk/react` `useChat` and `ai` `DefaultChatTransport` / `UIMessage` types resolve.
- `BenUiMessage` (= `UIMessage<BenMessageMetadata>`) is assignable from both the history mapper output and `useAiChat`'s `messages`.
- `ChatHistory` accepts `BenUiMessage[]`; `page.tsx` compiles with no edits.

Manual smoke (requires the backend `/chat` route from Plan 2 to be live; can be deferred until both parallel plans land):

1. **History loads:** open the chat — paginated history renders oldest-at-top, newest-at-bottom; scrolling up loads older pages and preserves scroll position (skeleton while `isLoadingHistory`).
2. **Captures survive:** historical `ben` messages that carried a capture still render their `CaptureCard` (kind + title).
3. **Send + stream:** type a message, press Enter or tap Send — the draft clears, the user bubble appears, the typing indicator shows, and Ben's reply streams in token-by-token into an `assistant` bubble.
4. **Send disabled while streaming:** attempting to send again while a reply streams is a no-op (hook guard); input re-enables when `status` returns to `ready`.
5. **Scroll-to-bottom:** the view stays pinned to the latest message as the streamed reply grows.
6. **Auth headers:** network tab shows `POST /chat` carrying `jwtauthenticationtoken` + `providerauthenticationtoken` (+ `ngrok-skip-browser-warning`) matching the existing authed requests.

## Boundary / Parallel-safety notes

- Touches **only** `project-web` files: `package.json`, `src/api/routes.ts`, `src/pages/chat/hooks/use-chat.ts` (rework), `src/pages/chat/hooks/use-chat-messages.ts` (new), `src/pages/chat/components/chat-history/chat-history.tsx`. No file here is owned by Plan 1 or Plan 2.
- Consumes Plan 1's `/chat` contract by URL + header + body/stream shape only; never imports backend code.
- No `npm run lint:fix` — formatting is run once after all parallel plans finish.
