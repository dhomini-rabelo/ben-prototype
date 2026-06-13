# Plan — Menu shell for project-mobile (presentational only)

Port the menu container (sidebar/overlay/sheet) and the generic list-state shell from `project-web` to React Native (Expo) as purely presentational pieces. This unit owns only the menu container and the list-state shell; it consumes the UI primitives (plan 05) and the menu store (plan 07), and does not wire up modal routing (that is plan 28).

1. **Reframe the overlay as a native surface**
   - Replace the full-screen, fixed-position web overlay with a native modal/sheet presentation appropriate for mobile, while keeping the same logical layers (a primary menu surface, a bottom detail surface, and a bottom settings surface).
   - Preserve the close-on-backdrop and reset-on-dismiss behavior of the existing overlay.
   - Keep this piece presentational: it shows whichever surface the menu state asks for and exposes a close action, but it does not decide navigation or routing.

2. **Port the menu sidebar**
   - Show the brand mark plus the four entries (tasks, notes, reminders, settings) with their icons and labels.
   - Support the three display variants (default, loading, error) that drive how counts are shown.
   - Emit a selection event when an entry is tapped, leaving the decision of what that does to the consumer.
   - Read selection/state from the menu store directly rather than receiving it through prop-drilling.

3. **Port the count badge**
   - Render a count as a number, a skeleton placeholder, a dash, or nothing, matching the existing value semantics.
   - Apply the tasks-specific count formatting (e.g. "N active") and hide the badge for entries that have no count.
   - Use the animated skeleton equivalent for the loading state since CSS keyframes do not exist on mobile.

4. **Port the bottom sheet wrapper**
   - Provide a reusable bottom-anchored container with the grab handle, rounded top corners, and elevation styling.
   - Keep it content-agnostic so detail and settings surfaces can be slotted in by later plans.

5. **Port the generic list-state shell**
   - Provide the shell with a back affordance, a title, and a scrollable content area for the list states.
   - Provide the loading state as a set of skeleton rows.
   - Provide the empty state with a title and description.
   - Provide the error state with a message and a retry action.
   - Emit a back event from the shell and a retry event from the error state, without owning any data fetching.

6. **Port the list row**
   - Render a row with a leading kind icon (task-text, task-list, note, reminder), a title, and the optional supporting, trailing, and body-preview lines.
   - Support the muted and emphasized-trailing display variants and truncation of long text.
   - Emit a tap event, leaving selection handling to the consumer.

7. **Adapt platform-specific concerns**
   - Translate web-only constructs (hover states, backdrop blur, fixed positioning, scroll containers) to their mobile equivalents.
   - Use the mobile icon set and the ported UI primitives (typography, buttons) in place of the web ones.
   - Ensure the surfaces respect safe areas at the top and bottom of the screen.
