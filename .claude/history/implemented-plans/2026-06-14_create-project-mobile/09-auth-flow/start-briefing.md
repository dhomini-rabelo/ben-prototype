# Plan 09 — Auth flow (Firebase + Google native sign-in + boot + login screen)

**Plan 6 [Frontend] (sync)**: Wire the full authentication flow and the protected-route guard.

- Runs **alone** after all of Phase 1's foundation (plans 02–08). It connects pieces owned by several earlier plans (the API client's 401 handler, the auth store, storage, UI primitives) and establishes the expo-router protected group that the chat and task screens live under, so it must not run in parallel with anything.

## Goal

Implement the native Google auth flow (analysis point 2): no popup. `GoogleSignin.signIn()` → `idToken` → same `POST /auth/login-or-register` → store token (SecureStore) + user (AsyncStorage) → navigate to chat. Bootstrap the cached token on app start (analysis point 1) and wire the API client's 401 handler to expo-router navigation.

## Scope / owned files

- `project-mobile/src/core/firebase.ts` — Firebase JS SDK init from `src/core/env.ts` (kept for parity / token verification needs; native sign-in via GoogleSignin).
- `project-mobile/src/layout/hooks/use-google-auth.ts` — `useGoogleAuth()` using `@react-native-google-signin/google-signin` (`configure({ webClientId })`, `signIn()` → idToken → `basicClient.post(loginOrRegister)` → `setStoredToken`/`setCachedToken` + `setStoredUser` + `useAuthStore.setUser` → `router.replace(ROUTES.chat)`). Keep the same return shape (`signIn, isLoading, isExtendedWait, isPermissionDenied, error`).
- `project-mobile/src/core/auth-bootstrap.ts` — `useAuthBootstrap()` (or boot fn): on app start `loadTokenIntoMemory()` + load stored user into `useAuthStore`; register the API client's `setUnauthorizedHandler` to clear auth + `router.replace(ROUTES.login)`.
- `project-mobile/src/pages/login/page.tsx` — `Login` screen (RN), Google sign-in button, loading/error/extended-wait states.
- `project-mobile/app/index.tsx` — login route rendering `Login`; redirects to chat if already authenticated.
- `project-mobile/app/(protected)/_layout.tsx` — guard layout: if no cached token/user → `Redirect` to `/`; else render the protected `Stack`. Runs `useAuthBootstrap` at the root (or scaffold `_layout` invokes bootstrap — coordinate: bootstrap is invoked here in the guard, scaffold `_layout` stays generic).

## Verification

`npx tsc --noEmit` passes; unauthenticated users land on login, authenticated users reach the protected stack (chat screen may be a placeholder until plan 16).
