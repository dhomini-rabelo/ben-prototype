# Start briefing

**Plan 2 [Frontend] (parallel)**: Presentation layer — banner + voice UI components.

## Goal

Port/build the **presentational** pieces the chat integration (Plan 3) will render, as self-contained components with **no edits** to the chat page, `useChat`, or `chat-input`. Match the project-design source exactly (see `project-design/src/pages/app/chat-*.tsx` and `project-design/src/layout/components/chat-banner.tsx`). Provide:

1. `ChatBanner` — ported to project-web: `tone` (`info | warn | error`), optional `icon`, optional `action`, `dismissible`. Used for permission-denied, offline, and error banners.
2. **Recording bar** — the recording footer UI: pulsing red dot + "Recording" label, elapsed/max timer, animated waveform bars, "Slide up to cancel" hint, and the active red mic button. Props for elapsed time and a cancel handler.
3. **Message footers** — the "Hearing you" transcribing footer (label + bouncing dots + cancel) and the "Tap to retry" error footer, as small presentational components reusable by the message bubble.

Components must be **presentational only** (props in, no data fetching, no MediaRecorder).

## Files owned (project-web only)

- `src/layout/components/chat-banner.tsx` (new)
- `src/pages/chat/components/recording-bar/recording-bar.tsx` (new, + any local files)
- `src/pages/chat/components/message-footers/` (new — transcribing footer, retry footer)

Does **not** touch `page.tsx`, `use-chat.ts`, `chat-input.tsx`, or the data-layer files (the data plan owns those).
