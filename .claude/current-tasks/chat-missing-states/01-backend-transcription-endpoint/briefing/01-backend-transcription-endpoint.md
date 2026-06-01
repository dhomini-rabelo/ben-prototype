# Plan: Backend transcription endpoint

1. **Validate the transcription provider credentials**
   - Require the AssemblyAI API key as part of the backend's validated environment configuration
   - Ensure the backend fails to start when the key is missing or invalid

2. **Define the transcription capability as a swappable abstraction**
   - Describe a provider contract that takes a recorded audio clip and returns its transcribed text
   - Keep the rest of the backend dependent on this abstraction rather than on the speech-to-text vendor

3. **Implement the AssemblyAI-backed provider**
   - Fulfill the transcription contract using AssemblyAI in pre-recorded (async) mode, waiting until the job reaches a terminal state before returning
   - Surface a clear failure when transcription does not complete successfully
   - Guard against empty or too-short recordings that the provider cannot process

4. **Add the transcription use case**
   - Accept an incoming audio clip and produce the transcribed text through the provider abstraction
   - Translate provider failures into meaningful errors for the caller

5. **Expose the authenticated endpoint**
   - Accept a recorded audio upload on the agreed route, restricted to authenticated users
   - Read the audio from the agreed multipart field and pass it to the use case
   - Return the transcribed text in the agreed response shape, and route failures through the standard error handling

6. **Register the endpoint in the application**
   - Wire the new route into the backend so it is reachable
   - Confirm the published contract (route, upload field, response shape) matches what the dependent frontend plans expect
