# Plan 11 — Shared composite components (chat-input, chat-banner, brand-mark)

**Plan 7 [Frontend] (parallel)**: Rewrite the shared composite layout components used across chat and task screens.

- Depends on UI primitives (plan 05), tokens (plan 03), and Jotai. Owns `src/layout/components/chat-input/`, `src/layout/components/chat-banner/`, and `src/layout/components/brand-mark.tsx`. Distinct from plan 10 (chat logic), so it runs in parallel. The chat footer (plan 15) and task footer (plan 24) consume `chat-input`; banners are consumed by chat/task shells.

## Goal

Rewrite the composable input and banner components for RN primitives, keeping the Jotai-context composition pattern. `<input>`→`TextInput`, `<div>`→`View`, button parts over `Pressable`.

## Scope / owned files

- `project-mobile/src/layout/components/chat-input/` — `chat-input-root.tsx`, `chat-input-input.tsx` (`TextInput`), `chat-input-action-button.tsx`, `chat-input-attach-button.tsx`, `index.tsx`, `contexts/chat-input.ts` (Jotai). Keep the compound-component API identical.
- `project-mobile/src/layout/components/chat-banner/` — `chat-banner-root.tsx`, `chat-banner-text.tsx`, `chat-banner-icon.tsx`, `chat-banner-action.tsx`, `chat-banner-dismiss.tsx`, `index.tsx`, `contexts/tone.ts`.
- `project-mobile/src/layout/components/brand-mark.tsx` — RN port.

## Verification

`npx tsc --noEmit` passes; components render with NativeWind classes.
