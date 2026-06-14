# Plan 05 — UI primitives + icons

**Plan 3 [Frontend] (parallel)**: Rewrite the shared UI primitives and icons for React Native.

- Depends on the scaffold (plan 01) and design tokens (plan 03, earlier slot). Owns `src/layout/components/ui/` and `src/layout/components/icons/` exclusively, so it runs in parallel with plan 04 (API layer). Every screen and composite component consumes these primitives later.

## Goal

Rewrite the web HTML primitives as RN primitives (analysis point 4), keeping the NativeWind classNames identical where possible. `<button>`→`Pressable`, `<span>/<h1>`→`Text`, layout→`View`. Icons move from `lucide-react` to `lucide-react-native` (backed by `react-native-svg`).

## Scope / owned files

- `project-mobile/src/layout/components/ui/button.tsx` — `Button` over `Pressable` + `Text`; keep `bg-primary text-on-primary rounded-lg` etc.; `active:scale` via `pressed` style.
- `project-mobile/src/layout/components/ui/icon-button.tsx` — `IconButton` over `Pressable`; `accessibilityLabel` replaces `aria-label`; `onPress` replaces `onClick`.
- `project-mobile/src/layout/components/ui/typography.tsx` — `Typography` over `Text`; same variant→class map (wordmark/tagline/headline-lg/body-md/button-text/label-caps); `as` prop dropped or mapped to RN.
- `project-mobile/src/layout/components/icons/ben-logo.tsx` — port to `react-native-svg`.
- `project-mobile/src/layout/components/icons/google-icon.tsx` — port to `react-native-svg`.

## Verification

`npx tsc --noEmit` passes; primitives render with NativeWind classes.
