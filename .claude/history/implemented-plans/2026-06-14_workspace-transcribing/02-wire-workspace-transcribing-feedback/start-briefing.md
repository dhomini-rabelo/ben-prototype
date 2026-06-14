# Plan 02 — Wire transcribing feedback into the Workspace banner

**Plan 2 [Frontend] (sync)**: Wire transcribing feedback into `workspace-sub-thread-banner.tsx`, reading `voiceStatus` from the voice-store and rendering the `user-pending` banner at top priority.

- Depends on Plan 01 (the new `user-pending` variant). Runs after Plan 01 finishes. Touches only its own consumer file.

## Goal

Give the Task Workspace the same voice-capture feedback the Chat screen already has: while the user's audio is being transcribed, show the `user-pending` Sub-Thread Banner ("Hearing you" indicator) instead of nothing. When transcription completes, the existing flow takes over (`voice-store` calls `sendText` → `isAwaitingReply` → `ben-typing` banner).

## What exists today

`project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx` renders, in order: `pendingDiff → null`, `isAwaitingReply → ben-typing`, `sendError → error`, `lastBenReply → ben-reply`. It does NOT read voice state, so there is no transcribing feedback.

Voice state is global in `project-web/src/layout/stores/voice-store` via `selectVoiceStatus` (`"idle" | "recording" | "transcribing" | "error"`). The Chat screen renders its pending feedback purely off this selector — no store changes needed. The workspace footer already shows `RecordingBar` while `recording` and the shared `ChatInput.ActionButton` already disables Send while `transcribing`, so no footer/store changes are required for parity.

## Required behavior

Read `voiceStatus` (and the voice retry action) from `useVoiceStore` and add branches at the **top** of the banner priority chain (transcription feedback should win over Ben-side states, matching Chat):

- `voiceStatus === "transcribing"` → render `<SubThreadBanner variant="user-pending" />`.
- `voiceStatus === "error"` (transcription failed) → render the `error` variant whose retry restarts voice capture (use the voice-store retry action, e.g. `retryVoice`, NOT `sendText`). Confirm the exact action name by reading the voice-store; mirror what `pages/chat/components/message-footers/retry-footer.tsx` uses.

Keep the existing `pendingDiff / isAwaitingReply / sendError / lastBenReply` branches below the new voice branches, unchanged.

## Reference

- Chat parity: `project-web/src/pages/chat/page.tsx`, `chat-history.tsx`, `message-footers/transcribing-footer.tsx`, `message-footers/retry-footer.tsx`.
- Voice store: `project-web/src/layout/stores/voice-store`.

## Files owned (do not touch anything else)

- `project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`

Do NOT modify `sub-thread-banner.tsx` (Plan 01) or the footer/stores. Consume the `user-pending` variant Plan 01 adds.
