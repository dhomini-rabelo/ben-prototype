# Plan 02 — Hide the Android system navigation bar (immersive)

**Plan 1 [Frontend] (parallel)**: Hide the Android system navigation bar (the bottom system buttons: back, home/central, recents) so it does not show all the time.

- Runs in parallel with all other plans. It owns the **app shell / configuration** files (`app.config.ts`, `app/_layout.tsx`, `package.json` + lockfile, and any new system-UI setup file it creates under `src/core` or `src/services`). No other plan in this task touches these files, so there is no conflict. The behavioral interaction with the chat keyboard plan and the bottom-sheet plans (changing `insets.bottom`) is intentionally left for the cross-impact instability check (Stage 7).

## Goal

Images 1 and 2 show the Android system navigation bar (back button, central home button, recents — "abas padrão do android") visible at all times. It should be hidden, giving an immersive experience (the bar can reappear on user swipe). The status bar at the top must remain as-is.

Use the Expo-recommended mechanism for the project's stack (Expo SDK 54 / RN 0.81, new architecture / edge-to-edge). The likely approach is `expo-navigation-bar`: set the Android navigation bar visibility to `hidden` and the behavior to `overlay-swipe` so it stays hidden but is reachable by swiping. This must be Android-only (guard with `Platform.OS === 'android'`) and a no-op on iOS. Confirm the exact API and configuration against the installed Expo SDK and the project conventions before implementing. Do not change the top status bar configuration.

## Files owned

- `project-mobile/app.config.ts`
- `project-mobile/app/_layout.tsx`
- `project-mobile/package.json` and its lockfile (if a new dependency such as `expo-navigation-bar` is required)
- Any new system-UI setup module the plan creates (e.g. under `project-mobile/src/core/` or `project-mobile/src/services/`)

## Reference (read-only, not owned)

- `project-mobile/app/_layout.tsx` — current root shell: `SafeAreaProvider`, `StatusBar style="dark"`, `Slot`.
- `project-mobile/app.config.ts` — current Expo config and plugin list.
- `docs/` design references if relevant.
