# Plan 10 — Chat Logic Backbone (state, stores, hooks, utils)

Port the `project-web` chat page's **non-UI logic** into `project-mobile`. Zustand + Jotai are platform-agnostic, so the bulk is a near-intact copy. The only real code change is replacing the browser/Node `crypto.randomUUID()` global with a React Native-safe id generator. No UI in this unit.

## Context & key findings (verified against the web codebase)

- **`ai` SDK usage is type-only.** Across all in-scope and adjacent chat files, the only reference is `import type { UIMessage } from "ai"` in `utils/chat-messages.ts`. There is **no** `@ai-sdk/react`, no `useChat`, and **no SSE/fetch streaming** anywhere in the chat backbone. The "typing" effect is a purely local `setInterval` animation over a single full-text backend response (`dispatchReply` -> `animateReply`). Therefore **no streaming-transport validation is required** for this unit — the `ai` package is needed only as a type dependency. (The mobile scaffold already lists `"ai"` per `MOBILE-PORT-ANALYSIS.md`.)
- **The one platform global to replace:** `message-builders.ts` calls `crypto.randomUUID()` twice. `crypto` is not guaranteed in the React Native (Hermes) runtime. Fix below.
- **Timers are RN-safe:** `setInterval` / `clearInterval` (and `ReturnType<typeof setInterval>`) exist in React Native. `animate-reply.ts` and the `typingIntervalId` slice in `index.ts`/`types.ts` copy **intact**.
- **Cross-layer dependencies (owned by plans 01–09, assumed present — NOT created here):**
  - `@/api/client` → `queryClient`, `authClient`
  - `@/api/requests/chat` → `requestSendChatMessage`
  - `@/api/responses/agent-reply` → `AgentReply`, `CaptureView`
  - `@/api/models/message` → `Message`, `MessageCapture`, `CaptureKind`, `MessageRole`
  - `@/api/routes` → `API_ROUTES` (`notes.list`, `tasks.list`, `reminders.list`, `captures.counts`, `messages.list`, `chat.send`)
  - `@/layout/hooks/api/use-message-list-data` → `useMessageListData` (cursor pagination)
  - `@/layout/stores/connectivity-store` → `useConnectivityStore` (offline guard)
  - The `@/` path alias must already be wired in the mobile `tsconfig` + Metro/babel module-resolver (Phase 1 scaffold).
- `project-mobile/` does not exist yet at the repo root; this plan presupposes plans 01–09 have scaffolded it (Expo, API layer, auth, `@/` alias).

## Scope — owned files (create these, mirroring web 1:1 except where noted)

All under `project-mobile/`:

1. `src/pages/chat/states/chat-state.ts`
2. `src/pages/chat/utils/chat-messages.ts`
3. `src/pages/chat/stores/messages-store/types.ts`
4. `src/pages/chat/stores/messages-store/message-builders.ts` **(only file that changes — id generator)**
5. `src/pages/chat/stores/messages-store/animate-reply.ts`
6. `src/pages/chat/stores/messages-store/invalidate-captured-queries.ts`
7. `src/pages/chat/stores/messages-store/dispatch-reply.ts`
8. `src/pages/chat/stores/messages-store/index.ts`
9. `src/pages/chat/hooks/use-chat-messages.ts`

**Parallel-safety:** this plan touches ONLY `src/pages/chat/states/`, `src/pages/chat/stores/`, `src/pages/chat/hooks/use-chat-messages.ts`, and `src/pages/chat/utils/`. It does not modify any `@/api/*`, `@/layout/*`, or layout components (those belong to plans 01–11). Safe to run in parallel with plan 11.

---

## Step 1 — Draft input state (`states/chat-state.ts`)

Copy intact. Platform-agnostic Jotai atom.

```ts
import { atom } from "jotai";

export const draftAtom = atom("");
```

## Step 2 — Chat message contract + helper (`utils/chat-messages.ts`)

Copy intact. `UIMessage` is a **type-only** import from `ai`; `getMessageText` is pure JS.

```ts
import type { UIMessage } from "ai";
import type { MessageCapture } from "@/api/models/message";

export type BenMessageMetadata = {
  capture?: MessageCapture;
};

export type BenUiMessage = UIMessage<BenMessageMetadata>;

export function getMessageText(message: BenUiMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
```

## Step 3 — Store types (`stores/messages-store/types.ts`)

Copy intact. `ReturnType<typeof setInterval>` resolves correctly under RN.

```ts
import type { StateCreator } from "zustand";
import type { BenUiMessage } from "@/pages/chat/utils/chat-messages";

export interface MessagesStore {
  sessionMessages: BenUiMessage[];
  isAwaitingReply: boolean;
  sendError: boolean;
  typingIntervalId: ReturnType<typeof setInterval> | null;

  stopTyping: () => void;
  sendText: (content: string) => Promise<boolean>;
  retrySend: () => Promise<void>;
}

export type StoreSet = Parameters<StateCreator<MessagesStore>>[0];
export type StoreGet = Parameters<StateCreator<MessagesStore>>[1];
```

