# Diff Review 3 — `system-ui-service` + navigation-bar hiding (project-mobile)

Scope: `app/_layout.tsx`, `src/services/system-ui-service.ts` (new), `src/services/system-ui-service.web.ts` (new), `package.json` (new dep `expo-navigation-bar`).

Reference patterns used for comparison:
- Mobile Services Layer Structure design doc (`.claude/skills/code-get-coding-designs/designs/mobile-services-layer-structure.md`)
- `src/services/notifications-service.ts` + `.web.ts`, `src/services/audio-service.ts` + `.web.ts`
- Startup-wiring precedent: `src/core/auth-bootstrap.ts`
- General code preferences (`code-write-code`)

Overall: the change is a clean, on-pattern application of the Mobile Services Layer. The structural conventions are followed precisely. The one substantive problem is a correctness/accuracy issue rooted in the SDK 54 + new-architecture configuration, not in the file layout.

---

## `src/services/system-ui-service.ts` (new)

### Follows the standard
- Correct boundary: this module is the **sole importer** of `expo-navigation-bar`, matching the rule that one `{capability}-service.ts` owns a native SDK (doc lines 5–17). No other file imports the SDK; consumers call the exported function.
- Naming and shape match the siblings: kebab-case file, intent-named exported async function (`hideAndroidNavigationBar`) describing *what* the app wants, not the SDK call. Mirrors `requestNotificationPermission` / `beginRecording`.
- Platform guard `if (Platform.OS !== 'android') return` matches the exact idiom in `notifications-service.ts` `ensureAndroidChannel` (lines 17–20).
- Returns `Promise<void>`, consistent with the void-returning service functions in both reference services.
- Explanatory header comment naming the SDK and the `.web.ts` fallback follows the convention established in `audio-service.ts` (lines 11–14) and `notifications-service.web.ts` (lines 4–6).

### Deviates from the standard
- **Inaccurate / outdated comment and likely no-op behavior** — `system-ui-service.ts:9-10`. The comment asserts: *"Supported because this project does not enable edge-to-edge."* This is incorrect for this project. `app.config.ts:11` sets `newArchEnabled: true`, and the stack is Expo SDK 54 / RN 0.81 (per project context). On SDK 54, **edge-to-edge is enabled by default on Android and cannot be disabled** — it is mandatory with the new architecture. There is no `edge-to-edge` opt-out anywhere in `app.config.ts`, so the comment's premise does not hold. This is a factual claim in the code that contradicts the actual configuration — a `NO GUESSING` concern.
- **Deprecated API** — `system-ui-service.ts:15-16`. `NavigationBar.setVisibilityAsync` is officially deprecated ("Use `NavigationBar.setHidden` instead. This will be removed in a future release" — Expo NavigationBar docs). Under edge-to-edge the `setVisibility`/`setBehavior` family is documented as deprecated and effectively non-functional, so `setVisibilityAsync('hidden')` is unlikely to actually hide the bar on a SDK 54 build. The reference services deliberately use current, supported SDK calls; this file leans on a deprecated path.

### Suggested improvement
- **[high]** Verify the runtime behavior on a real SDK 54 Android build before relying on this. If the goal is an immersive bar hide, migrate to the supported approach (`NavigationBar.setHidden` and/or the documented edge-to-edge immersive behavior) rather than the deprecated `setVisibilityAsync`. If the bar genuinely cannot be hidden under mandatory edge-to-edge, the function may be a silent no-op and the feature should be reconsidered.
- **[high]** Fix the comment at lines 9–10. Remove/replace the "does not enable edge-to-edge" claim — the project *does* run edge-to-edge (`newArchEnabled: true`, SDK 54). The comment currently misleads future readers about why the approach was chosen.
- **[low]** The two awaited calls (`setBehaviorAsync` then `setVisibilityAsync`) are sequential `await`s; that is fine and consistent with the sequential style elsewhere (e.g. `rescheduleReminderNotification`). No change needed beyond the API migration above.

---

## `src/services/system-ui-service.web.ts` (new)

### Follows the standard
- Exact mirror of the established `.web.ts` no-op pattern: same exported signature as the native file, empty async body returning `Promise<void>`, matching `notifications-service.web.ts` and `audio-service.web.ts`.
- Header comment explains *why* it is a no-op and that Metro selects the `.web.ts` variant — same convention as the sibling web files (`audio-service.web.ts:1-4`).
- Signature stays in sync with the native variant (both `hideAndroidNavigationBar(): Promise<void>`), which is the contract-parity requirement the reference pair upholds.

### Deviates from the standard
- None.

### Suggested improvement
- None. This file is fully consistent with the pattern.

---

