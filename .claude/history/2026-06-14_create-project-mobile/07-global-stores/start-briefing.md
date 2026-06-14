# Plan 07 — Global stores (auth, connectivity, menu) + connectivity hook

**Plan 4 [Frontend] (parallel)**: Port the cross-page Zustand stores and the connectivity sync hook.

- Depends on the API models (plan 04) and storage (plan 02). Owns `src/layout/stores/auth-store.ts`, `connectivity-store.ts`, `menu-store.ts`, and `src/layout/hooks/use-connectivity.ts`. Distinct files from plan 06 (generic hooks), so it runs in parallel.

## Goal

Port the platform-agnostic global stores. `auth-store` persists the user via AsyncStorage (plan 02) instead of cookies. `connectivity-store` keeps the same shape but is synced from **`@react-native-community/netinfo`** instead of `navigator.onLine`. `menu-store` ports intact (state machine for menu view/detail/settings).

## Scope / owned files

- `project-mobile/src/layout/stores/auth-store.ts` — `useAuthStore { user, setUser, clear }`; `setUser` writes through `setStoredUser` (plan 02); `clear` calls `clearStoredUser` + `clearStoredToken`.
- `project-mobile/src/layout/stores/connectivity-store.ts` — `useConnectivityStore { isOffline, setOffline }` (copy intact).
- `project-mobile/src/layout/stores/menu-store.ts` — `useMenuStore { view, detailTarget, isSettingsOpen, selectEntry, goBackToMenu, openDetail, closeDetail, closeSettings, reset }` (copy intact).
- `project-mobile/src/layout/hooks/use-connectivity.ts` — `useConnectivity()` subscribing to `NetInfo.addEventListener`, calling `setOffline(!state.isConnected)`.

## Verification

`npx tsc --noEmit` passes.
