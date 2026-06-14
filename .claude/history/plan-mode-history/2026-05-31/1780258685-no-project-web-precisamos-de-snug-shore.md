# Fix chat: fill from bottom + auto-load pagination on scroll up

## Context

Two bugs in the **project-web** chat screen:

1. **Messages stick to the top.** When there are few messages (e.g. the first one sent), they render at the top of the screen instead of filling up from the bottom — unlike a normal chat. The `ChatHistory` section uses `flex flex-1 flex-col` with no vertical justification, so content stacks from the top. The skeleton loader already does the right thing with `justify-end`.

2. **Pagination never auto-loads.** Cursor pagination is fully implemented in [use-api-cursor-paginated.ts](project-web/src/layout/hooks/use-api-cursor-paginated.ts) (`fetchNextPage`, `hasMore`, `isFetchingNextPage`), but `useChat` ignores those actions — `fetchNextPage` is never called and there's no scroll listener. We want older messages to load automatically when the user scrolls to the top of the list.

The page uses **document/window scroll** (outer `min-h-dvh`, fixed header/footer); there is no inner overflow container.

## Changes

### 1. Fill messages from the bottom

In [chat-history.tsx:20](project-web/src/pages/chat/components/chat-history/chat-history.tsx#L20) add `justify-end` to the section, mirroring `ChatHistorySkeleton`:

```diff
- <section className="flex flex-1 flex-col gap-4 pt-2">
+ <section className="flex flex-1 flex-col justify-end gap-4 pt-2">
```

Safe with document scroll: `justify-end` only pushes content down when it's shorter than the viewport; once it overflows, the document scrolls normally.

### 2. New hook: auto-load older messages on scroll-to-top

Create `project-web/src/pages/chat/hooks/use-infinite-scroll-top.ts` (kebab-case file, `useInfiniteScrollTop` export — follows the page-structure hooks convention).

Responsibilities:
- Returns a `topRef` to attach to a sentinel `<div>` at the **top** of the message list.
- Uses an `IntersectionObserver` (with a small top `rootMargin`, e.g. `200px`) on the sentinel; when it intersects and `hasMore && !isFetchingNextPage`, it records `document.documentElement.scrollHeight` and calls `onLoadMore()`.
- **Preserves scroll position on prepend** via `useLayoutEffect` keyed on `itemCount`: after older messages are prepended, compute the scrollHeight delta and `window.scrollBy(0, delta)` so the viewport doesn't jump.

Props: `{ hasMore, isFetchingNextPage, onLoadMore, itemCount }`. Returns `{ topRef }`.

### 3. Wire pagination through `useChat`

In [use-chat.ts](project-web/src/pages/chat/hooks/use-chat.ts):
- Destructure `actions` and the extra `state` fields from `useAPICursorPaginated` (`fetchNextPage`, `hasMore`, `isFetchingNextPage`).
- Call `useInfiniteScrollTop({ hasMore, isFetchingNextPage, onLoadMore: fetchNextPage, itemCount: historyState.items.length })` and get `topRef`.
- **Fix the scroll-to-bottom effect** so prepending older messages doesn't yank the view down. Change the dependency from `messages.length` to the id of the last message:
  ```ts
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => { scrollToBottom(); }, [lastMessageId, state.isAwaitingReply]);
  ```
  Pagination prepends at the top, so the last id is unchanged → no scroll. Initial load and newly-sent messages still scroll to bottom.
- Return `topRef` and `isFetchingOlder: historyState.isFetchingNextPage` from the hook.

### 4. Render the sentinel + loading indicator

In [chat-history.tsx](project-web/src/pages/chat/components/chat-history/chat-history.tsx):
- Add `topRef` and `isFetchingOlder` to `ChatHistoryProps`.
- Render `<div ref={topRef} />` as the first child of the section, with an optional small spinner/`TypingIndicator`-style loader shown when `isFetchingOlder`.

In [page.tsx:44-48](project-web/src/pages/chat/page.tsx#L44-L48): pass `topRef={chat.topRef}` and `isFetchingOlder={chat.isFetchingOlder}` to `<ChatHistory>`.

## Files

- [project-web/src/pages/chat/components/chat-history/chat-history.tsx](project-web/src/pages/chat/components/chat-history/chat-history.tsx) — `justify-end`, top sentinel, loader, new props
- `project-web/src/pages/chat/hooks/use-infinite-scroll-top.ts` — **new** hook
- [project-web/src/pages/chat/hooks/use-chat.ts](project-web/src/pages/chat/hooks/use-chat.ts) — wire pagination, fix scroll effect
- [project-web/src/pages/chat/page.tsx](project-web/src/pages/chat/page.tsx) — pass new props

## Verification

1. `cd project-web && npm run lint:fix && npx tsc --noEmit`
2. Run the app (`npm run dev` in project-web) with the backend running.
3. **Fill-from-bottom:** open a chat with one/few messages → they sit at the bottom, just above the input.
4. **Auto-pagination:** open a chat with > 20 messages, scroll to the top → older page loads automatically and the scroll position stays put (no jump to bottom, no flicker to top). Sending a new message still scrolls to the bottom.
