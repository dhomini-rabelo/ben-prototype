# Plan 05 — Add a dimmed, unclickable backdrop behind the settings sheet

**Plan 1 [Frontend] (parallel)**: When the settings quick-navigation bottom sheet opens, dim the rest of the menu screen with a backdrop and make it unclickable (and dismissible by tapping the backdrop).

- Runs in parallel with all other plans. It owns `project-mobile/src/pages/menu/page.tsx` and the settings-sheet components under `project-mobile/src/layout/components/menu-settings/`. The menu-header plan (Plan 04) owns only `menu-sidebar.tsx` (under `src/layout/components/menu/`), a different file, so there is no conflict.

## Goal

Image 5 shows the settings sheet (user profile + Sign out) sliding up over the menu, but the rest of the screen behind it stays bright and clickable. It should be covered by a dimmed, unclickable scrim while the sheet is open, and tapping the scrim should close the sheet.

Currently the sheet is rendered in `menu/page.tsx` as a plain `<View className="absolute inset-x-0 bottom-0"><SettingsView .../></View>` with no backdrop. Reuse the established modal-with-backdrop pattern from `task-picker-sheet.tsx` (React Native `Modal` with `transparent`, an animated `Animated.View` scrim using `bg-inverse-surface/30`, a `Pressable` over the scrim wired to `onClose`, and the sheet sliding up). Implement it so the settings sheet gets this backdrop behavior. Keep the existing `SettingsView`/`SettingsSheet` content and the `closeSettings` store action working.

Scope: focus on the **settings** sheet as requested. The note/reminder detail sheet in `menu/page.tsx` uses the same backdrop-less pattern; since this plan owns `page.tsx`, applying the same backdrop to it for consistency is acceptable but secondary — the settings sheet is the required deliverable.

## Files owned

- `project-mobile/src/pages/menu/page.tsx`
- `project-mobile/src/layout/components/menu-settings/` (`settings-view.tsx`, `settings-sheet.tsx`, and any new backdrop/modal wrapper it adds here)

## Reference (read-only, not owned)

- `project-mobile/src/pages/chat/components/task-picker/task-picker-sheet.tsx` — the gold-standard Modal + animated backdrop pattern to reuse.
- `project-mobile/src/layout/components/menu/menu-sheet.tsx` — the existing bottom-sheet base (safe-area + rounded styling).
- `project-mobile/src/layout/stores/menu-store.ts` — `isSettingsOpen` / `closeSettings`.
