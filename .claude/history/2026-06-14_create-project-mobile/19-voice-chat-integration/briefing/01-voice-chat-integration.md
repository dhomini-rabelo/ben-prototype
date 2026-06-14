# Plan 19 — Voice chat integration (sync)

Wire the already-built voice flow into the existing mobile chat footer and chat page. This unit runs alone after the chat footer and chat page exist, and after the voice store and recording bar are ready. It only edits those existing chat surfaces.

## Plan

1. **Make the footer record button start recording**
   - When the chat input has no typed text, its action control behaves as a voice trigger that begins capturing audio
   - Recording can only begin when capturing is currently allowed (microphone not denied and the device is online); otherwise the trigger stays inactive
   - When text is present the control keeps its send behavior unchanged

2. **Show the recording overlay during capture and transcription**
   - While audio is being recorded, the chat footer presents the recording overlay in place of the normal text input
   - The overlay remains visible through the transcription phase and any transcription error, so the user always sees the active voice state
   - When voice returns to idle, the footer reverts to the normal text input

3. **Send a finished transcription as a chat message**
   - When the chat page is active, it registers itself as the destination for completed transcriptions
   - A successful transcription is delivered into the chat as a sent text message, following the same path as a typed message
   - Registration only applies while recording is permitted, and is set up when the chat screen becomes active

4. **Confirm the end-to-end voice flow**
   - Starting a recording, stopping it, and waiting for transcription results in a message appearing in the conversation
   - The footer's visual state transitions correctly across idle, recording, transcribing, and error
