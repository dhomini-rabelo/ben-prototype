# Plan: Wire the voice and connectivity states into the chat page

1. **Centralize the voice and connectivity state in the chat flow**
   - Track the current chat voice mode across idle, recording, transcribing, permission-denied, offline, and error states
   - Connect the microphone capture, timing, and connectivity signals so the page always reflects the live status
   - Ensure each state cleanly transitions to the next and resets after completion or cancellation

2. **Drive the recording experience**
   - Start capturing audio when the user activates the voice control and enter the recording state
   - Show the recording footer with the running timer, animated waveform, and slide-to-cancel hint while active
   - Allow the user to cancel an in-progress recording so no clip is produced and capture is released
   - Stop capturing on demand and hand the finished clip to the transcription step

3. **Handle transcription and message sending**
   - Upload the recorded clip for transcription and show the "Hearing you" footer while it is in progress
   - On success, deliver the transcribed text into the existing chat send flow as the user's message
   - Allow the user to cancel transcription before it completes
   - On failure, move into the error state instead of sending a message

4. **Surface permission, offline, and error states**
   - When microphone permission is denied, show the warn banner and keep the text input fully usable
   - When the device is offline, show the offline banner and reflect that sending is queued or disabled
   - When microphone capture or transcription fails, show the error banner with a retry affordance that restarts the flow

5. **Integrate the voice control into the chat input**
   - Expose the voice control in the chat input and switch it into recording mode while capturing
   - Keep text composing and sending available except where a state explicitly restricts it
   - Ensure the banners, recording footer, and message footers render in the correct place for each state without disrupting the existing chat layout
