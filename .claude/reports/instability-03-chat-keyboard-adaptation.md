# Instability report — Plan 03 (chat keyboard adaptation) × Plan 02 (Android nav bar hidden)

Scope: READ-ONLY cross-impact analysis. No code was modified.

Files inspected:
- `project-mobile/src/pages/chat/hooks/use-keyboard-height.ts`
- `project-mobile/src/pages/chat/page.tsx`
- `project-mobile/src/pages/chat/components/chat-history/chat-history.tsx`
- `project-mobile/src/services/system-ui-service.ts`
- `project-mobile/app/_layout.tsx`
- `project-mobile/app.config.ts`, `package.json`, `node_modules`

## Verified facts (ground truth)

- Edge-to-edge is **disabled**: `react-native-edge-to-edge` and `expo-system-ui` are **not installed**, `app.config.ts` has no `edgeToEdge` / `androidNavigationBar` config, and `system-ui-service.ts` line 9-10 explicitly states "this project does not enable edge-to-edge." Plan 02's claim is correct; **Plan 03's plan-text assumption that edge-to-edge is enabled-by-default is WRONG.** (Note: SDK 54.0.35, RN 0.81.5, `newArchEnabled: true`, but the edge-to-edge package is absent, so it is not active.)
- No `windowSoftInputMode` / `softwareKeyboardLayoutMode` is configured → Android default `adjustResize` applies.
- `page.tsx` is **clean**: no `KeyboardAvoidingView`, no `Platform` import, no dangling reference or dead branch left by the removal. Imports used = `View`, `LayoutChangeEvent`, `SafeAreaView`. (No instability here.)
- Note: `use-keyboard-height.ts` still imports `Platform` from `react-native` — but it **uses** it (lines 11, 13) to pick `keyboardWillShow/Hide` vs `keyboardDidShow/Hide`. Not unused. (No instability here.)

## Findings

### 1. Double-counting of bottom inset on Android while nav bar is hidden — footer floats too high (potential)

**Severity: medium → low (config-dependent; see reasoning).**

Affected flow/file: `use-keyboard-height.ts` line 28-29 + `page.tsx` lines 61, 94 (footer `bottom: keyboardOffset` inside `SafeAreaView edges={['top','bottom']}`).

The footer rests inside a `SafeAreaView` that already pads `insets.bottom`. The formula `keyboardOffset = keyboardHeight - insets.bottom` is the standard correction for that double-count and is mathematically sound **only when `insets.bottom` matches the gap actually present below the footer at the moment the keyboard is shown.**

Plan 02 hides the Android nav bar via `overlay-swipe` + `hidden`. Two coupled risks arise:

- (a) **Stale/large `insets.bottom`.** `expo-navigation-bar` `setVisibilityAsync('hidden')` does not deterministically force `react-native-safe-area-context` to re-emit `insets.bottom = 0`. If `insets.bottom` is still reported as the old gesture/nav inset (~24-48px) while the bar is visually gone, `keyboardOffset = keyboardHeight - insets.bottom` **subtracts a gap that no longer exists**, leaving the footer floating ~`insets.bottom` px **below** the keyboard top (a visible gap), or — if the SafeAreaView padding is also gone but the formula still subtracts — the footer lifts too little. The behavior depends on whether the inset value and the actual padding agree, which is exactly the kind of mismatch Plan 02 introduces.

- (b) **`overlay-swipe` re-show transient.** With `overlay-swipe`, the user can swipe the nav bar back; it then auto-hides. During that window `insets.bottom` may toggle between ~0 and the real inset. Because `keyboardOffset` is recomputed from `insets.bottom` on every render (line 28-29) but `keyboardHeight` is only refreshed on keyboard show/hide events, a nav-bar swipe **while the keyboard is open** changes `insets.bottom` without a fresh `endCoordinates`, shifting the footer by `±insets.bottom` with no keyboard event — a jump/jitter of the footer and the inverted-list `paddingTop`.

Why it could break: on Android, `endCoordinates.height` is the IME height measured from the screen bottom; whether it includes the nav-bar region depends on edge-to-edge state and OS version. With edge-to-edge OFF (confirmed) and the bar hidden via overlay, the keyboard occupies from the true screen bottom, so the **correct** lift is the full `keyboardHeight` and `insets.bottom` should be ~0. The formula is correct *iff* `insets.bottom` actually reads ~0 in lockstep with the bar being hidden. The instability is the lack of a guarantee that those two are synchronized.

### 2. Empty-state vs inverted-list inset both consume `keyboardOffset` — consistent, but amplifies (1)

**Severity: low.**

`page.tsx` line 79 (empty-state `paddingBottom`) and line 87 (`ChatHistory bottomInset`) both add `keyboardOffset`. `chat-history.tsx` line 80 applies it as `contentContainerStyle.paddingTop` on the `inverted` FlatList — correct, since on an inverted list the visual bottom is `paddingTop`. So content spacing tracks the footer consistently. This is correct in itself, but it means any error from finding (1) is applied in two places simultaneously (footer position AND content padding), so a wrong `keyboardOffset` produces a coherent-but-wrong layout rather than a self-correcting one.

### 3. Voice/recording state — no keyboard, low risk

**Severity: low (no defect found).**

When `isRecording`, `ActiveTaskPicker` is hidden (line 100) and the text input is typically not focused, so `keyboardHeight` is 0 and `keyboardOffset` is 0 — footer sits at rest. The voice bubble (`transcribing`/`error`) renders inside the inverted list header (`chat-history.tsx` lines 84-102) and the empty-state branch is skipped when `hasVoiceBubble` (page.tsx line 74). No conflicting offset path. If a hardware keyboard or stale `keyboardHeight` persisted into recording it could mis-pad, but no concrete defect was found. Noted for completeness.

## Bottom line

The formula is correct in the steady state where `insets.bottom` reflects reality. The genuine instability is the **coupling to `insets.bottom` under Plan 02's overlay-hidden nav bar**: there is no guarantee `insets.bottom` reads ~0 in sync with the hidden bar, and a nav-bar swipe-reveal while typing recomputes `keyboardOffset` without a fresh keyboard event, causing a footer/content jump. Also the plan-text edge-to-edge assumption is factually wrong (edge-to-edge is OFF), which weakens the rationale for the subtraction but does not by itself break the result.

## Suggested fix (not applied)

- Decouple the lift from live `insets.bottom`: capture the inset value at keyboard-show time (e.g. `keyboardOffset = max(keyboardHeight - insetAtShow, 0)`), or simpler, on Android use the full `keyboardHeight` (nav bar is hidden, so no inset to subtract) and only subtract `insets.bottom` on iOS where the home-indicator inset is stable. This removes the swipe-reveal jitter.
- Verify on a physical Android device with the nav bar hidden that `useSafeAreaInsets().bottom` actually returns ~0; if it does not, the `- insets.bottom` term is subtracting a phantom gap and the footer will float above the keyboard.
- Correct the Plan 03 design note: edge-to-edge is disabled in this project (no `react-native-edge-to-edge`); the offset logic must be reasoned about under non-edge-to-edge semantics.
