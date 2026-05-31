# Plan 3 (Deep) — Frontend chat (message) screen, Text MVP (`project-web`)

Code-level implementation plan for the chat screen in `project-web`. It reproduces the **visual design** of the `project-design` chat screens while following **`project-web`'s own code structure and conventions** (its `core/routes.ts`, `core/router.tsx`, `core/api-routes.ts`, the page-folder layout, the `VITE_BACKEND_URL` + `fetch` + `@ben/jwttoken` cookie auth pattern, and the `cn` helper at `src/layout/utils/styles.ts`).

Scope is **Text MVP only**: Loading history, Empty, Populated, Composing, Awaiting reply. Out of scope: audio/voice, offline, permission-denied, error-recovery. This plan owns only `project-web` files and must NOT touch any `project-backend` file. **No formatting step (`npm run lint:fix`) is part of this plan.**

---

## Context

### What exists today in `project-web`

- **Routing** is centralized and minimal:
  - `src/core/routes.ts` — `ROUTES = { login: "/", home: "/home" }` (`as const`).
  - `src/core/router.tsx` — a `<BrowserRouter><Routes>` with one `<Route>` per `ROUTES` entry, importing each page from `../pages/{Name}/page`.
- **Pages** live in `src/pages/{PascalCaseName}/page.tsx` and export a named function component (`Home`, `Login`).
- **Auth guard pattern** (from `Home/page.tsx`): a `useEffect` checks `Cookies.get("@ben/jwttoken")` and `navigate(ROUTES.login)` when absent. The JWT cookie key constant `JWT_COOKIE = "@ben/jwttoken"` is exported from `src/layout/hooks/use-google-auth.ts`.
- **Backend calls** (from `use-google-auth.ts`): base URL via `const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string` (already read in `src/core/api-routes.ts`); endpoints centralized in `API_ROUTES`; calls use the native `fetch` with `headers: { "Content-Type": "application/json" }`, `JSON.stringify` bodies, `response.ok` checks, and `response.json()`. The JWT is stored as a cookie (`js-cookie`), not yet sent on any request — this plan introduces the authenticated header usage.
- **UI primitives** in `project-web`: `Button`, `Typography` (variants `wordmark | tagline | headline-lg | body-md | button-text | label-caps`), `BrandMark`, `BenLogo`. **No** `IconButton`, `MessageBubble`, `ChatInput`, `TypingIndicator`, `ActiveTaskPeek`, `CaptureCard`, or `SuggestedAction` exist yet — they must be ported from `project-design`.
- **`cn` helper**: `src/layout/utils/styles.ts` exports `cn(...inputs)` (extended `tailwind-merge`). `project-design` components import `cn` from `../utils/cn` / `../../utils/cn`; ported components must import from `project-web`'s `styles.ts` path instead.
- **Theme tokens**: `src/core/global.css` already defines every color token the design chat components reference (`surface`, `surface-container-low/high/highest/lowest`, `on-surface`, `on-surface-variant`, `primary`, `on-primary`, `outline-variant`, `surface-variant`, `surface-tint`, `inverse-surface`, `text-error`, `surface-error`) and every `text-*` font token used by `Typography`. **No new tokens are required.**
- **Libraries already available** (`package.json`): `react@19`, `react-router@7`, `lucide-react`, `js-cookie`, `tailwind-merge`, `tailwindcss@4`, `zod`, `react-hook-form`. No Zustand/Jotai present — local state stays in the page via `useState` object-state (consistent with `use-google-auth.ts`).

### What the change should achieve

The `/home` route (the post-login landing), gated behind the JWT cookie, renders a chat screen visually identical to the `project-design` chat states, driven by a data layer that calls the Plan 1 contract (`GET /messages/list`, `POST /messages/create`) with the stored JWT in the auth header. On open it loads history (Loading → Empty or Populated); typing toggles Composing; sending appends the user bubble, shows the typing indicator (Awaiting reply), then appends Ben's reply plus any capture, keeping the newest message in view.

---

## Decisions

1. **Route — chat replaces `/home` as the signed-in landing (confirmed).** The chat screen renders at the existing `ROUTES.home` (`/home`). Since `use-google-auth.ts` already navigates to `ROUTES.home` after login, **no auth-flow edit is needed**. No separate `/chat` key is added. The existing `Home` placeholder page is no longer routed (left in the tree, unused — not deleted by this plan). The chat page keeps the same self-guard `Home` used (`Cookies.get(JWT_COOKIE)` → redirect to login). Resolved during the main-agent review.

