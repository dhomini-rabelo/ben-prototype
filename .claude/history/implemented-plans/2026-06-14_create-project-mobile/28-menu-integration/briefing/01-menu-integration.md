# Plan 28 — Menu integration (modal route + triggers + navigation)

1. **Present the menu as a native modal route**
   - Expose the menu as a dedicated route that opens with the platform's native modal presentation (slide-up sheet), instead of the web's state-driven overlay layered over the chat page.
   - Reuse the existing menu store so the modal still tracks which view is active (main menu, tasks, notes, reminders) and the back-to-menu behavior.
   - Ensure dismissing the modal (swipe-down or back gesture) clears the menu's transient state, matching the web's reset-on-close behavior.

2. **Wire the chat top-bar menu trigger**
   - Connect the chat top-bar menu button so tapping it opens the menu modal route.
   - Replace the previous open-via-local-state contract with navigation to the modal route, keeping the same single "open menu" entry point.

3. **Route list-row taps to entity detail**
   - From the tasks view, tapping a task row navigates to the task workspace screen for that task and closes the menu.
   - From the notes view, tapping a note row opens the note detail as its own native modal (presented over the menu).
   - From the reminders view, tapping a reminder row opens the reminder detail as its own native modal.
   - Preserve the back/close behavior so dismissing a detail returns the user to the list they came from.

4. **Wire the settings sheet**
   - Selecting the settings entry from the main menu presents the settings view as a native bottom sheet/modal.
   - Closing the settings sheet returns the user to the menu without losing menu position.

5. **Coordinate ownership edits**
   - Adjust the chat top-bar trigger contract (owned by the chat-top-bar plan) to drive navigation rather than a local open callback.
   - Register the modal presentation options in the protected navigator layout (owned by the protected-layout plan) if the route group requires it, coordinating that edit rather than duplicating layout config.

6. **Verify the integrated flow**
   - Confirm the type check passes.
   - Manually confirm: opening the menu, switching between tasks/notes/reminders views, navigating to a task workspace, opening note and reminder detail modals, and opening/closing settings all work end to end.
