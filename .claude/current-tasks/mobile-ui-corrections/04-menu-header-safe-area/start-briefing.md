# Plan 04 — Add safe-area top spacing to the menu sidebar header

**Plan 1 [Frontend] (parallel)**: Add safe-area top spacing to the menu sidebar header so the Ben logo and the close (X) button sit below the status bar, matching the chat and notes screens.

- Runs in parallel with all other plans. It owns only `project-mobile/src/layout/components/menu/menu-sidebar.tsx`. The settings-backdrop plan (Plan 05) owns `src/pages/menu/page.tsx` and the `menu-settings` components — a different set of files — so there is no conflict.

## Goal

Image 2 shows the menu sidebar header (Ben brand mark + close X) rendered too high, overlapping the status bar. In images 1 (chat) and 3 (notes) the header sits correctly below the status bar. Root cause: `menu-sidebar.tsx`'s root `View` has no top safe-area inset, while the chat screen relies on a page-level `SafeAreaView edges={['top','bottom']}` and the notes list (`menu-list-shell.tsx`) applies `paddingTop: insets.top` via `useSafeAreaInsets()`.

Fix the menu sidebar to add the top safe-area inset to its root container, following the exact pattern used by `menu-list-shell.tsx` (`useSafeAreaInsets()` + `style={{ paddingTop: insets.top }}`), so the header aligns consistently with the other screens. Do not change the menu page wrapper or the list views (they already handle their own insets).

## Files owned

- `project-mobile/src/layout/components/menu/menu-sidebar.tsx`

## Reference (read-only, not owned)

- `project-mobile/src/layout/components/menu-list/menu-list-shell.tsx` — the correct `useSafeAreaInsets` + `paddingTop: insets.top` pattern to follow.
- `project-mobile/src/pages/chat/page.tsx` — chat header spacing for visual reference.
