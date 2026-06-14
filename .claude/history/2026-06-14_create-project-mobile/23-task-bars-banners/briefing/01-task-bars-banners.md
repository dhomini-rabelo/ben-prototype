# Plan 23 — Task workspace top bar + banners (mobile port)

Port the task-workspace top bar and the top/sub-thread banners from the web app to React Native (Expo). This unit owns only the workspace top bar, the workspace top banner, the workspace sub-thread banner, and the inner sub-thread banner presentation piece. It builds on the task lifecycle/chat logic, the mobile UI primitives, and the shared chat banner already ported by their respective units.

## Plan

1. **Rebuild the workspace top bar layout**
   - Render a horizontal bar with three regions: a back-navigation control on the left, the task identity in the center, and a lifecycle actions trigger on the right.
   - Show the task title with truncation and a small badge indicating the content type (todo list vs. plain note).
   - When the task is finished, surface a clear "finished" status marker next to the title.
   - Hide the entire bar when no task is currently loaded.

2. **Wire up navigation and lifecycle actions**
   - Make the back control return the user to the chat screen using the mobile navigation approach.
   - On the actions trigger, present a menu offering either "Finish task" or "Reopen task" depending on the current task status.
   - On finishing, complete the task and then navigate back to chat; on reopening, restore the task in place without leaving the screen.
   - Disable lifecycle actions while a status change is already in progress.

3. **Port the workspace top banner (environmental alerts)**
   - Show a banner only when one of these conditions holds: the device is offline, voice capture failed, or microphone access is denied; otherwise render nothing.
   - Reuse the shared chat banner presentation, choosing a warning or error tone to match each condition.
   - For the voice-failure case, offer a retry action and a dismiss action; for the offline and permission cases, show the appropriate guidance message.
   - Reword the microphone-denied guidance to reference device/OS settings rather than browser settings, matching the mobile platform.

4. **Port the sub-thread banner state selection**
   - Drive which sub-thread banner appears from the current task, voice, and chat state, preserving the same priority order used on web: suppress entirely while a task diff is pending, then transcribing, then voice error, then awaiting Ben's reply, then send error, then the latest Ben reply.
   - Pass the correct message text and retry behavior into each error case (re-running transcription or re-sending the current draft as appropriate).

5. **Port the sub-thread banner presentation**
   - Support the existing visual variants: Ben's reply, user-pending (transcribing), Ben typing, and error.
   - Show a speaker label ("You" vs. "Ben"), a single-line truncated message body, and an error retry affordance only in the error variant.
   - Recreate the animated typing/listening indicators using the mobile animation approach instead of CSS keyframes.
   - Apply error vs. neutral styling consistent with the rest of the mobile theme tokens.

## Verification

- TypeScript compilation passes with no errors.
