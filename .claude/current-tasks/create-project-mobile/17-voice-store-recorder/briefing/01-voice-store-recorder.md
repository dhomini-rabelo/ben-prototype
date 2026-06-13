# Plan 01 — Voice store + recorder (expo-av)

Port the voice-recording store from `project-web` to `project-mobile`, preserving the voice state machine intact and rewriting only the two platform-specific pieces (audio recorder and microphone permission) over `expo-av`.

## Plan

1. **Preserve the voice state machine unchanged**
   - Keep the store's public shape exactly as in web: recording flag, transcription status, recorder error, mic permission, and elapsed recording seconds.
   - Keep the same lifecycle actions and their semantics: start, stop, cancel recording, cancel transcribing, retry, dismiss error, and the mic-permission subscription.
   - Keep the per-recording transcription run identifier so a stale transcription result is ignored when a newer recording or cancel happens.
   - Keep the one-second elapsed-time counter and ensure it is cleared on stop, cancel, and teardown.
   - Keep the page-registered transcript destination handler so the active screen receives the finished text.
   - Keep the gating rules unchanged: do not start recording when the microphone is denied or the device is offline.

2. **Reuse the transcription delivery as-is**
   - On a finished recording, hand the captured audio to the shared transcription request (owned by plan 04) and route the resulting text to the registered handler.
   - Move the store into the transcribing state on stop and back to idle on success, or into the error state on failure, only when the result still belongs to the current recording run.

3. **Rewrite the audio recorder over native recording**
   - Replace the browser media-recorder with the Expo audio recording API, exposing the same recorder operations the store already calls: start, stop, cancel, and release.
   - On start, configure audio mode for recording and produce a recording in a mobile-friendly container (`.m4a` on Android, `.caf`/`.m4a` on iOS).
   - On stop, finish the recording and return a reference to the recorded audio file (its on-device location) instead of an in-memory blob, so it can be uploaded as multipart form data.
   - Surface the same outcomes the store expects: report permission granted vs. denied, report a generic capture failure, and deliver the finished audio on stop.
   - Guard against empty or extremely short clips that the transcription provider rejects.
   - Ensure recording resources are fully released on stop, cancel, and teardown so the microphone is not held open.

4. **Rewrite microphone permission over native permission APIs**
   - Replace the browser permission query with the Expo audio permission APIs to read the current microphone permission and to request it.
   - Map the native permission outcome to the same three states the store uses (granted, denied, prompt).
   - Provide the subscription the store expects, delivering the current permission and any later change, with a no-op unsubscribe when not applicable.

5. **Port the recording-gate and permission hooks**
   - Port the can-record hook so the UI is blocked from recording when the microphone is denied or the device is offline (offline state comes from the connectivity store, plan 07).
   - Port the microphone-permission hook to read and expose the current native permission state for screens that need it.