2. **Component placement.** The chat building blocks are reused only by the chat screen for now, so they live **page-scoped** under `src/pages/Chat/components/**` following the `page-structure.md` design (folder-per-medium/big-component). The single exception is `IconButton`, a foundational primitive (button with an icon) that belongs with the other UI primitives at `src/layout/components/ui/icon-button.tsx` — consistent with `project-design` placing it under `ui/` and with the React-component pattern "UI components are small foundational components." `Typography` and `BrandMark` already exist in `project-web` and are reused as-is.

3. **`ChatShell` as the layout.** Port `_chat-shell.tsx` to `src/pages/Chat/components/ChatShell/ChatShell.tsx`. It keeps the exact same fixed header/scroll-body/fixed-footer structure and class strings so spacing matches pixel-for-pixel (`max-w-120`, `pt-20`, `pb-60`/`pb-44`, fixed `h-16` header, fixed footer). The web Home/Login use `min-h-dvh` + `bg-background`; the shell uses `bg-surface` — both tokens exist; we keep the design's `bg-surface` for visual fidelity.

4. **State model = single object state in the page.** Per the coding patterns ("Use object state for state management"), the page holds one `ChatPageState` object and a `setState`. The visible state is **derived** from that object (see the state-to-UI table), not stored as a separate enum, to avoid drift. This matches the `use-google-auth.ts` precedent (object state + derived booleans like `isLoading`).

5. **Data layer shape.** A thin, framework-free client module (`src/layout/services/messages.ts`) exposes `listMessages` and `createMessage` returning typed DTOs that mirror the Plan 1 contract. A page hook (`src/pages/Chat/hooks/use-chat.ts`) orchestrates load/send/state and exposes a lean API to the page and its components (custom-hook strategy from `minimum-props-strategies.md`). Types live in `src/pages/Chat/states/message.ts` (page-scoped domain shapes) and are imported by the service.

6. **Auth headers (confirmed against backend).** The backend `authMiddleware` (`project-backend/src/infra/http/middlewares/auth.ts`) requires **two custom headers**, not `Authorization: Bearer`: `jwtauthenticationtoken` (the `@ben/jwttoken` cookie / `JWT_COOKIE`) and `providerauthenticationtoken` (the `@ben/authprovidertoken` cookie / `PROVIDER_COOKIE`, the Firebase idToken). Both cookies are already set by `use-google-auth.ts` at login. `userId` is never sent (derived server-side per the contract). Resolved during the main-agent review — no longer an open question.

7. **No voice behavior.** `ChatInput` is ported with its visual mic button preserved (design fidelity) but the mic is inert — only the Send affordance is wired. No recording/transcription states. The `MessageBubble` `pending`/`error` and `CaptureCard` `error`/`fired`/`active`/`finished` variants are ported for visual completeness but only the in-scope states are driven by the page.

8. **Newest-in-view.** History is fetched latest-first per the contract, reversed for display (oldest top / newest bottom), and a bottom sentinel `ref` is scrolled into view after load, after send, and when the reply arrives.

---

## Files to Create / Modify

### `src/core/routes.ts` — no change

`ROUTES` stays `{ login: "/", home: "/home" }`. No `chat` key is added — chat renders at `home`.

### Modify — `src/core/router.tsx`

Point `ROUTES.home` at the new `Chat` page (chat is the signed-in landing). The old `Home` import/route is removed from the router:

```tsx
import { BrowserRouter, Route, Routes } from "react-router";
import { Chat } from "../pages/Chat/page";
import { Login } from "../pages/Login/page";
import { ROUTES } from "./routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.home} element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Modify — `src/core/api-routes.ts`

Add a `messages` group. List takes query params (`limit`, optional `before`) appended by the service.

```ts
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string

export const API_ROUTES = {
  auth: {
    loginOrRegister: `${BACKEND_URL}/auth/login-or-register`,
  },
  messages: {
    list: `${BACKEND_URL}/messages/list`,
    create: `${BACKEND_URL}/messages/create`,
  },
}
```

### Create — `src/layout/components/ui/icon-button.tsx`

Port of the design `IconButton`, import path adjusted to `../../utils/styles`. (Note the design `IconButton` uses `text-primary`; preserve it for fidelity.)

```tsx
import type { ReactNode } from "react";
import { cn } from "../../utils/styles";