## `app/_layout.tsx`

### Follows the standard
- Consumer imports only the service function (`import { hideAndroidNavigationBar } from '@/services/system-ui-service'`), never the SDK — exactly the consumer rule in the design doc (lines 33–41). Uses the `@/` path alias, matching the general preference against deep relative imports.
- `void hideAndroidNavigationBar()` in a one-time `useEffect(..., [])` matches the established fire-and-forget startup idiom: `auth-bootstrap.ts:26` does `void requestNotificationPermission()` for the same "kick off a native side-effect, don't await it" intent.
- Import is alphabetically placed within the `@/` group and the `'@/core/global.css'` side-effect import remains last, preserving existing import ordering.

### Deviates from the standard
- **Wiring location vs. precedent** — `_layout.tsx:34-36`. The project's startup-wiring precedent is `src/core/auth-bootstrap.ts`, which centralizes app-start native side-effects (token load, store hydrate, notification permission) behind a `useAuthBootstrap()` hook that `_layout.tsx` already consumes. This new side-effect is instead wired as a second standalone `useEffect` directly in `_layout.tsx`, bypassing that bootstrap seam. It is a minor inconsistency: there are now two startup mechanisms (the bootstrap hook *and* an inline effect) for conceptually similar "do this once on app start" work.
  - Counter-point worth noting: `auth-bootstrap` is specifically *auth* bootstrap (its name and contents are auth-scoped), and hiding the navigation bar is a UI/system concern, not auth. So placing it outside `useAuthBootstrap` is defensible. The deviation is about whether system-UI startup deserves its own seam rather than an inline effect, not a hard rule break.

### Suggested improvement
- **[low]** Consider invoking `hideAndroidNavigationBar()` from a startup seam rather than an inline `useEffect`, to keep `_layout.tsx` declarative and concentrate "on app start" side-effects in one place — consistent with how `auth-bootstrap` already encapsulates startup work. Since it is not auth-related, an alternative is a small dedicated bootstrap (e.g. a `useSystemUiBootstrap` hook) or simply leaving it inline if the team prefers to keep auth-bootstrap auth-only. Cosmetic; the current code works and the dependency direction is correct.

---

## `package.json`

### Follows the standard
- New dependency `expo-navigation-bar` is inserted in the correct alphabetical position within the `expo-*` block (between `expo-linking` and `expo-notifications`), matching the existing ordering of dependencies.
- Version range `~5.0.10` uses the same tilde (patch-range) convention as the surrounding Expo packages (`expo-linking ~8.0.12`, `expo-notifications ~0.32.0`).

### Deviates from the standard
- **No config-plugin / app.config wiring reviewed against it** — not strictly a `package.json` issue, but worth flagging here since it gates whether the dep even works: `app.config.ts` lists native config plugins for the other native modules (`expo-notifications`, `expo-audio`, `expo-secure-store`, google-signin). `expo-navigation-bar` historically shipped a config plugin (e.g. for `enforceContrast` / visibility). Whether one is needed here depends on the chosen API, but it is not present in `app.config.ts`. Verify nothing further is required for the prebuild.

### Suggested improvement
- **[medium]** Confirm the version is compatible with SDK 54 via `npx expo install --check` (Expo curates per-SDK versions; `~5.0.10` should be validated rather than hand-pinned). Tie this to the API-migration decision above — if the feature moves to `setHidden`/edge-to-edge immersive, confirm the resolved version still exposes it.

---

## Summary of severities
- **high** — `system-ui-service.ts`: deprecated `setVisibilityAsync` + edge-to-edge claim that is false for this project (SDK 54 / `newArchEnabled: true`); likely a runtime no-op. Verify on-device and migrate to the supported API.
- **high** — `system-ui-service.ts:9-10`: incorrect comment about edge-to-edge not being enabled.
- **medium** — `package.json`: validate `expo-navigation-bar` version against SDK 54 (`expo install --check`) and confirm no missing config-plugin wiring in `app.config.ts`.
- **low** — `_layout.tsx`: inline startup `useEffect` vs. the centralized bootstrap seam precedent (defensible, since the concern is not auth).

Structurally the services-layer pattern is followed correctly; the real risk is behavioral correctness under SDK 54 edge-to-edge, not file organization.

Sources:
- [Expo NavigationBar — setVisibilityAsync deprecated](https://docs.expo.dev/versions/latest/sdk/navigation-bar/)
- [android-navigation-bar-visible-deprecated (expo/fyi)](https://github.com/expo/fyi/blob/main/android-navigation-bar-visible-deprecated.md)
- [Expo SDK 54 changelog — edge-to-edge mandatory on Android](https://expo.dev/changelog/sdk-54)
