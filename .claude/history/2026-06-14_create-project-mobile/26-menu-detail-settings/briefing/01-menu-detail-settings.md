# Plan 26 — Menu detail (note/reminder) + settings (React Native)

Port the menu item-detail views and the settings sheet from `project-web` to `project-mobile`, owning only `menu-detail/` and `menu-settings/`. Everything stays presentational; the modal routing that mounts these is wired by plan 28.

## Plan

1. **Port the detail shell and its per-state pieces**
   - Recreate the shared detail container that frames any captured item with a kind label (note or reminder), the matching icon, and a close affordance.
   - Recreate the three transient states — a skeleton-style loading placeholder, an error state that offers a retry action, and a "gone" state for items cleared elsewhere.
   - Keep each state and the container as separate presentational pieces so the detail bodies can compose them.
   - Replace web shell concepts (sheet styling, close button) with native equivalents while keeping the same visual structure; assume the sheet/overlay comes from the menu shell (plan 21).

2. **Port the shared detail content and meta sections**
   - Recreate the content layout that renders an optional title, an optional body, the reminder timing block, and the captured-time block in the same order as the web.
   - Recreate the captured meta section showing absolute and relative capture times under a labeled divider.
   - Recreate the reminder meta section showing the relative fire time, an upcoming/fired status indicator, and the absolute fire time, with the visual distinction between upcoming and fired states.
   - Source all formatted date/time strings from the shared time-formatting utility (plan 03).

3. **Port the note and reminder detail bodies**
   - Recreate the note detail that loads a single note by id, drives the loading/error/gone/loaded states, and feeds title, body, and captured times into the shared content.
   - Recreate the reminder detail that loads a single reminder by id, drives the same states, and feeds title, body, status, fire times, and captured times into the shared content.
   - Reuse the existing detail data hooks (plan 08) and the not-found / empty detection logic so behavior matches the web.
   - Keep the close handler as a passed-in callback so modal routing (plan 28) controls dismissal.

4. **Port the settings sheet and settings view**
   - Recreate the presentational settings sheet with populated, loading, and error variants, showing the user avatar (or a fallback), name, email, and a sign-out control plus a sign-out failure/retry affordance.
   - Recreate the settings view that reads the current user from the auth store, manages the sign-out interaction state (idle/pending/failed), and feeds the sheet its data and handlers.
   - Implement sign-out by clearing auth state via the auth store's clear action; defer any post-logout navigation to the platform routing owned by plan 28 (no web cookie or react-router usage).

5. **Adapt platform specifics and verify**
   - Swap web-only constructs (HTML elements, web icons, image tag, cookie removal, router navigation) for their native counterparts while preserving the same component boundaries and one-component-per-file structure.
   - Confirm types compile cleanly across the two owned folders.