type IconButtonProps = {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function IconButton({ label, children, className, onClick }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high",
        className,
      )}
    >
      {children}
    </button>
  );
}
```

### Create — page-scoped domain types: `src/pages/Chat/states/message.ts`

Mirrors the Plan 1 Message DTO and capture shape (string `id`, role `user | ben`, `content`, `createdAt`, optional `capture` of kind `note | reminder | task` + referenced `itemId`). Includes the list/create request/response shapes and a local-only `pendingId`/`status` to render the optimistic user bubble + typing indicator (transient, not contract fields).

```ts
export type MessageRole = "user" | "ben";

export type CaptureKind = "note" | "reminder" | "task";

export interface MessageCapture {
  kind: CaptureKind;
  itemId: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  capture?: MessageCapture;
}

export interface ListMessagesRequest {
  limit?: number;
  before?: string;
}

export interface ListMessagesResponse {
  messages: Message[];
  nextBefore: string | null;
  hasMore: boolean;
}

export interface CreateMessageRequest {
  content: string;
}

export interface CreateMessageResponse {
  userMessage: Message;
  benMessage: Message;
  capture?: MessageCapture;
}
```

> The exact `nextBefore` / `hasMore` field names and whether `capture` is nested on `benMessage` vs. returned at the top level are the **Plan 1 contract specifics** to confirm against the final contract doc before wiring (Open question 2). The shapes above follow the contract's described semantics (window of messages + pagination signal; user message + Ben reply + optional capture).

### Create — data service: `src/layout/services/messages.ts`

Framework-free client matching the existing `fetch` conventions (`response.ok` check, `JSON.stringify`, `response.json()`), adding the JWT auth header. Mirrors how `use-google-auth.ts` calls the backend.

```ts
import Cookies from "js-cookie";
import { API_ROUTES } from "../../core/api-routes";
import { JWT_COOKIE, PROVIDER_COOKIE } from "../hooks/use-google-auth";
import type {
  CreateMessageRequest,
  CreateMessageResponse,
  ListMessagesRequest,
  ListMessagesResponse,
} from "../../pages/Chat/states/message";

const DEFAULT_LIST_LIMIT = 20;

// Backend `authMiddleware` (project-backend/src/infra/http/middlewares/auth.ts)
// requires BOTH custom headers — NOT `Authorization: Bearer`:
//   jwtauthenticationtoken      ← @ben/jwttoken cookie (JWT_COOKIE)
//   providerauthenticationtoken ← @ben/authprovidertoken cookie (PROVIDER_COOKIE, the Firebase idToken)
function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    jwtauthenticationtoken: Cookies.get(JWT_COOKIE) ?? "",
    providerauthenticationtoken: Cookies.get(PROVIDER_COOKIE) ?? "",
  };
}

