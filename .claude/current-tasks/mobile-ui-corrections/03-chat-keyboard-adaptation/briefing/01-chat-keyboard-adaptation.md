# Plan 01 — Make the chat screen adapt to the on-screen keyboard

**Plan**

1. **Track the keyboard's current height**
   - Listen for the keyboard opening and closing and capture how tall it is at any moment
   - Reset the tracked height back to zero whenever the keyboard is dismissed
   - Make the tracking behave consistently on both iOS and Android, accounting for Android's edge-to-edge display mode where the legacy "resize" behavior is unreliable

2. **Lift the input bar above the keyboard**
   - When the keyboard is open, raise the input footer so it sits directly above the keyboard instead of being hidden behind it
   - When the keyboard is closed, the input footer returns to resting at the bottom edge
   - Keep the input footer's own height measurement intact so other layout calculations stay correct

3. **Keep the message history visible above the lifted input**
   - Add the keyboard height to the spacing reserved at the bottom of the message list and the empty state so the most recent messages and the empty-state content are never covered by the input bar or the keyboard
   - Preserve the existing reserved spacing that accounts for the input footer and its gap, and the reserved spacing that accounts for the header
   - Ensure the history remains scrollable while the keyboard is open

4. **Replace the ineffective avoidance behavior**
   - Remove the current keyboard-avoidance wrapper whose Android configuration fails to move the absolutely-positioned footer, replacing it with the height-driven offset approach above
   - Use only capabilities already present in the project (no new native keyboard dependency)

5. **Preserve existing chat behaviors**
   - Keep the automatic scroll-to-latest behavior working when messages arrive or the reply state changes
   - Keep tapping a message or list item working while the keyboard is open (taps should not be swallowed by keyboard dismissal)
   - Confirm the loading skeleton, empty state, and populated history all adapt correctly when the keyboard opens
