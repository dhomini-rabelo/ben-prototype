# Cross-impact instability analysis — Plan 02 (hide Android navigation bar)

READ-ONLY analysis. No code was modified.

## Scope verified

- Plan 02 code is exactly as described: `src/services/system-ui-service.ts` calls
  `NavigationBar.setBehaviorAsync('overlay-swipe')` then `setVisibilityAsync('hidden')`,
  invoked once from `app/_layout.tsx` in a mount `useEffect`. `.web.ts` is a no-op.
- `expo-navigation-bar@~5.0.10` is installed.

## Edge-to-edge state — CONFIRMED DISABLED (Plan 03's assumption is wrong)

- `app.config.ts` has **no** `android.edgeToEdgeEnabled` flag.
- `node_modules` has **no** `react-native-edge-to-edge` and **no** `expo-system-ui`.
  The only match, `react-native-is-edge-to-edge`, is a transitive *detection* helper
  pulled in by expo-router / react-native-screens / reanimated / expo-status-bar — it
  does NOT enable edge-to-edge.
- Expo SDK 54, managed workflow (no `android/` dir). No `softwareKeyboardLayoutMode` set
  → Android default `adjustResize`.

Consequence: because edge-to-edge is OFF, app content is laid out inside the window
content frame (the area *not* covered by system bars). When `overlay-swipe` + hidden
removes the nav bar, the content frame grows into that space and
`useSafeAreaInsets().bottom` collapses toward ~0. So Plan 02's premise (insets.bottom→0)
is correct, and Plan 03's premise (edge-to-edge enabled) is the incorrect one. Plan 03's
keyboard formula still happens to behave correctly (see below), but the documented
rationale is built on a false assumption and should be corrected to avoid future
mis-edits.

## Findings

### 1. `overlay-swipe` reveal causes repeated inset reflow on bottom-anchored UI — MEDIUM
- Affected: `src/pages/chat/page.tsx`, `src/pages/task-workspace/page.tsx` (both
  `SafeAreaView edges={['top','bottom']}`), `src/layout/components/menu/menu-sheet.tsx`
  (`paddingBottom: insets.bottom`), `src/pages/chat/components/task-picker/task-picker-sheet.tsx`
  (`paddingBottom: insets.bottom + 24`), `src/pages/chat/hooks/use-keyboard-height.ts`.
- Why it could break: `overlay-swipe` is not a permanent hide — any upward swipe from the
  bottom edge transiently re-shows the nav bar, which restores the real `insets.bottom`,
  then it auto-hides and insets collapse again. With edge-to-edge off, each transition
  changes the content-frame-derived insets, so every reveal/auto-hide cycle reflows the
  chat/workspace `SafeAreaView` bottom padding, the `MenuSheet` / task-picker sheet
  bottom padding, and the chat `bottomInset` (footerHeight + gap + keyboardOffset). User
  sees the docked footer and open bottom sheets "jump" up/down on each swipe near the
  bottom. Cosmetic, not a crash, but visible jitter on a very common gesture zone.
- Severity: medium.
- Suggested fix: pin a stable bottom spacing instead of live `insets.bottom` for the
  immersive state — e.g. cache the initial (bar-visible) inset once, or use a constant
  minimum bottom padding, so reveal/hide cycles don't reflow. Alternatively keep the bar
  permanently gone (`'inset-swipe'` is not available with hidden; consider documenting
  that transient reveals are expected) and decouple layout padding from `insets.bottom`.

### 2. Docked footer now sits inside the immersive reveal gesture zone — MEDIUM
- Affected: chat footer (`page.tsx` `absolute inset-x-0 bottom-0`, send/mic IconButton)
  and `task-workspace` `WorkspaceFooter`, both now flush to the physical screen bottom
  once `insets.bottom ≈ 0`.
- Why it could break: the gesture that reveals an `overlay-swipe` immersive bar is a
  swipe up from the very bottom edge — exactly where the send/mic button and the text
  input now live. Taps/drags starting at the bottom edge may be consumed by the system
  immersive-reveal gesture instead of the button/input, causing missed taps or an
  unexpected nav-bar flash while typing/sending. Hardest-hit interaction: tapping the
  send/mic button which is bottom-docked.
- Severity: medium.
- Suggested fix: keep a small persistent bottom gap (e.g. minimum bottom padding ~16–24px
  even when insets.bottom is 0) so interactive controls are lifted out of the edge gesture
  strip; verify on a gesture-nav device.

### 3. Keyboard offset formula — interaction is actually SOUND (no bug) — informational
- `use-keyboard-height.ts`: `offset = max(keyboardHeight - insets.bottom, 0)`.
- On Android, `keyboardDidShow.endCoordinates.height` is measured from the physical screen
  bottom; the footer is lifted `insets.bottom` above that bottom, so subtracting
  `insets.bottom` correctly yields the overlap to clear. When the bar is hidden and
  `insets.bottom ≈ 0`, the formula degrades to `keyboardHeight`, which is the correct
  offset for that state. So Plan 02 does NOT make the footer float or stick via this
  formula — it self-corrects. (Listed only to record that this specific worry was checked
  and dismissed.) Note: chat uses manual JS offset while task-workspace uses
  `KeyboardAvoidingView behavior="height"`; that inconsistency is pre-existing and not
  caused by Plan 02.

## Items checked and found NOT affected
- `menu-list-shell.tsx` and `menu-sidebar.tsx` only consume `insets.top` (+ fixed
  `paddingBottom: 40` on the scroll). Plan 02 doesn't touch top insets → no impact.
- `login/page.tsx` has no safe-area usage (centered content) → no impact.
- `settings-sheet-overlay.tsx` itself reads no insets; its child `MenuSheet`/`SettingsView`
  handles bottom padding → covered under finding 1.

## Bottom line
Two medium-severity instabilities (repeated bottom-inset reflow on swipe; docked controls
inside the immersive reveal gesture strip) plus a documentation-correctness issue (Plan 03
wrongly assumed edge-to-edge enabled). No high-severity break and no crash. The keyboard
formula interaction is sound.
