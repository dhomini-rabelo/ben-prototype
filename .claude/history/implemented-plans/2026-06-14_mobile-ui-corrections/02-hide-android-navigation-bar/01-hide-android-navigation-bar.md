# Plan 01 — Hide the Android system navigation bar (immersive)

Deep, code-level implementation plan. Hide the Android bottom system navigation bar (back / home / recents) so the app runs immersive (bar reappears temporarily on swipe, then auto-hides). The top status bar is left untouched.

---

## Context

- **Stack (verified):** Expo SDK **54.0.35** (`node_modules/expo/package.json`), React Native 0.81.5, React 19, new architecture (`newArchEnabled: true`), Expo Router, NativeWind v4.
- **`expo-navigation-bar` is NOT installed** (no `node_modules/expo-navigation-bar`, absent from `package.json`). A **new dependency is required**.
- **Bundled version for SDK 54:** `expo/bundledNativeModules.json` pins `"expo-navigation-bar": "~5.0.10"`. That is the exact version to add so it is aligned with the installed SDK.
- **Edge-to-edge is DISABLED in this project (decisive finding).** In SDK 54, edge-to-edge is opt-in via `android.edgeToEdgeEnabled: true` (Expo config default is `false`). This project:
  - does **not** set `android.edgeToEdgeEnabled` in `app.config.ts` (the full file was read — only `package`, `permissions` under `android`), and
  - does **not** have `react-native-edge-to-edge` or `expo-system-ui` installed (both verified absent from `node_modules`).
  - Therefore edge-to-edge is off. This matters because the `expo-navigation-bar` docs note that **`setVisibilityAsync` and `setBehaviorAsync` are supported only when edge-to-edge is disabled.** Since it is disabled here, the classic visibility+behavior API is the correct, fully supported approach — and we do **not** need `react-native-edge-to-edge` / `SystemBars`. We will **not** enable edge-to-edge (out of scope, and enabling it would break this exact API).
- **`expo-navigation-bar` v5 API (verified against the SDK-54 source):**
  - `setVisibilityAsync(visibility: 'visible' | 'hidden'): Promise<void>`
  - `setBehaviorAsync(behavior: 'overlay-swipe' | 'inset-swipe' | 'inset-touch'): Promise<void>`
  - `'overlay-swipe'` = "Temporarily reveals the System UI after a swipe gesture (bottom or top) **without insetting your App's content**" — exactly the immersive, reappear-on-swipe, auto-hide behavior we want.
- **Top status bar:** controlled in `app/_layout.tsx` by `<StatusBar style="dark" />` (`expo-status-bar`). This plan does not touch it. `expo-navigation-bar` only affects the bottom Android navigation bar, so the status bar is unaffected by definition.

### Project conventions that shape this plan

- Native SDK integrations live behind the **Mobile Services Layer** (`src/services/{capability}-service.ts`): one module is the **sole importer** of a native SDK and exposes intent-named functions; a sibling `{capability}-service.web.ts` provides a no-op for the web bundle (Metro auto-selects `.web.ts`). Confirmed by `notifications-service.ts` / `.web.ts` and `audio-service.ts` / `.web.ts`.
- One-time startup wiring is invoked from the root shell. The existing precedent is `useAuthBootstrap()` (`src/core/auth-bootstrap.ts`), called once in `app/_layout.tsx`, which itself fires `void requestNotificationPermission()` (fire-and-forget, not awaited). We follow the same fire-and-forget startup pattern.
- All file/folder names are **kebab-case**. No code comments unless they carry non-obvious rationale (matching the existing service files, which use brief boundary-rationale comments).
- Path alias `@/*` → `src/*` (tsconfig + babel module-resolver).

---

## Decisions

