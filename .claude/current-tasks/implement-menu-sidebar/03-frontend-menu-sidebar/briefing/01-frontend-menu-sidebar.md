# Plan 2 [Frontend] — Menu sidebar (simple plan)

Build the menu sidebar feature in `project-web`, replicating the `project-design` screens. Touch only `project-web/`.

## What we build

1. **API layer** (mirror `requests/tasks.ts`)
   - `src/api/routes.ts`: add `notes` + `reminders` entries.
   - `src/api/models/{note,reminder}.ts`: `Note`, `NoteListItem`, `Reminder`, `ReminderListItem`.
   - `src/api/requests/{notes,reminders}.ts`: list + detail request functions.

2. **Wrapper hooks** (mirror `useTaskListData` / `useTaskDetailData`)
   - `src/layout/hooks/api/use-note-list-data.ts`, `use-note-detail-data.ts`.
   - `src/layout/hooks/api/use-reminder-list-data.ts`, `use-reminder-detail-data.ts`.

3. **Auth user persistence** (Settings needs the profile)
   - Store the `user` from login in a zustand store + cookie so Settings can read it. Sign-out clears tokens + user and redirects to login.

4. **Menu feature** under `src/layout/components/menu/` (shared, used by chat + workspace)
   - `menu-sidebar.tsx` + `menu-list-row.tsx` + `item-detail-sheet.tsx` + `settings-sheet.tsx` (faithful ports of design components).
   - `menu-overlay.tsx`: orchestrates the drawer + list/detail/settings views as **in-place overlay state** (no routes), following the `task-picker` overlay pattern.
   - List views (tasks/notes/reminders) with loading/error/empty/populated + grouped sections (Active/Finished, Upcoming/Fired), driven by the wrapper hooks.
   - Item-detail sheet (note/reminder) with loading/error/gone; settings sheet with profile + sign-out idle/pending/failed.
   - Counts derived client-side: tasks=active count, notes=length, reminders=length.

5. **Trigger wiring**
   - Replace the dead "Menu" `IconButton` in `chat-top-bar.tsx` and `workspace-top-bar.tsx` with a real open handler that mounts `MenuOverlay`.

## Routing decision

No new routes. The design uses overlay shells and the codebase's `task-picker` is an in-place `useState` overlay — so the whole menu is overlay state, consistent with both.

## Verify

`cd project-web && npx tsc --noEmit`. Do NOT run lint:fix.