## Step 4 — Message builders (`stores/messages-store/message-builders.ts`) — THE ONE REAL CHANGE

The web version calls `crypto.randomUUID()`, which is not guaranteed in the React Native (Hermes) runtime. **Concrete fix:** use Expo's `randomUUID` from `expo-crypto`, which is RN-safe and produces the same id shape (RFC-4122 UUID string) and uniqueness guarantee.

- Add `expo-crypto` to `project-mobile`'s dependencies if the Phase 1 scaffold has not already (`npx expo install expo-crypto` — use `expo install` so the version is SDK-pinned, not `npm install`).
- Replace both `crypto.randomUUID()` call sites with `randomUUID()` imported from `expo-crypto`.

```ts
import { randomUUID } from "expo-crypto";
import type { CaptureView } from "@/api/responses/agent-reply";
import type { BenUiMessage } from "@/pages/chat/utils/chat-messages";

export function buildUserMessage(text: string): BenUiMessage {
  return {
    id: randomUUID(),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

export function buildBenMessage(
  text: string,
  capture?: CaptureView | null,
): BenUiMessage {
  return {
    id: randomUUID(),
    role: "assistant",
    parts: [{ type: "text", text }],
    metadata: capture ? { capture } : undefined,
  };
}
```

> `expo-crypto`'s `randomUUID()` is synchronous and returns a `string`, so the call sites need no further change beyond swapping the global. (Fallback if `expo-crypto` is unavailable for any reason: a tiny `uid()` helper in `src/pages/chat/utils/`, but `expo-crypto` is the preferred, project-pinned choice — do not hand-roll unless install fails.)

## Step 5 — Reply animation (`stores/messages-store/animate-reply.ts`)

Copy intact. `setInterval`/`clearInterval` are RN-safe; the typing reveal is local-only (no streaming). Keep `TYPING_STEP_MS = 24` and `TYPING_CHARS_PER_STEP = 3` unchanged.

```ts
import type { StoreGet, StoreSet } from "./types";

const TYPING_STEP_MS = 24;
const TYPING_CHARS_PER_STEP = 3;

export function animateReply(
  set: StoreSet,
  get: StoreGet,
  messageId: string,
  fullText: string,
) {
  get().stopTyping();
  let revealed = 0;
  const intervalId = setInterval(() => {
    revealed = Math.min(revealed + TYPING_CHARS_PER_STEP, fullText.length);
    const nextText = fullText.slice(0, revealed);
    set((state) => ({
      sessionMessages: state.sessionMessages.map((message) =>
        message.id === messageId
          ? { ...message, parts: [{ type: "text", text: nextText }] }
          : message,
      ),
    }));
    if (revealed >= fullText.length) {
      get().stopTyping();
    }
  }, TYPING_STEP_MS);
  set({ typingIntervalId: intervalId });
}
```

## Step 6 — Invalidate captured queries (`stores/messages-store/invalidate-captured-queries.ts`)

Copy intact. Pure React Query + route-map logic; depends on `@/api/client` (`queryClient`) and `@/api/routes` from plans 01–09.

```ts
import { queryClient } from "@/api/client";
import type { CaptureKind } from "@/api/models/message";
import { API_ROUTES } from "@/api/routes";
import type { AgentReply } from "@/api/responses/agent-reply";

const LIST_ROUTE_BY_KIND: Record<CaptureKind, string> = {
  note: API_ROUTES.notes.list,
  task: API_ROUTES.tasks.list,
  reminder: API_ROUTES.reminders.list,
};

export function invalidateCapturedQueries(reply: AgentReply) {
  const capturedKinds = new Set<CaptureKind>();

  if (reply.newNotes.length > 0) capturedKinds.add("note");
  if (reply.newTasks.length > 0) capturedKinds.add("task");
  if (reply.newReminders.length > 0) capturedKinds.add("reminder");
  if (reply.capture) capturedKinds.add(reply.capture.kind);

  if (capturedKinds.size === 0) return;

  for (const kind of capturedKinds) {
    queryClient.invalidateQueries({ queryKey: [LIST_ROUTE_BY_KIND[kind]] });
  }

  queryClient.invalidateQueries({ queryKey: [API_ROUTES.captures.counts] });
}
```

## Step 7 — Dispatch reply (`stores/messages-store/dispatch-reply.ts`)

Copy intact. Single backend round-trip via `requestSendChatMessage` (axios, RN-safe), then invalidate → append → animate. No streaming.