1. **Dependency:** add `expo-navigation-bar@~5.0.10` (the SDK-54 bundled version). Install with `npx expo install` so Expo resolves the SDK-aligned version and updates the lockfile.
2. **API:** `setBehaviorAsync('overlay-swipe')` then `setVisibilityAsync('hidden')`. Behavior is set **before** visibility so the swipe-to-reveal/auto-hide behavior is attached when the bar is hidden. This is the supported path because edge-to-edge is disabled. We do **not** add the `androidNavigationBar` config-plugin key or any `app.config.ts` plugin entry — the package needs no plugin for this runtime API, and a static `app.config.ts` `androidNavigationBar.visible` would not give the swipe-to-reveal behavior. Runtime setup keeps the immersive behavior co-located and matches the project's "platform concern in a service module" convention.
3. **Where it lives:** a new service module **`src/services/system-ui-service.ts`** (sole importer of `expo-navigation-bar`), with a no-op web sibling **`src/services/system-ui-service.web.ts`**. Rationale: this is a native platform-UI integration, which is exactly what `src/services/` is for, mirroring `notifications-service` / `audio-service`. `src/core/` holds app wiring (env, query client, routes, auth bootstrap) and does not import native SDKs directly, so the SDK belongs in `src/services/`, not `src/core/`.
4. **Android-only guard:** the service guards with `Platform.OS !== 'android'` (early return) so it is a safe no-op on iOS, and the `.web.ts` sibling makes it a no-op on web (no `expo-navigation-bar` import on web at all). The exported function is named for intent: `hideAndroidNavigationBar()`.
5. **Startup invocation:** call `hideAndroidNavigationBar()` once from `app/_layout.tsx`, fire-and-forget (`void`), inside a `useEffect(..., [])`, matching how `auth-bootstrap` fires `requestNotificationPermission`. We do **not** route this through `useAuthBootstrap` (that hook is about auth readiness; navigation-bar hiding is an unrelated concern and should not gate `isReady`).
6. **No status-bar changes:** `<StatusBar style="dark" />` stays exactly as-is.

### Cross-impact (explicitly accounted for — Stage 7 instability note)

- `behavior: 'overlay-swipe'` is the **non-insetting** behavior: when hidden, the app content extends to the bottom edge and the (now-hidden) navigation bar no longer contributes to `insets.bottom`. On a gesture-navigation device `insets.bottom` was already small/zero; on a 3-button device it was previously non-zero and will now effectively become ~0 while the bar is hidden.
- **Consequence for other plans:** any layout that relied on `useSafeAreaInsets().insets.bottom` to keep content clear of the Android nav bar (chat keyboard handling, bottom sheets) will now get a smaller/zero bottom inset on Android. This is the intended immersive result (content should reach the bottom edge), but those plans must not assume a non-zero Android `insets.bottom` for their own bottom padding. This plan does **not** modify any of those files (they are owned by other plans); it only flags the interaction. If a bottom control needs a minimum gap, that belongs in the owning plan as an explicit `paddingBottom` floor (e.g. `Math.max(insets.bottom, MIN_GAP)`), not as a dependency on the nav-bar inset.
- We chose `overlay-swipe` over `inset-swipe` deliberately: `inset-swipe` would re-inset content when the bar is revealed, causing layout shift on every swipe. `overlay-swipe` overlays transiently and is the standard immersive choice.

---

## Files to Create / Modify

This plan owns and touches only: `package.json` (+ lockfile), `app/_layout.tsx`, and the two new `src/services/system-ui-service*` files. No other files are modified.

### 1. CREATE `project-mobile/src/services/system-ui-service.ts`

Native (Android/iOS) implementation. Sole importer of `expo-navigation-bar`. Android-only; safe no-op on iOS.

```ts
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'

// Sole importer of `expo-navigation-bar` (the native Android system-UI SDK).
// Hides the bottom Android navigation bar (back / home / recents) for an
// immersive experience; the bar reappears on a swipe and then auto-hides
// (`overlay-swipe`), without insetting app content. iOS is a no-op (it has no
// such bar); web uses the no-op `system-ui-service.web.ts` variant, which Metro
// picks for the web bundle. Supported because this project does not enable
// edge-to-edge.
export async function hideAndroidNavigationBar(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await NavigationBar.setBehaviorAsync('overlay-swipe')
  await NavigationBar.setVisibilityAsync('hidden')
}
```

### 2. CREATE `project-mobile/src/services/system-ui-service.web.ts`

Web no-op sibling (Metro selects `.web.ts` for the web bundle, so `expo-navigation-bar` is never imported on web). Mirrors `notifications-service.web.ts` / `audio-service.web.ts`.

