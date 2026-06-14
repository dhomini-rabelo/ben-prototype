# Plan 24 — Task workspace footer + done overlay (project-mobile)

Port the in-task chat footer and the "task done" overlay from `project-web` to React Native (Expo). This unit owns only `workspace-footer/` and `workspace-done-overlay/`. It depends on task logic (plan 20), the shared chat-input (plan 11), and UI primitives (plan 05). Voice recording is exposed through a prop and wired later at page assembly (plan 27).

---

**Plan**

1. **Port the task workspace footer**
   - Compose the shared chat-input (text field, attach affordance, and send action) so the user can type and send a message into the open task.
   - Send the typed message to the task through the task chat logic, clearing the field on send and restoring the text if sending fails.
   - Mirror the disabled/finished state: when the task is finished, block input and show the "reopen to keep editing" placeholder; otherwise show the normal "ask to edit" placeholder.

2. **Wire the in-task voice record affordance**
   - Provide a record button that starts voice capture, matching the chat footer's record pattern.
   - Expose a callback prop so the actual recording start is wired in by the page assembly step (plan 27) rather than inside this unit.
   - Swap the whole footer for the recording bar view while a recording is in progress, returning to the normal input afterward.

3. **Port the task done overlay**
   - Present a transient confirmation banner near the bottom of the task screen when a task becomes done.
   - Carry a check indicator and the confirmation message, styled as a floating pill that does not capture touches.

4. **Adapt to mobile platform behavior**
   - Keep the footer usable above the on-screen keyboard and within device safe areas.
   - Reuse the shared mobile UI primitives and the task/voice state already provided by the dependency units, keeping this unit free of native API calls.

5. **Verify the unit**
   - Confirm the footer and overlay render and behave correctly across the typing, sending, finished, and recording states.
   - Ensure the type check passes for the owned folders.