```ts
import { requestSendChatMessage } from "@/api/requests/chat";
import { animateReply } from "./animate-reply";
import { invalidateCapturedQueries } from "./invalidate-captured-queries";
import { buildBenMessage } from "./message-builders";
import type { StoreGet, StoreSet } from "./types";

export async function dispatchReply(
  set: StoreSet,
  get: StoreGet,
  message: string,
) {
  set({ isAwaitingReply: true, sendError: false });

  try {
    const reply = await requestSendChatMessage(message);
    invalidateCapturedQueries(reply);
    const benMessage = buildBenMessage("", reply.capture);
    set((state) => ({
      sessionMessages: [...state.sessionMessages, benMessage],
    }));
    animateReply(set, get, benMessage.id, reply.message);
  } catch {
    set({ sendError: true });
  } finally {
    set({ isAwaitingReply: false });
  }
}
```

## Step 8 — Store entry (`stores/messages-store/index.ts`)

Copy intact. Offline guard via `useConnectivityStore.getState().isOffline` (the connectivity store itself is reimplemented over NetInfo in an earlier plan — this file consumes its public interface unchanged).

```ts
import { create } from "zustand";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { getMessageText } from "@/pages/chat/utils/chat-messages";
import { dispatchReply } from "./dispatch-reply";
import { buildUserMessage } from "./message-builders";
import type { MessagesStore } from "./types";

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  sessionMessages: [],
  isAwaitingReply: false,
  sendError: false,
  typingIntervalId: null,

  stopTyping: () => {
    const intervalId = get().typingIntervalId;
    if (intervalId !== null) {
      clearInterval(intervalId);
      set({ typingIntervalId: null });
    }
  },

  sendText: async (content) => {
    const trimmed = content.trim();
    if (
      !trimmed ||
      get().isAwaitingReply ||
      useConnectivityStore.getState().isOffline
    ) {
      return false;
    }

    get().stopTyping();
    set((state) => ({
      sessionMessages: [...state.sessionMessages, buildUserMessage(trimmed)],
    }));
    await dispatchReply(set, get, trimmed);
    return true;
  },

  retrySend: async () => {
    const messages = get().sessionMessages;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user" || get().isAwaitingReply) {
      return;
    }

    get().stopTyping();
    await dispatchReply(set, get, getMessageText(lastMessage));
  },
}));
```

## Step 9 — Combined chat-messages hook (`hooks/use-chat-messages.ts`)

Copy intact. Merges paginated history (reversed to oldest-first, mapped to `BenUiMessage`) with live session messages; derives `isEmpty`. Depends only on platform-agnostic data hooks.

```ts
import { useMemo } from "react";
import type { Message } from "@/api/models/message";
import { useMessageListData } from "@/layout/hooks/api/use-message-list-data";
import { useMessagesStore } from "@/pages/chat/stores/messages-store";
import type { BenUiMessage } from "@/pages/chat/utils/chat-messages";

export function mapHistoryToUiMessages(history: Message[]): BenUiMessage[] {
  return history.map((message) => ({
    id: message.id,
    role: message.role === "ben" ? "assistant" : "user",
    parts: [{ type: "text", text: message.content }],
    metadata: message.capture ? { capture: message.capture } : undefined,
  }));
}

export function useChatMessages() {
  const { state: historyState, actions: historyActions } = useMessageListData();
  const sessionMessages = useMessagesStore((store) => store.sessionMessages);

  const messages = useMemo(() => {
    const historyOldestFirst = [...historyState.items].reverse();
    return [...mapHistoryToUiMessages(historyOldestFirst), ...sessionMessages];
  }, [historyState.items, sessionMessages]);

  return {
    messages,
    historyState: {
      ...historyState,
      isEmpty: historyState.isLoading ? null : messages.length === 0,
    },
    historyActions,
  };
}
```

---

## Conventions honored

- **kebab-case** file/folder names (web-page-stores-structure).
- **One component/concern per file**; the messages store stays split into the folder shape `index.ts` / `types.ts` / `message-builders.ts` / `dispatch-reply.ts` / `animate-reply.ts` / `invalidate-captured-queries.ts` (matches web exactly).
- **No barrel/index-only re-export files** beyond the existing `messages-store/index.ts`, which itself creates the store (not a pure re-export) — consistent with memory note.
- **No code comments** (self-explanatory code), per code-write-code skill.
- States = ephemeral Jotai atoms (`states/`); stores = Zustand domain stores (`stores/`).

## Things explicitly NOT done in this unit

- No UI / components / pages.
- No edits to `@/api/*`, `@/layout/*`, or connectivity store internals (consumed via their public interface; owned by plans 01–09/11).
- No SSE / fetch-streaming work — confirmed unnecessary (the `ai` SDK is a type-only dependency here).
- No `reset()` root store wiring for the chat page (not present in web; out of scope — would be added by a chat-page plan if needed).
- No formatting step (`prettier`/`lint`) — per task instruction, no formatting in this unit.

## Verification

From `project-mobile/`:

```bash
npx tsc --noEmit
```

Must pass with no errors. (Resolution of the `@/` alias, presence of `ai`, `zustand`, `jotai`, `@tanstack/react-query`, `expo-crypto`, and the `@/api/*` + `@/layout/*` modules all come from plans 01–09 — if `tsc` fails on those imports, the failure is an upstream dependency gap, not this unit.)
