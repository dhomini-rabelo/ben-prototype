# Plan 17 — Voice store + recorder (expo-av)

**Plan 10 [Frontend] (parallel)**: Rewrite the voice recording store and recorder over expo-av.

- Depends on the transcription request (plan 04), connectivity store (plan 07). Owns `src/layout/stores/voice-store/` and the voice/permission hooks. Runs at its own slot (the RecordingBar UI, plan 18, depends on it).

## Goal

Rewrite **only** `recorder.ts` and `mic-permission.ts` over `expo-av` (analysis point 3) while **preserving the voice state machine** (timer, `transcriptionRunId`, `setTranscriptHandler`, statuses). `MediaRecorder` → `Audio.Recording`; permission via `Audio.requestPermissionsAsync()`; export `.m4a`/`.caf` URI and send it in `FormData` (via plan 04's transcription request).

## Scope / owned files

- `project-mobile/src/layout/stores/voice-store/index.ts` — `useVoiceStore` (state machine copied intact: `transcription`, `isRecording`, `recorderError`, `micPermission`, `recordingSeconds`, `setTranscriptHandler`, `startRecording`, `stopRecording`, `cancelRecording`, `cancelTranscribing`, `retryVoice`, `dismissError`, `subscribeMicPermission`).
- `project-mobile/src/layout/stores/voice-store/types.ts` — copy intact.
- `project-mobile/src/layout/stores/voice-store/recorder.ts` — **rewritten** over `expo-av` `Audio.Recording`: `startRecorder`, `stopRecorder` (returns file URI), `cancelRecorder`, `releaseRecorder`.
- `project-mobile/src/layout/stores/voice-store/mic-permission.ts` — **rewritten** using `Audio.requestPermissionsAsync()`/`getPermissionsAsync()` (no `navigator.permissions`).
- `project-mobile/src/layout/stores/voice-store/select-voice-status.ts` — copy intact.
- `project-mobile/src/pages/chat/hooks/use-can-record.ts` + `use-microphone-permission.ts` — port (mic + offline gating).

## Verification

`npx tsc --noEmit` passes.
