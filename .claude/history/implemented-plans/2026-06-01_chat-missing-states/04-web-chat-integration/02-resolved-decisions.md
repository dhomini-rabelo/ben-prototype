# Resolved decisions (override the deep plans' open questions)

These answers were approved by the user and take precedence over the "Open questions" in the deep plans.

## OQ-1 — Recording controls: Mic = stop & send, slide = cancel

- The red mic button in `RecordingBar` **stops recording and sends the clip to transcription** (`onStop`).
- The "Slide up to cancel" control/hint **discards** the recording (`onCancel`).
- **Presentation plan change:** `RecordingBar` must expose BOTH `onStop` (red mic button) and `onCancel` (slide-up / cancel control), not just `onCancel`.

## OQ-3 — Offline behavior: Disable send + show banner (no queue)

- While offline: show the offline `ChatBanner` and **disable sending** (input/send greyed) until reconnect.
- No send-queue infrastructure is built. The design's "queued · sends on reconnect" label is **visual-only** for the prototype.

## OQ-2 / Retry affordance: Follow the design style (inline footers in the message bubble)

- Be faithful to the design: render the **transcribing** state as a transient pending user message bubble with the `TranscribingFooter` ("Hearing you" + dots + cancel), and the **error** state as the failed user message bubble in error state with the `RetryFooter` ("Tap to retry"). The error `ChatBanner` still shows at the top.
- **Plan 3 scope change:** Plan 3 additionally **owns `project-web/src/pages/chat/components/chat-history/chat-history.tsx`** so it can render the transient voice bubble and forward the `footer` prop into `message-bubble.tsx` (which already supports `footer`). This stays conflict-free: `chat-history.tsx` is touched by no other plan, and Plan 3 runs last and alone.
- `message-bubble.tsx` is **not** edited (it already supports `footer`).