```ts
// `expo-navigation-bar` is an Android-only native module with no web behavior.
// The web bundle has no system navigation bar to hide, so this is a no-op.
// Metro picks this `.web.ts` variant for the web bundle; native uses
// `system-ui-service.ts`.
export async function hideAndroidNavigationBar(): Promise<void> {}
```

### 3. MODIFY `project-mobile/app/_layout.tsx`

Invoke the hide once at startup, fire-and-forget, in its own `useEffect`. The status bar line is unchanged.

**Add import (with the other `@/...` imports):**

```ts
import { hideAndroidNavigationBar } from '@/services/system-ui-service'
```

**Add effect** (place alongside the existing `useEffect` for splash screen; this one runs once on mount):

```ts
  useEffect(() => {
    void hideAndroidNavigationBar()
  }, [])
```

Resulting `RootLayout` (only additions shown in context — existing splash `useEffect`, `StatusBar`, `Slot` etc. stay exactly as they are):

```tsx
export default function RootLayout() {
  const [fontsLoaded] = useHankenGrotesk({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
  })
  const { isReady } = useAuthBootstrap()

  const isAppReady = fontsLoaded && isReady

  useEffect(() => {
    void hideAndroidNavigationBar()
  }, [])

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync()
    }
  }, [isAppReady])

  // ...unchanged: early return + <GestureHandlerRootView>/<SafeAreaProvider>/<StatusBar style="dark" />/<Slot />
}
```

> Note: `useEffect` is already imported in `app/_layout.tsx` (`import { useEffect } from 'react'`) — no import change needed for it.

### 4. MODIFY `project-mobile/package.json` (+ lockfile)

Add the dependency in the `dependencies` block, alphabetically near the other `expo-*` entries:

```json
    "expo-navigation-bar": "~5.0.10",
```

Adding it via the install command below (rather than hand-editing) is preferred so the lockfile is updated consistently and the SDK-aligned version is confirmed.

---

## Existing Code to Reuse / Mirror

- **`src/services/notifications-service.ts` + `.web.ts`** and **`src/services/audio-service.ts` + `.web.ts`** — the exact service-module + web-noop pattern this plan follows (sole SDK importer, intent-named exports, `Platform.OS` guard, `.web.ts` sibling, brief boundary-rationale comment).
- **`src/core/auth-bootstrap.ts`** — precedent for a fire-and-forget (`void requestNotificationPermission()`) one-time startup side effect invoked from the root layout.
- **`app/_layout.tsx`** — already has the `useEffect`/`void`/`@/services/...` import idioms used here.

No new utility, store, or config abstraction is introduced; the change is intentionally minimal and consistent with the codebase.

---

## Verification

1. **Install the dependency** (also writes the lockfile, SDK-aligned):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx expo install expo-navigation-bar
   ```

   Expected: resolves to `~5.0.10` (the SDK-54 bundled version) and adds it to `package.json` + lockfile.

2. **Type-check** (must pass clean):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
   ```

   Confirms the `'hidden'` / `'overlay-swipe'` string-literal args satisfy `NavigationBarVisibility` / `NavigationBarBehavior`, that both web and native variants of `system-ui-service` expose the same `hideAndroidNavigationBar(): Promise<void>` signature, and that the new import in `_layout.tsx` resolves.

3. **Manual / device check (not part of this plan's automated steps):**
   - Android: the bottom system bar is hidden on the first screen; content reaches the bottom edge; swiping up from the bottom briefly reveals the bar, which then auto-hides.
   - iOS and web: no visual change, no errors (native guard returns early on iOS; web uses the no-op variant).
   - Top status bar (`style="dark"`) unchanged on all platforms.

> No formatting step (`npm run lint:fix`) is run as part of this plan, per instructions.

---

## Out of scope / explicitly NOT done

- Not enabling edge-to-edge (`android.edgeToEdgeEnabled`) — it is off and must stay off for this API to work; enabling it is a different decision owned by no one here.
- Not adding `react-native-edge-to-edge` / `expo-system-ui` / `SystemBars` — unnecessary because edge-to-edge is disabled.
- Not styling the navigation bar background/buttons (only hiding it).
- Not modifying the status bar, nor any chat-keyboard or bottom-sheet files (owned by other plans) — only the cross-impact on `insets.bottom` is documented above.
