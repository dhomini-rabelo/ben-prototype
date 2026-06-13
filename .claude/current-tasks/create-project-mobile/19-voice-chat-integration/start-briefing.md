# Plan 19 — Integrate voice into the chat footer + page

**Plan 12 [Frontend] (sync)**: Wire recording into the chat footer and register the transcript handler.

- Runs **alone** after voice store (17), RecordingBar (18), and chat page assembly (16). It edits files owned by earlier completed plans (chat footer, chat page), so it must run sequentially and alone.

## Goal

Connect the voice flow into chat: the footer's record button starts recording, the `RecordingBar` overlays while recording/transcribing, and the chat page registers `setTranscriptHandler` so a finished transcription is sent as a chat message.

## Scope / owned files (edits to existing files)

- `project-mobile/src/pages/chat/components/chat-footer/` (owned by plan 15) — wire the record `IconButton` `onStartRecording` → `useVoiceStore.startRecording`; render `RecordingBar` when recording/transcribing.
- `project-mobile/src/pages/chat/page.tsx` (owned by plan 16) — in an effect, `useVoiceStore.setTranscriptHandler((text) => useMessagesStore.sendText(text))`; gate with `useCanRecord`.

## Verification

`npx tsc --noEmit` passes; record → transcribe → message-sent works end-to-end.
