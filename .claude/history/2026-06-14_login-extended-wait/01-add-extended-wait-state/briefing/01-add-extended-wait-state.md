# Plan 1 [Frontend] (sync) — Add extended-wait state to the Login flow

**Plan**

1. **Track how long the sign-in has been pending**
   - Start a short countdown the moment the Google sign-in enters its pending/loading state
   - Flip an "extended wait" signal on once that countdown elapses
   - Make sure the signal stays off during the initial moments of loading so it only appears after a noticeable delay

2. **Reset the extended-wait signal around the loading lifecycle**
   - Clear the signal and restart the countdown whenever a new sign-in attempt begins
   - Turn the signal off as soon as loading ends, regardless of how it ends (success, error, or cancel)
   - Ensure no leftover timer keeps the signal alive after the user leaves the loading state

3. **Reveal the reassurance line in the login UI**
   - Show the "still waiting on Google…" line below the sign-in button only while the extended-wait signal is active
   - Match the design's placement, secondary text styling, and fade-in entrance
   - Keep the line additive — it appears alongside the existing loading button, not as a replacement screen

4. **Preserve all other login paths**
   - Leave the happy path (successful sign-in and navigation) unchanged
   - Leave the error message path unchanged
   - Leave the permission-denied message path unchanged
   - Confirm the reassurance line never appears outside the pending state
