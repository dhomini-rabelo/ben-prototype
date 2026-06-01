# Start briefing

**Plan 3 [Frontend] (sync)**: Integration — assemble the missing chat states into the chat page.

## Goal

Wire the data layer (Plan 2 — hooks + transcription client) and the presentation layer (Plan 2 — `ChatBanner`, recording bar, footers) into the live chat page so the missing states work end-to-end. Runs **last and alone** because it edits the files where all the pieces converge.

States to deliver:

1. **Recording** — mic button starts recording; show the recording bar (timer, waveform, slide-to-cancel).
2. **Transcribing** — on stop, upload the clip via `transcribeAudio`, show the "Hearing you" footer; on success, send the text through the existing chat send flow.
3. **Permission denied** — when mic permission is denied, show the warn `ChatBanner` ("Ben can't hear you yet…") and keep text input working.
4. **Offline** — when `isOffline`, show the warn top banner and reflect queued/disabled sending.
5. **Error** — on mic/transcription failure, show the error `ChatBanner` ("mic glitched…") and a retry affordance.

## Files owned (project-web only)

- `src/pages/chat/hooks/use-chat.ts` (edit — integrate recording/transcribing/permission/offline/error state)
- `src/pages/chat/page.tsx` (edit — render banners, recording bar, footers based on state)
- `src/pages/chat/components/chat-input/chat-input.tsx` (edit — wire the mic button + recording mode)

## Dependencies

Depends on **Plan 1** (transcription contract) and **both Plan 2** plans (hooks, API client, and the presentational components). Must start only after all of them finish.
