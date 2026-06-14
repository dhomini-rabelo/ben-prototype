# Plan 13 — Chat Task Picker + Suggested Action + Active Task Peek (React Native)

Port the active-task picker, the suggested-action widget, and the active-task peek from `project-web` to `project-mobile` (Expo / React Native).

**Owned scope (this unit only):**
- `task-picker/` — picker container, bottom-sheet shell, list, empty, error, skeleton states
- `suggested-action.tsx`
- `active-task-peek.tsx`

**Depends on:** chat backbone (plan 10), data hooks (plan 08, provides the active-task list data + actions), UI primitives (plan 05, provides typography, icons, style helper).

**Overlap to validate:** the suggested-action widget is consumed by the chat empty state, which lives in the chat shell area owned by plan 14. Confirm with plan 14 who owns and who imports it so it is built once and not duplicated.

---

## Plan

1. **Port the active-task peek trigger**
   - Render a compact, tappable strip that summarizes how many tasks are active and the most recent one's title.
   - Support its empty, loading-placeholder, and summary appearances.
   - Expose a tap interaction that opens the picker.
   - Keep press feedback and the upward affordance cue native to mobile.

2. **Port the suggested-action widget**
   - Render a tappable row with a leading icon, a label, and a trailing forward affordance.
   - Forward the tap to whatever action the consumer provides.
   - Confirm ownership with plan 14 before finalizing, since the chat empty state imports it.

3. **Rebuild the picker as a native bottom sheet**
   - Open from the peek trigger and dismiss by tapping the backdrop or pulling down.
   - Present a sheet header showing the "active tasks" label plus the count and ordering hint.
   - Ensure it overlays the chat surface and respects safe areas and gestures on device.

4. **Port the picker content states**
   - Show a loading placeholder while the active-task data is being fetched.
   - Show an error state with a retry action that re-requests the data.
   - Show an empty state guiding the user back to chat when nothing is active.
   - Show the scrollable list of active tasks otherwise.

5. **Port the active-task list rows**
   - Render each active task with a shape-based icon, its title, and a relative "last active" hint.
   - Make each row selectable, navigating into that task's workspace on tap.
   - Keep the list scrollable within the sheet and capped so it never overflows the screen.

6. **Wire the picker to data and navigation**
   - Drive open/closed state and feed it the active-task list and refetch action from the shared data hook.
   - Hide the whole widget while initially loading or when there are no active tasks.
   - Route a selected task to its workspace screen using the mobile navigation layer instead of the web router.
