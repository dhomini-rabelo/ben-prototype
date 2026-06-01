# Start briefing

**Plan 2 [Frontend] (parallel)**: Voice & connectivity data layer — hooks + transcription API client.

## Goal

Build the headless logic that the chat integration (Plan 3) will consume, with **no edits** to the chat page, `useChat`, or `chat-input` (those belong to Plan 3). Provide:

1. `useMediaRecorder` — wraps `MediaRecorder` + `navigator.mediaDevices.getUserMedia`: requests mic permission, records a clip, exposes recording state, elapsed time, the resulting audio `Blob`, a `cancel()`, and a `permission` status (`granted | denied | prompt`) for the permission-denied state.
2. `useConnectivity` — exposes `isOffline` via `navigator.onLine` + `online`/`offline` event listeners.
3. Transcription API client — adds the `transcription` route constant, a model/type for the response, and a `transcribeAudio(blob)` function that POSTs multipart form-data to `POST /transcription` (field `audio`) via the authenticated client and returns `{ text }`.

Consume the contract from Plan 1: `POST /transcription`, field `audio`, response `{ text: string }`.

## Files owned (project-web only)

- `src/pages/chat/hooks/use-media-recorder.ts` (new)
- `src/pages/chat/hooks/use-connectivity.ts` (new)
- `src/api/routes.ts` (edit — add `transcription` route)
- `src/api/models/transcription.ts` (new — response type)
- `src/api/transcription.ts` (new — `transcribeAudio` call function)

Does **not** touch `page.tsx`, `use-chat.ts`, `chat-input.tsx`, or any presentational component (Plan 3 / the presentation plan own those).
