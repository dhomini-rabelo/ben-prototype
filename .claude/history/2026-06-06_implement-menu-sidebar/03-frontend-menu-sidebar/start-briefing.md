# Plan 2 [Frontend] (parallel): Implement the menu sidebar, lists, item-detail & settings in project-web

**Plan line:** Plan 2 · Frontend · parallel
**Why it runs in parallel:** Depends only on the API contract from Plan 1. It touches **only** `project-web/` files, which the backend plan never touches — so it runs concurrently with Plan 2 Backend with zero file overlap. It builds against the documented contract, not against the backend's implementation files.

## Goal

Build the "Menu sidebar" + "Item detail modal" feature in `project-web`, replicating the design from `project-design`. This is the largest pending block in `RELATORIO-STATUS-COMPONENTES-E-TELAS.md` (22 of the pending screen states + 4 components).

Deliver:
- **Menu sidebar** (left drawer overlay) opened from the chat top bar (and workspace), with entries Tasks / Notes / Reminders / Settings and derived count badges.
- **List screens**: Tasks, Notes, Reminders — each with empty / loading / error / populated (and edge) states, grouped sections where the design shows them (Active/Finished tasks, Upcoming/Fired reminders).
- **Item detail modal** (bottom sheet) for note & reminder, with loading / error / "gone" states.
- **Settings sheet** (bottom sheet) with profile + sign-out (idle/pending/failed).
- **API client layer**: request functions + models + route entries + wrapper hooks for notes & reminders (tasks list already wired).
- **Routing/navigation** as needed.

## Design source (project-design — replicate faithfully)

Components: `src/layout/components/menu-sidebar.tsx`, `menu-list-row.tsx`, `item-detail-sheet.tsx`, `settings-sheet.tsx`.
Screen states: `src/pages/app/menu-sidebar-*.tsx`, `menu-tasks-*.tsx`, `menu-notes-*.tsx`, `menu-reminders-*.tsx`, `menu-settings-*.tsx`, `item-detail-*.tsx`.
Shells: `_menu-shell.tsx`, `_menu-list-shell.tsx`, `_settings-shell.tsx`, `_detail-shell.tsx`.
Component previews: `src/pages/components/{menu-sidebar,menu-list-row,item-detail-sheet,settings-sheet}.tsx`.

## Existing project-web patterns to reuse (do not reinvent)

- API: `src/api/client.ts` (`authClient`), `src/api/routes.ts` (`API_ROUTES`), `src/api/types.ts` (`ListingResponse<T>`, `ItemResponse<T>`), `src/api/models/`, `src/api/requests/tasks.ts`.
- Hooks: `src/layout/hooks/use-api-request.ts`, `use-api-cursor-paginated.ts`, and wrapper hooks under `src/layout/hooks/api/` (e.g. `useTaskListData`).
- Routing: `src/core/routes.ts` (`ROUTES`), `src/core/router.tsx`, `src/core/auth.tsx` (`<Auth>` guard), `useNavigate`.
- UI primitives: `src/layout/components/ui/{button,icon-button,typography}.tsx`, `brand-mark.tsx`, `chat-banner/` (compound), `cn()` util.
- **Overlay/sheet reference**: `src/pages/chat/components/task-picker/` (backdrop `z-40` + sheet `z-50`, open/close via `useState`, `TaskPickerList` row pattern). The menu sidebar is the **left-drawer** analogue of this bottom-sheet pattern.

## Contract consumed (from Plan 1)

- `GET /notes/list` → `{ items: NoteListItem[] }`; `NoteListItem = { id, title, body, capturedAt }`
- `GET /notes/:id/detail` → `{ item: Note }`
- `GET /reminders/list` → `{ items: ReminderListItem[] }`; `ReminderListItem = { id, title, firesAt: string|null, body: string|null, status: "upcoming"|"fired", capturedAt }`
- `GET /reminders/:id/detail` → `{ item: Reminder }`
- Tasks: reuse existing `useTaskListData`.
- Sidebar counts are derived client-side from the three lists (tasks = active count, notes = length, reminders = length).

## Files this plan owns (project-web only)

- `src/api/routes.ts` (add `notes`, `reminders` entries), `src/api/models/{note,reminder}.ts`, `src/api/requests/{notes,reminders}.ts`.
- `src/layout/hooks/api/` wrapper hooks for notes & reminders lists/detail.
- A new feature area for the menu (e.g. `src/pages/menu/` or shared `src/layout/components/menu/`) — choose the placement most consistent with the codebase; reuse the design component names (`menu-sidebar`, `menu-list-row`, `item-detail-sheet`, `settings-sheet`).
- Sidebar trigger wiring in the chat top bar (and workspace top bar) — touch only those trigger points; do not collide with backend.
- `src/core/routes.ts` / `src/core/router.tsx` if new routed screens are added (decide between routed pages vs in-place overlays — the design uses overlays/shells, so prefer overlay state where it matches).

## Notes

- Match the codebase's component decomposition and naming conventions (kebab-case files; compound components where the design shows them).
- Do NOT run `npm run lint:fix` — formatting is handled once after all parallel plans finish.
- Verify with `cd project-web && npx tsc --noEmit`.
