# Plan 01 — Banner `user-pending` variant

**Plan 1 [Frontend] (sync)**: Add the `user-pending` transcribing variant to the workspace `sub-thread-banner.tsx` component.

- Runs first and alone. Plan 02 consumes the new variant, so this must finish before Plan 02 starts.

## Goal

Add a new `user-pending` variant to the project-web workspace Sub-Thread Banner so it can show "Ben is hearing the user" (transcription in progress) feedback in the Task Workspace — bringing voice-capture interaction parity with the Chat screen.

Today the component (`project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`) supports only `ben-reply | ben-typing | error`, all rendered with a hard-coded "Ben" badge. The new `user-pending` variant must:

- Show a **"You"** badge instead of "Ben".
- Show a transcription-in-progress indicator. There is **no streaming transcript text** in project-web (the `voice-store` goes `recording → transcribing(pending) → idle` and only emits the final text via `onTranscript`). So mirror the Chat reference (`pages/chat/components/message-footers/transcribing-footer.tsx`), which shows a "Hearing you" label plus three bouncing dots. Reuse the same copy/animation language so Chat and Workspace feel identical.
- Match the design intent in `project-design/src/layout/components/sub-thread-banner.tsx` (variant `user-pending`: "You" badge, italic muted styling).

## Reference

- Design spec: `project-design/src/pages/app/workspace-transcribing.tsx` and `project-design/src/layout/components/sub-thread-banner.tsx`.
- Chat parity reference: `project-web/src/pages/chat/components/message-footers/transcribing-footer.tsx`.

## Files owned (do not touch anything else)

- `project-web/src/pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`

Do NOT modify the consumer (`workspace-sub-thread-banner.tsx`) — that is Plan 02's job. Keep the existing variants and badge behavior working; only extend the union type and add the `user-pending` rendering branch.
