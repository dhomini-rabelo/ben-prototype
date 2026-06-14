# Plan 1 [Frontend] (parallel) — Render real capture cards from the API

## Plan line

**Plan 1 [Frontend] (parallel)**: Consume the **enriched capture** object returned by `POST /chat` and `GET /messages/list`, attach it to the corresponding Ben message, and render the existing `CaptureCard` with the real item `title` + `meta` — both for the live optimistic reply and after a reload from history.

- Runs in **parallel** with the Backend plan. It touches only files under `project-web/`, so it can never conflict with the Backend plan (which lives entirely under `project-backend/`).
- The two plans agree on the **shared JSON contract** documented below — implement the web side of that contract exactly.

## Goal

Today `chat-history.tsx` already renders `<CaptureCard kind={capture.kind} title={text} />`, but: (1) it uses the **Ben message text** as the title (wrong — should be the item title), and (2) live replies never attach any capture, so a card only ever appears after a reload, and even then `MessageCapture` lacks a title. Make capture cards show correctly live and on reload, using the item's real title + meta.

## Scope — files this plan OWNS (only `project-web/`)

Modified:
- `src/api/models/message.ts` — extend `MessageCapture` to the enriched shape (add `title`, `meta`).
- `src/api/models/agent-reply.ts` — add `capture: MessageCapture | null` (or a `CaptureView` alias) to `AgentReply`.
- `src/pages/chat/hooks/use-chat.ts` — when building the Ben message after a reply, attach `metadata: { capture }` when `reply.capture` is present.
- `src/pages/chat/components/chat-history/chat-history.tsx` — render the card from the capture's own `title`/`meta` (not the message text), with a sensible `state`.
- (If helpful) `src/pages/chat/utils/chat-messages.ts` — `BenMessageMetadata.capture` already exists and `mapHistoryToUiMessages` already maps `message.capture`; adjust only if the enriched shape requires it.

Do **not** modify the `CaptureCard` component files themselves — they already accept `kind`, `title`, `meta`, `state`. Use them as-is.

## SHARED JSON CONTRACT (authoritative — both plans must match)

### CaptureView (enriched capture object, returned by BOTH endpoints)
```jsonc
{
  "kind": "note" | "reminder" | "task",
  "itemId": "string",
  "title": "string",        // the card's main line
  "meta": "string | null"   // secondary line (e.g. reminder time); null when none
}
```

### POST /chat response (web `AgentReply`)
```jsonc
{
  "message": "string",
  "newReminders": [...], "newNotes": [...], "newTasks": [...],
  "historyTopics": [...],
  "capture": CaptureView | null   // NEW — primary captured item this turn, or null
}
```

### GET /messages/list item (web `Message`)
```jsonc
{
  "id": "...", "role": "user"|"ben", "content": "...", "createdAt": "ISO",
  "capture": CaptureView | null   // now carries title + meta
}
```

## Decisions (make these, justified)

- `MessageCapture` becomes `{ kind: CaptureKind; itemId: string; title: string; meta?: string | null }`. Keep it backward-tolerant (`meta` optional/nullable).
- In `chat-history.tsx`, render: `<CaptureCard kind={capture.kind} title={capture.title} meta={capture.meta ?? undefined} state="default" />`. The card still sits inside the Ben `MessageBubble`, after the text (keep current placement).
- No interactive `onAction` handlers yet (there are no backend endpoints to start/complete a task) — render the card display-only. This is acceptable for the prototype; note it as a follow-up.
- Live path: in `use-chat.ts`, the Ben `BenUiMessage` built after `sendChatMessage` must carry `metadata: { capture: reply.capture }` when `reply.capture` is non-null, so the card appears immediately under the typing-revealed reply.

## Constraints

- Match existing code style (TS, React 19, the project's import conventions).
- Do **not** run `npm run lint:fix` — formatting happens once after both parallel plans finish.
- Verify with `npx tsc --noEmit` inside `project-web/`.
