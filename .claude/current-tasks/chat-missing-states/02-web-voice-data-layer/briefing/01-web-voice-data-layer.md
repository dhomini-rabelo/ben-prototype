# Plan: Voice & connectivity data layer

1. **Capture microphone audio in the browser**
   - Request microphone access and surface the permission outcome (granted, denied, or still pending)
   - Begin recording on demand and accumulate the captured audio into a single playable clip
   - Stop recording on demand and expose the finished clip for later use
   - Provide a way to cancel an in-progress recording so no clip is produced and any active capture is released

2. **Track recording state and timing**
   - Expose whether a recording is currently active
   - Track and expose the elapsed recording time while capturing
   - Reset state cleanly between recordings so each new session starts fresh

3. **Detect network connectivity**
   - Determine whether the device is currently offline
   - React to connectivity changes as they happen so the offline status stays current
   - Make the offline status available for other logic to consume

4. **Define the transcription request contract**
   - Establish the address used to reach the backend transcription endpoint
   - Define the expected shape of the transcription response (the returned text)

5. **Send recorded audio for transcription**
   - Accept a finished audio clip and submit it to the backend transcription endpoint as an uploaded audio file
   - Send the request through the authenticated client so it carries the user's credentials
   - Return the transcribed text from the response to the caller
   - Allow failures to propagate so consumers can handle errors and rejected uploads
