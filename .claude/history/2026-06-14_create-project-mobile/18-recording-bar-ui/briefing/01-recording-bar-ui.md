# Plan — RecordingBar UI (React Native)

1. **Drive the bar from voice state**
   - Read elapsed recording time, stop, and cancel actions from the voice store (plan 17)
   - Render the bar only while a recording is active, mirroring the web behavior
   - Format the elapsed time as minutes:seconds

2. **Rebuild the visual layout with mobile primitives**
   - Lay out the recording card alongside a circular stop button
   - Show the "Recording" label with a pulsing indicator dot and the live elapsed timer
   - Display the cancel hint ("slide up to cancel") with an upward arrow
   - Reuse the shared UI primitives (plan 05) for text and surfaces

3. **Animate the waveform and pulse with Reanimated**
   - Replace the CSS keyframe waveform with continuously animated bars, each staggered for a wave effect
   - Animate the recording-indicator dot with a repeating pulse
   - Ensure animations start when recording begins and stop/reset when it ends

4. **Add slide-up-to-cancel gesture**
   - Capture an upward pan gesture over the recording card using gesture-handler
   - Provide visual feedback as the user drags upward
   - Trigger the cancel action once the upward drag passes a threshold; otherwise snap back

5. **Wire up the action controls**
   - Trigger stop recording from the stop button
   - Trigger cancel recording from both the cancel hint and the completed slide-up gesture
   - Optionally fire haptic feedback on recording start and on cancel