export async function listMessages(
  request: ListMessagesRequest = {},
): Promise<ListMessagesResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(request.limit ?? DEFAULT_LIST_LIMIT));
  if (request.before) {
    params.set("before", request.before);
  }

  const response = await fetch(`${API_ROUTES.messages.list}?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to load messages.");
  }

  return response.json();
}

export async function createMessage(
  request: CreateMessageRequest,
): Promise<CreateMessageResponse> {
  const response = await fetch(API_ROUTES.messages.create, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to send message.");
  }

  return response.json();
}
```

> Module location note: `JWT_COOKIE` currently lives in `use-google-auth.ts`. To avoid coupling a service to a hook file, optionally relocate the constant to a small `src/layout/utils/auth.ts` and re-export from `use-google-auth.ts`. Listed as a minor refactor; the plan keeps the import from `use-google-auth.ts` to avoid touching the login flow unless desired.

### Create — orchestration hook: `src/pages/Chat/hooks/use-chat.ts`

Owns the page state object and the load/send orchestration; exposes a lean API. Drives all five states from one `ChatPageState`.

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { createMessage, listMessages } from "../../../layout/services/messages";
import type { Message } from "../states/message";

interface ChatPageState {
  isLoadingHistory: boolean;
  messages: Message[];
  draft: string;
  isAwaitingReply: boolean;
}

const INITIAL_STATE: ChatPageState = {
  isLoadingHistory: true,
  messages: [],
  draft: "",
  isAwaitingReply: false,
};

export function useChat() {
  const [state, setState] = useState<ChatPageState>(INITIAL_STATE);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const loadHistory = useCallback(async () => {
    const response = await listMessages();
    const orderedOldestFirst = [...response.messages].reverse();
    setState((previous) => ({
      ...previous,
      isLoadingHistory: false,
      messages: orderedOldestFirst,
    }));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isAwaitingReply]);

  function handleDraftChange(value: string) {
    setState((previous) => ({ ...previous, draft: value }));
  }

  async function handleSend() {
    const content = state.draft.trim();
    if (!content || state.isAwaitingReply) {
      return;
    }

    const optimisticUserMessage: Message = {
      id: `pending-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setState((previous) => ({
      ...previous,
      draft: "",
      isAwaitingReply: true,
      messages: [...previous.messages, optimisticUserMessage],
    }));

    const response = await createMessage({ content });
    const benMessage = response.capture
      ? { ...response.benMessage, capture: response.capture }
      : response.benMessage;

    setState((previous) => ({
      ...previous,
      isAwaitingReply: false,
      messages: [
        ...previous.messages.filter((message) => message.id !== optimisticUserMessage.id),
        response.userMessage,
        benMessage,
      ],
    }));
  }

  return {
    isLoadingHistory: state.isLoadingHistory,
    messages: state.messages,
    draft: state.draft,
    isAwaitingReply: state.isAwaitingReply,
    isEmpty: !state.isLoadingHistory && state.messages.length === 0,
    bottomRef,
    handleDraftChange,
    handleSend,
  };
}
```

> Error handling is intentionally minimal (out of scope: error-recovery). The contract says failed Ben reply / failed capture are transient/client-side and not persisted; for the MVP a failed `createMessage` simply clears the awaiting state without inventing error UI. (Confirm desired no-op vs. silent revert in implementation; not a new contract shape.)

### Create — chat components under `src/pages/Chat/components/**`

All are ports of the design components with `cn` import paths fixed to `project-web` (`../../../layout/utils/styles` etc.) and `Typography` imported from `project-web`'s `ui/typography`. Class strings are copied verbatim for pixel fidelity.

- **`ChatShell/ChatShell.tsx`** — port of `_chat-shell.tsx`. Imports `BrandMark` from `project-web`'s `layout/components/brand-mark` and the new `IconButton`. Same props: `children`, `footer`, `peek?`, `topBanner?`, `bodyClassName?`.
- **`MessageBubble/MessageBubble.tsx`** — port of `message-bubble.tsx` (props `from`, `state?`, `children`, `footer?`, `className?`). The page uses `state="skeleton"` for loading and default for real messages.
- **`ChatInput/ChatInput.tsx`** — port of `chat-input.tsx`. Wire `value`, `onChange`, and add an `onSend` callback fired by the Send button and on Enter; mic button stays inert. Modes `idle | composing | disabled` are driven by the page (`disabled` during loading; Send shown when `value.length > 0`).
- **`CaptureCard/CaptureCard.tsx`** — port of `capture-card.tsx`. Page passes `kind` and a `title`/`meta` derived from the message capture (the contract carries `kind` + `itemId`; display copy for `title`/`meta` is whatever the message content/reply provides — see Open question 3).
- **`ActiveTaskPeek.tsx`** — single-file port of `active-task-peek.tsx` (small, but multi-variant; keep as a single file). Variants `skeleton` (loading) and `summary` (populated). Count/title sourcing is a placeholder until a tasks contract exists (Open question 4).
- **`SuggestedAction.tsx`** — single-file port of `suggested-action.tsx`, used only by the Empty state.
- **`TypingIndicator.tsx`** — single-file port of `ui/typing-indicator.tsx`, used by Awaiting reply.

Component-state sub-views composed by `page.tsx`:

- **`ChatHistory/ChatHistory.tsx`** — renders the ordered `messages` as `MessageBubble`s, attaching a `CaptureCard` inside Ben bubbles that carry a `capture`. Reads `messages` via props from the page (page owns the hook).
- **`ChatHistory/ChatHistorySkeleton.tsx`** — the loading skeleton layout from `chat-loading.tsx` (alternating skeleton Ben bubbles + right-aligned skeleton bars).
- **`ChatEmptyState/ChatEmptyState.tsx`** — the welcome layout from `chat-empty.tsx` (icon, "No recent messages." copy, two `SuggestedAction`s).

### Create — `src/pages/Chat/page.tsx`

Composes the shell with the derived state. Guards auth exactly like `Home`. Uses the `useChat` hook; passes only minimal props down (messages list, draft handlers, refs).

```tsx
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { JWT_COOKIE } from "../../layout/hooks/use-google-auth";
import { ROUTES } from "../../core/routes";
import { ActiveTaskPeek } from "./components/ActiveTaskPeek";
import { ChatEmptyState } from "./components/ChatEmptyState/ChatEmptyState";
import { ChatHistory } from "./components/ChatHistory/ChatHistory";
import { ChatHistorySkeleton } from "./components/ChatHistory/ChatHistorySkeleton";
import { ChatInput } from "./components/ChatInput/ChatInput";
import { ChatShell } from "./components/ChatShell/ChatShell";
import { useChat } from "./hooks/use-chat";

export function Chat() {
  const navigate = useNavigate();
  const chat = useChat();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  return (
    <ChatShell
      peek={
        <ActiveTaskPeek variant={chat.isLoadingHistory ? "skeleton" : "summary"} />
      }
      footer={
        <ChatInput
          value={chat.draft}
          mode={chat.isLoadingHistory ? "disabled" : "idle"}
          onChange={(event) => chat.handleDraftChange(event.target.value)}
          onSend={chat.handleSend}
        />
      }
      bodyClassName={chat.isEmpty ? "px-6" : undefined}
    >
      {chat.isLoadingHistory ? (
        <ChatHistorySkeleton />
      ) : chat.isEmpty ? (
        <ChatEmptyState />
      ) : (
        <ChatHistory
          messages={chat.messages}
          isAwaitingReply={chat.isAwaitingReply}
          bottomRef={chat.bottomRef}
        />
      )}
    </ChatShell>
  );
}
```

> The bottom sentinel `<div ref={bottomRef} />` is rendered at the end of `ChatHistory` (and after the typing indicator) so `scrollIntoView` keeps the newest exchange visible.

---

## Existing Code to Reuse

| Reuse | From | How |
|---|---|---|
| `cn` class merger | `src/layout/utils/styles.ts` | All ported components import `cn` here instead of design's `../utils/cn`. |
| `Typography` | `src/layout/components/ui/typography.tsx` | Same variants as design; reuse directly. |
| `BrandMark` / `BenLogo` | `src/layout/components/brand-mark.tsx`, `icons/ben-logo.tsx` | Used inside `ChatShell` header. |
| Auth guard pattern | `src/pages/Home/page.tsx` | Copied `useEffect` + `Cookies.get(JWT_COOKIE)` → `navigate(ROUTES.login)`. |
| `JWT_COOKIE` constant | `src/layout/hooks/use-google-auth.ts` | Imported by the service and the page guard. |
| `fetch` conventions | `src/layout/hooks/use-google-auth.ts` | `response.ok` checks, `JSON.stringify`, `response.json()`; service follows the same shape, adding the auth header. |
| `BACKEND_URL` + `API_ROUTES` | `src/core/api-routes.ts` | Endpoints centralized; service references `API_ROUTES.messages.*`. |
| Theme tokens | `src/core/global.css` | Every color/font token used by the design chat components already exists — no additions. |
| Design components (visual source) | `project-design/src/layout/components/**`, `pages/app/chat-*.tsx`, `_chat-shell.tsx` | Ported verbatim (class strings preserved) into `project-web` page scope. |

---

## State-to-UI mapping

Derived from `ChatPageState` (no separate state enum):

| Visible state | `ChatPageState` condition | Shell `peek` | Shell `footer` | Body |
|---|---|---|---|---|
| Loading history | `isLoadingHistory === true` | `ActiveTaskPeek variant="skeleton"` | `ChatInput mode="disabled"` | `ChatHistorySkeleton` (skeleton bubbles + bars) |
| Empty | `!isLoadingHistory && messages.length === 0` | `ActiveTaskPeek` (empty/summary) | `ChatInput mode="idle"` | `ChatEmptyState` (welcome + suggested actions), `bodyClassName="px-6"` |
| Populated | `!isLoadingHistory && messages.length > 0 && !isAwaitingReply` | `ActiveTaskPeek variant="summary"` | `ChatInput mode="idle"` (or `composing` when `draft.length > 0`) | `ChatHistory` bubbles, Ben bubbles render inline `CaptureCard` when `capture` present |
| Composing | any non-loading state with `draft.length > 0` | unchanged | `ChatInput mode="composing"` → Send affordance shown | conversation stays visible above |
| Awaiting reply | `isAwaitingReply === true` | `ActiveTaskPeek variant="summary"` | `ChatInput mode="idle"` | `ChatHistory` + optimistic user bubble + `TypingIndicator` at the end |

`ChatInput` Send vs. mic affordance: Send is shown when `value.length > 0` (design's `hasText`); mic shown otherwise but inert (no voice in MVP).

---

## API client shapes (per Plan 1 contract)

| Operation | Method + endpoint | Request | Response |
|---|---|---|---|
| Load history | `GET /messages/list?limit=20[&before=<cursor>]` | `ListMessagesRequest { limit?=20, before? }` (query string; `userId` server-side) | `ListMessagesResponse { messages: Message[] (latest-first), nextBefore: string \| null, hasMore: boolean }` |
| Send message | `POST /messages/create` | `CreateMessageRequest { content }` (JSON body; `userId` server-side) | `CreateMessageResponse { userMessage: Message, benMessage: Message, capture? }` |

`Message = { id: string; role: "user" \| "ben"; content: string; createdAt: string; capture?: { kind: "note" \| "reminder" \| "task"; itemId: string } }`. Auth headers: `jwtauthenticationtoken` (`@ben/jwttoken` cookie) + `providerauthenticationtoken` (`@ben/authprovidertoken` cookie). Display ordering: list is reversed to oldest-top/newest-bottom; on create, append `userMessage` then `benMessage`.

---

## Verification

1. **Type check (required):**
   ```bash
   cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
   ```
   Expect zero errors. Confirms all imports/types (route key, `API_ROUTES.messages`, DTOs, hook return, component props) line up.

2. **Smoke (manual, `npm run dev`):**
   - Navigate to `/home` **without** the `@ben/jwttoken` cookie → redirected to `/` (login).
   - With the cookie set, `/home` shows the **Loading** skeleton, then resolves to **Empty** (no history) or **Populated** (history rendered oldest-top/newest-bottom; Ben capture messages show inline `CaptureCard`).
   - Type into the input → Send affordance appears (**Composing**).
   - Send → user bubble appears immediately, `TypingIndicator` shows (**Awaiting reply**), then Ben's reply (+ capture) appends and the view scrolls to the newest message.
   - Visually compare each state against `project-design` `chat-loading`, `chat-empty`, `chat-populated`, `chat-composing`, `chat-awaiting-reply` (spacing, bubble styles, peek, input).

3. **No backend files touched** — confirm `git status` shows changes only under `project-web/`.

> Do **NOT** run `npm run lint:fix` as part of this plan (explicitly excluded).

---

## Open questions (confirm before implementing)

1. **Chat as landing page? — RESOLVED.** Chat replaces `/home` as the signed-in landing: the `Chat` page is rendered at `ROUTES.home`; the old `Home` page is unrouted; no auth-flow edit needed (login already navigates to `ROUTES.home`). See Decision 1.
2. **Exact contract field names.** Confirm the final Plan 1 doc for: the list pagination field names (`nextBefore` / `hasMore` assumed) and whether `capture` is nested on `benMessage` or top-level in the create response. (Auth header is resolved — see Decision 6.)
3. **CaptureCard display copy.** The contract carries `kind` + `itemId` only; `CaptureCard` renders `title`/`meta`. Confirm where the human-readable title/meta come from (e.g., derived from Ben's reply content, or a future item-lookup) for the MVP.
4. **ActiveTaskPeek data source.** The peek shows `count`/`title` of in-progress tasks; no tasks contract exists in this plan's scope. Confirm whether to render `variant="empty"` for the MVP or stub a placeholder summary.
