# Plan — Task workspace content components (mobile)

Port the editable text content, the todo list, and the diff approval bar from the web workspace to React Native primitives. Reuse the existing task logic, store actions, and helper utilities; rebuild only the presentation and interaction layer. Build on the shared UI primitives and shared components, and ask nothing of the user.

**Plan**

1. **Rebuild the editable text content**
   - Show the task's current text, kept editable while seeded from the persisted server value
   - Re-sync the field when the active task or its saved content changes, so external updates are reflected
   - Let the user type freely and persist the change only when editing ends and the value actually differs
   - Honor read-only mode and reflect the finished state with a muted, struck-through appearance
   - When a pending text change exists, replace the editor with a read-only before/after preview instead of the input

2. **Rebuild the todo list and its rows**
   - Display todo items in their canonical order using the shared ordering helper
   - Render each row with a toggle control and its title, reflecting done and finished states visually
   - Allow toggling an item's done state unless the list is read-only
   - Provide an add-item entry that commits a trimmed, non-empty title and then clears itself
   - When a pending todo change exists, render the proposed items in a non-interactive diff view marking added and removed entries

3. **Rebuild the diff approval bar**
   - Stay hidden whenever the task has no pending change
   - Show a human-readable summary of the pending change using the shared summary helper
   - Offer approve and reject actions wired to the existing diff store
   - Disable both actions while a diff mutation is in progress

4. **Adapt web-only interactions to mobile**
   - Replace blur-based saving with the native field's equivalent end-of-edit and submit behaviors
   - Replace keyboard-driven commit with the mobile keyboard's submit action for adding todos
   - Swap web icons and styling utilities for their React Native equivalents while preserving the same visual tokens
   - Preserve the muted/struck-through, added, and removed styling cues used to distinguish states
