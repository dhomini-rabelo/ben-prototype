# Plan — Wire transcribing feedback into the Workspace banner

1. **Bring voice-capture state into the workspace banner**
   - Make the banner aware of the global voice-capture status (idle / recording / transcribing / error)
   - Make the voice retry action available to the banner so a failed transcription can restart capture

2. **Show the "Hearing you" indicator while transcribing**
   - When the user's audio is being transcribed, display the pending voice banner
   - Give this voice feedback the highest priority so it wins over Ben-side states, matching the Chat screen

3. **Handle a failed transcription with a voice retry**
   - When transcription fails, show an error banner that invites the user to retry
   - Wire that retry to restart voice capture rather than re-sending the text draft

4. **Preserve the existing Ben-side banner behavior**
   - Keep the current pending-change, awaiting-reply, send-error, and last-reply states intact
   - Ensure these states only take over once voice capture is no longer in progress
