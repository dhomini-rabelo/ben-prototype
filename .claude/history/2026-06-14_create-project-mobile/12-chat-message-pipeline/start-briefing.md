# Plan 12 — Chat message rendering pipeline

**Plan 8 [Frontend] (parallel)**: Rewrite the chat message list and bubble rendering, including capture cards.

- Depends on the chat backbone (plan 10), shared components (plan 11), UI primitives (plan 05), and data hooks (plan 08). Owns the message-rendering component folders under `src/pages/chat/components/`. Runs in parallel with plans 13/14/15 (other chat areas) — distinct folders. Grouped together (history + bubble + capture card + footers) because the message bubble renders capture cards, so keeping them in one plan avoids a cross-parallel dependency.

## Goal

Rewrite message rendering and replace the web infinite-scroll-up (`IntersectionObserver` + `window.scrollBy`) with an **inverted `FlatList`** + `onEndReached` (analysis "reescritas que não portam direto").

## Scope / owned files

- `project-mobile/src/pages/chat/components/chat-history/` — inverted `FlatList`, cursor pagination via `onEndReached`, scroll-position preserved by inversion.
- `project-mobile/src/pages/chat/components/message-bubble/` — RN bubble; renders text (plain text, no markdown per analysis) and embedded capture cards.
- `project-mobile/src/pages/chat/components/message-footers/`.
- `project-mobile/src/pages/chat/components/capture-card/` + `contexts/capture-card-context.ts`.
- `project-mobile/src/pages/chat/components/typing-indicator.tsx` — Reanimated dots (replaces CSS `animate-bounce`/`animate-pulse`).
- `project-mobile/src/pages/chat/hooks/use-chat-list.ts` — FlatList-based replacement for `use-infinite-scroll-top.ts` and `use-scroll-to-bottom` is owned by plan 15; here only the list/pagination hook for the inverted list.

## Verification

`npx tsc --noEmit` passes.
