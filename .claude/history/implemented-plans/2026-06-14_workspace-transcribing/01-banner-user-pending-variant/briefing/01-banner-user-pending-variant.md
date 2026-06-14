# Plan 01 — Banner `user-pending` variant

1. **Extend the banner's supported states**
   - Add a new state representing the user being heard (transcription in progress) alongside the existing Ben-reply, Ben-typing, and error states
   - Keep all current states behaving exactly as they do today

2. **Show the correct identity badge for the new state**
   - Display a "You" badge when the banner is in the user-pending state
   - Keep showing the "Ben" badge for every other non-error state

3. **Render the transcription-in-progress feedback**
   - Show a short "Hearing you" label paired with three bouncing dots while the user is being transcribed
   - Match the wording and animated-dots feel already used on the Chat screen so both experiences feel identical
   - Do not attempt to show live transcript text, since none is available during transcription

4. **Apply the intended visual styling**
   - Present the user-pending content with muted, italic-style emphasis to signal a pending, secondary state
   - Reuse the existing banner container framing so it sits consistently next to the other states

5. **Preserve scope boundaries**
   - Limit the change to adding the new state and its appearance within the banner itself
   - Leave the surrounding screen and any consuming behavior untouched for a later step
