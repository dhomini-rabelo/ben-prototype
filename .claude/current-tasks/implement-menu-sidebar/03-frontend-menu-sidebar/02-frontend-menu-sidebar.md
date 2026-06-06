# Plan 2 [Frontend] — Menu sidebar (deep plan)

## Context

`project-web` is the real web implementation of Ben. The menu sidebar (Tasks/Notes/Reminders/Settings),
the per-section list views, the item-detail bottom sheet, and the settings sheet are designed in
`project-design` but not yet implemented in `project-web`. We build them here against the documented
API contract (Plan 1 owns the backend; zero file overlap).

Existing pieces we reuse:
- API: `authClient` (`src/api/client.ts`), `API_ROUTES` (`src/api/routes.ts`), `ItemResponse<T>` /
  `ListingResponse<T>` (`src/api/types.ts`), `requests/tasks.ts` shape, `responses/task.ts` `TaskListItem`.
- Hooks: `useAPIRequest` (`src/layout/hooks/use-api-request.ts`) returns `{ actions:{refetch,invalidate}, state:{data,isLoading,isError,error} }`. Wrapper hooks `useTaskListData` / `useTaskDetailData` under `src/layout/hooks/api/`.
- Overlay reference: `src/pages/chat/components/task-picker/active-task-picker.tsx` — backdrop `z-40` + sheet `z-50`, open/close via `useState`, `onClick` backdrop to close.
- UI: `Typography`, `IconButton`, `BrandMark`, `ChatBanner` compound, `cn` from `@/layout/utils/styles`.
- Stores: zustand stores live in `src/layout/stores/` (e.g. `connectivity-store.ts`, `voice-store/`).
- Triggers: `chat-top-bar.tsx` and `workspace-top-bar.tsx` both render a "Menu" affordance.
- Login: `use-google-auth.ts` stores `JWT_COOKIE` + `PROVIDER_COOKIE` but the `user` is currently dropped.

## Decisions

1. **No new routes — overlay state.** The design renders the sidebar/list/detail/settings as
   overlay shells over the chat, and the codebase's only analogous feature (`task-picker`) is an
   in-place `useState` overlay, not a route. So the whole menu is a single self-contained overlay
   component (`MenuOverlay`) with internal view state (`menu | tasks | notes | reminders | settings`
   plus an active item-detail target). This matches the design faithfully and avoids router churn.
   The router (`src/core/router.tsx`, `src/core/routes.ts`) is left untouched.

2. **Placement = `src/layout/components/menu/`.** The trigger lives in both the chat and workspace
   top bars, so the feature is cross-page shared layout, not page-scoped. We port the four design
   components by their design names (`menu-sidebar`, `menu-list-row`, `item-detail-sheet`,
   `settings-sheet`) and add the orchestrator + per-section list views + small view helpers there.

3. **Counts derived client-side.** `MenuOverlay` calls the three list hooks; badges = tasks active
   count, notes length, reminders length. Loading → `"skeleton"`, error → `"dash"` (matches the
   `MenuSidebar` `CountValue` API).

4. **Settings profile from stored auth user.** Persist the login `user` so Settings can read it.
   Add `src/layout/stores/auth-store.ts` (zustand) holding the `User`, hydrated from a cookie, and
   persist it in `use-google-auth.ts` on login. Sign-out clears tokens + user + cookie and routes to
   login. Error fallback shows just the email (none stored → `variant="error"`).

5. **Relative/absolute time formatting** mirrors `task-picker-list.tsx`'s local `relativeTime`. Add a
   small `src/layout/utils/format-time.ts` with `relativeTime`, `absoluteDateTime`, `firesAtRelative`
   helpers (pure, module-level), reused by list rows and the detail sheet.

## Files to Create

### `src/api/models/note.ts`
```ts
export interface Note {
  id: string;
  title: string;
  body: string;
  capturedAt: string;
}

export type NoteListItem = Note;
```

### `src/api/models/reminder.ts`
```ts
export type ReminderStatus = "upcoming" | "fired";

export interface Reminder {
  id: string;
  title: string;
  firesAt: string | null;
  body: string | null;
  status: ReminderStatus;
  capturedAt: string;
}

export type ReminderListItem = Reminder;
```

### `src/api/routes.ts` (modify)
Add inside `API_ROUTES`:
```ts
  notes: {
    list: "/notes/list",
    detail: (id: string) => `/notes/${id}/detail`,
  },
  reminders: {
    list: "/reminders/list",
    detail: (id: string) => `/reminders/${id}/detail`,
  },
```

