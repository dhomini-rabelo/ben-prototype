# Plan 15 — Chat footer + input/scroll/timer hooks

**Plan 8 [Frontend] (parallel)**: Rewrite the chat footer (input + send/record affordances) and its hooks.

- Depends on shared `chat-input` (plan 11), chat backbone (plan 10), UI primitives (plan 05). Owns `src/pages/chat/components/chat-footer/` and `src/pages/chat/hooks/use-chat-input.ts`, `use-scroll-to-bottom.ts`, `use-elapsed-timer.ts`. Distinct from plans 12/13/14, so it runs in parallel.

## Goal

Rewrite the chat footer for RN: text input (via shared `chat-input`), send button, and a **record button placeholder** (a no-op/disabled mic button until plan 19 wires voice in). Add a `KeyboardAvoidingView` consideration (final placement done at page assembly, plan 16). Port the supporting hooks.

## Scope / owned files

- `project-mobile/src/pages/chat/components/chat-footer/` — RN footer composing `chat-input`, send `IconButton`, and a record `IconButton` exposing an `onStartRecording` prop (left unwired/disabled here; plan 19 supplies it).
- `project-mobile/src/pages/chat/hooks/use-chat-input.ts`.
- `project-mobile/src/pages/chat/hooks/use-scroll-to-bottom.ts` — adapt to the inverted FlatList ref pattern.
- `project-mobile/src/pages/chat/hooks/use-elapsed-timer.ts`.

## Verification

`npx tsc --noEmit` passes.
