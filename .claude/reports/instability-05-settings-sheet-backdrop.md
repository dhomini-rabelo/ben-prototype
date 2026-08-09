# Instability analysis — Plan 05 (SettingsSheetOverlay)

READ-ONLY cross-impact review. No code was modified.

Scope reviewed:
- `src/layout/components/menu-settings/settings-sheet-overlay.tsx` (new)
- `src/pages/menu/page.tsx`
- `src/layout/components/menu/menu-sheet.tsx`
- `src/layout/components/menu-settings/settings-view.tsx` / `settings-sheet.tsx`
- `src/layout/components/menu-detail/*` (note-detail, reminder-detail, item-detail-root, item-detail-content)
- `src/layout/stores/menu-store.ts`
- `app/(protected)/_layout.tsx`, `app/_layout.tsx`
- reference `src/pages/chat/components/task-picker/task-picker-sheet.tsx`
- `src/services/system-ui-service.ts` (Plan 02)

## Verdict: mostly safe; one medium issue, two low issues. No high-severity instability.

---

### 1. No exit (slide-down) animation — content disappears instantly on close — MEDIUM
- Affected flow/file: `settings-sheet-overlay.tsx` (lines 27-35, 45-49), affects settings, note detail and reminder detail close.
- Why: `Modal` uses `animationType="none"`. On close the effect sets `translateY.value = SLIDE_OFFSET` and `backdropOpacity.value = 0` **instantly (no `withTiming`)**, and simultaneously `visible={isOpen}` flips to `false`, which unmounts the Modal immediately. Result: the sheet vanishes with no slide-out and no backdrop fade — asymmetric with the 220ms slide-in. The reference task-picker has the same limitation, so this is a known/accepted pattern in the codebase, but it is a visible polish regression versus a real bottom-sheet.
- Severity: medium (UX only; no crash). 
- Suggested fix: drive close as `Modal visible={isMounted}` where `isMounted` stays true until the close animation finishes, animating `translateY`/`backdropOpacity` to the closed values with `withTiming` and flipping `visible` in the timing callback (`runOnJS`). Lower-effort alternative: set `animationType="slide"` and drop the manual translate animation.

### 2. Two overlays can be open simultaneously — stacked Modals — LOW
- Affected flow/file: `menu-store.ts` + `page.tsx` (lines 33-50).
- Why: the store independently tracks `detailTarget` and `isSettingsOpen`; nothing makes them mutually exclusive (`selectEntry('settings')` only sets `isSettingsOpen`, `openDetail` only sets `detailTarget`). Both `SettingsSheetOverlay` instances are rendered unconditionally, so both RN `Modal`s can be `visible` at once. Two transparent Modals stack: their two `bg-inverse-surface/30` scrims overlap (darker than intended), and the Android hardware back button / `onRequestClose` only dismisses the top-most Modal, so back must be pressed twice. In normal UI flow it is hard to open both (detail is opened from list views, settings from the sidebar), so likelihood is low.
- Severity: low.
- Suggested fix: make the store states mutually exclusive (opening settings clears `detailTarget` and vice-versa), or render only the overlay that should win.

### 3. `MenuSheet` bottom padding under Plan 02 (insets.bottom ~0) — LOW (verified NOT clipped)
- Affected flow/file: `menu-sheet.tsx` (lines 14-21).
- Finding: `MenuSheet` applies BOTH `style={{ paddingBottom: insets.bottom }}` AND the Tailwind class `pb-6` (24px static). With Plan 02 hiding the Android nav bar (`insets.bottom` ~0), the `pb-6` floor still guarantees 24px of bottom padding, so settings/detail content is NOT clipped or flush against the screen edge. This matches the reference task-picker, which uses `insets.bottom + 24`. No action required; documented to confirm it was checked.
- Severity: low / non-issue.

---

## Items explicitly checked and found SAFE
- **Modal inside modally-presented route:** the menu route uses `presentation: 'modal'` (`app/(protected)/_layout.tsx`), and Plan 05 renders RN `Modal`s inside it. The chat route already nests an RN `Modal` (task-picker) inside its screen, so RN Modal nesting is an established pattern here. RN `Modal` renders in its own native window above the JS view hierarchy, so it is not affected by the parent route being a stack modal. The transparent backdrop + scrim render correctly.
- **GestureHandlerRootView omission:** confirmed nothing inside `SettingsView`/`SettingsSheet`/`NoteDetail`/`ReminderDetail`/`ItemDetail*` uses `Gesture`/`GestureDetector`. They use `Pressable` (RN responder system — works without GHRV) and `ScrollView` (`item-detail-content.tsx` line 44, native scroll — works without GHRV). The reference wraps in `GestureHandlerRootView` ONLY because of its `Gesture.Pan()` swipe-to-dismiss, which Plan 05 does not have. Omission is correct.
- **Sign-out `router.replace` from inside the Modal:** `SettingsView.handleSignOut` calls `clear()` then `router.replace(ROUTES.login)`. Navigation away unmounts the menu route, the `Menu` component's cleanup runs `reset()` (page.tsx line 24), setting `isSettingsOpen=false`/`detailTarget=null`, so both Modals unmount cleanly. No leaked/orphaned Modal. Safe.
- **Android back button (`onRequestClose`):** wired to `onClose` on both overlays (`settings-sheet-overlay.tsx` line 49), correctly closing the respective sheet — except the double-press case noted in item 2.
- **`reset()` on unmount:** `useEffect(() => () => reset(), [reset])` resets store state on menu unmount; combined with `visible={isOpen}`, the Modals unmount with the route. No dangling state.