### `src/api/requests/notes.ts` (mirror tasks.ts)
```ts
import { authClient } from "@/api/client";
import type { Note, NoteListItem } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse, ListingResponse } from "@/api/types";

export async function requestListNotes(): Promise<NoteListItem[]> {
  const response = await authClient.get<ListingResponse<NoteListItem>>(
    API_ROUTES.notes.list,
  );
  return response.data.items;
}

export async function requestGetNoteDetail(noteId: string): Promise<Note> {
  const response = await authClient.get<ItemResponse<Note>>(
    API_ROUTES.notes.detail(noteId),
  );
  return response.data.item;
}
```

### `src/api/requests/reminders.ts` (analogous)

### `src/layout/hooks/api/use-note-list-data.ts`
```ts
import type { NoteListItem } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ListingResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useNoteListData() {
  return useAPIRequest<ListingResponse<NoteListItem>>({
    url: API_ROUTES.notes.list,
  });
}
```

### `src/layout/hooks/api/use-note-detail-data.ts`
```ts
export function useNoteDetailData(noteId: string) {
  return useAPIRequest<ItemResponse<Note>>({ url: API_ROUTES.notes.detail(noteId) });
}
```
(+ `use-reminder-list-data.ts`, `use-reminder-detail-data.ts` analogous.)

### `src/layout/stores/auth-store.ts`
zustand store holding `User | null`, hydrated from a `@ben/user` cookie; `setUser`, `clear`.

### `src/layout/utils/format-time.ts`
Pure helpers `relativeTime(iso)`, `absoluteDateTime(iso)`, `firesAtRelative(iso|null)`.

### `src/layout/components/menu/` (the feature)
- `menu-sidebar.tsx` — faithful port (adapt import to `@/layout/utils/styles`).
- `menu-list-row.tsx` — faithful port.
- `item-detail-sheet.tsx` — faithful port.
- `settings-sheet.tsx` — faithful port.
- `menu-tasks-view.tsx` / `menu-notes-view.tsx` / `menu-reminders-view.tsx` — list views consuming
  the wrapper hooks; loading/error/empty/populated; grouped Active/Finished and Upcoming/Fired.
- `menu-list-shell.tsx` — port of `_menu-list-shell` (title + back button) for overlay use.
- `note-detail.tsx` / `reminder-detail.tsx` — wire detail hooks into `ItemDetailSheet` (loading/error/
  gone via 404 detection on `error`).
- `settings-view.tsx` — wires auth store + sign-out state into `SettingsSheet`.
- `menu-overlay.tsx` — orchestrator: backdrop + drawer + active view + active detail target; owns
  `useState` for `view` and `detailTarget`; derives counts from the three list hooks; exposes
  `open`/`close`. Layered z-40 backdrop / z-50 panel like `task-picker`.
- `index.ts` — re-export `MenuOverlay`.

### Trigger wiring (modify)
- `src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`: add `onMenu` prop, wire `IconButton`.
- `src/pages/chat/page.tsx`: hold `isMenuOpen` state, render `<MenuOverlay>`, pass opener to top bar.
- `src/pages/task-workspace/components/workspace-top-bar/workspace-top-bar.tsx` + workspace `page.tsx`:
  same wiring (workspace top bar currently has no menu button; add the left/again — actually it has
  a back chevron; add menu open via a Menu icon if straightforward, else only chat). Decided: wire
  chat (primary) and add to workspace via the same MenuOverlay mount.
- `src/layout/hooks/use-google-auth.ts`: persist `user` to auth store + cookie on login.

## Existing Code to Reuse
- `useAPIRequest` return shape; `task-picker` overlay layering + close-on-backdrop.
- `MenuSidebar` `CountValue` ("skeleton"/"dash"/number) for badge states.
- `ChatBanner` compound for list error state; `Typography`, `IconButton`, `BrandMark`, `cn`.
- `relativeTime` logic from `task-picker-list.tsx` (generalized into `format-time.ts`).

## Verification
- `cd project-web && npx tsc --noEmit` → no new errors.
- Manual trace: counts populate from 3 hooks; selecting an entry pushes the list view; selecting a
  row opens the detail sheet; settings shows stored profile + sign-out states; backdrop/back close.
- Do NOT run `npm run lint:fix`.
