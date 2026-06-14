# Plan 25 — Menu feature lists (tasks, notes, reminders)

**Plan**

1. **Port the tasks list view**
   - Fetch tasks through the tasks data hook and read the resulting items
   - Render the loading, error (with retry), and empty states inside the menu-list shell, keeping the "Tasks" title and back-to-menu behavior
   - Split tasks into active and finished groups, each under its own section label
   - Show each row with its title and a supporting line combining its status and relative activity time, muting finished rows
   - Differentiate the row treatment between checklist-style and text-style tasks

2. **Port the notes list view**
   - Fetch notes through the notes data hook and read the resulting items
   - Render the loading, error (with retry), and empty states inside the menu-list shell, keeping the "Notes" title and back-to-menu behavior
   - Show each note with its title, a body preview, and a trailing relative capture time
   - Make selecting a note open its detail view

3. **Port the reminders list view**
   - Fetch reminders through the reminders data hook and read the resulting items
   - Render the loading, error (with retry), and empty states inside the menu-list shell, keeping the "Reminders" title and back-to-menu behavior
   - Split reminders into upcoming and fired groups, each under its own section label
   - Show each reminder with its title, a trailing relative fire time, and a supporting line for capture or fired status, emphasizing the upcoming fire time and muting fired rows
   - Make selecting a reminder open its detail view

4. **Reuse shared dependencies**
   - Drive all three views from the menu-list shell building blocks and the entity data hooks
   - Use the relative-time and fires-at-relative helpers for all displayed timestamps
   - Keep platform behavior aligned with React Native primitives instead of web elements

5. **Verify the unit**
   - Confirm the TypeScript compiler passes with no errors
