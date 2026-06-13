# Plan 28 — Menu integration (modal route + triggers + navigation)

**Plan 16 [Frontend] (sync)**: Wire the menu into the app as a native modal and connect its triggers.

- Runs **alone** after the chat page (16), task page (27), and all menu component plans (21/25/26). It edits files owned by earlier plans (chat top bar trigger) and adds the menu route, so it must run sequentially and alone.

## Goal

Present the menu as a native expo-router modal (analysis point 5 — improves mobile UX), wire the chat top-bar menu trigger to open it, route list-row taps to entity detail (note/reminder as modal, task → `/tasks/[taskId]`), and wire the settings sheet.

## Scope / owned files

- `project-mobile/app/(protected)/menu.tsx` (+ optional `app/(protected)/(modals)/` group) — menu modal screen rendering the menu sidebar/views; `presentation: "modal"` in the route's options.
- Edit `src/pages/chat/components/chat-top-bar/` (plan 14) — wire `onOpenMenu` → `router.push("/menu")` (or the menu store + navigation).
- Wire menu navigation: list-row tap → `useMenuStore.openDetail` / navigate; task row → `router.push(ROUTES.taskWorkspace(id))`.
- Register the modal presentation options in `app/(protected)/_layout.tsx` (owned by plan 09) if needed — coordinate edit.

## Verification

`npx tsc --noEmit` passes; opening the menu, browsing lists, opening detail, and settings all work.
