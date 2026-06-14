# Plan 10 — Chat logic backbone (state, stores, hooks, utils)

**Plan 7 [Frontend] (parallel)**: Port the chat page's non-UI logic.

- Depends on Phase 1 foundation + auth (plans 01–09). Owns `src/pages/chat/states/`, `src/pages/chat/stores/`, `src/pages/chat/hooks/use-chat-messages.ts`, and `src/pages/chat/utils/`. Runs in parallel with plan 11 (shared composite layout components), which owns `src/layout/components/chat-input|chat-banner|brand-mark`. The chat UI plans (12–15) depend on this backbone.

## Goal

Port the chat session logic intact (Zustand + Jotai are platform-agnostic). The Vercel `ai` SDK streaming is preserved (analysis says it works in RN; validate transport). No UI here.

## Scope / owned files

- `project-mobile/src/pages/chat/states/chat-state.ts` — `draftAtom` (Jotai).
- `project-mobile/src/pages/chat/stores/messages-store/` — `index.ts` (`useMessagesStore`), `types.ts`, `message-builders.ts`, `dispatch-reply.ts`, `animate-reply.ts`, `invalidate-captured-queries.ts`. Copy intact; verify the `ai`/fetch streaming transport works under RN (no DOM APIs).
- `project-mobile/src/pages/chat/hooks/use-chat-messages.ts` — `useChatMessages()` combining history (cursor) + session.
- `project-mobile/src/pages/chat/utils/chat-messages.ts` — `BenUiMessage` type, `getMessageText()`.

## Verification

`npx tsc --noEmit` passes.
