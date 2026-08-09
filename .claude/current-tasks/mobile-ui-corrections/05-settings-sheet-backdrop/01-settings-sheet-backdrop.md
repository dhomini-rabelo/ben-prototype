# Plan 05 — Dimmed, unclickable, tap-to-dismiss backdrop behind the settings sheet

## Context

In `project-mobile`, the menu screen (`src/pages/menu/page.tsx`) renders the settings quick-navigation bottom sheet as a bare absolute-positioned wrapper:

```tsx
{isSettingsOpen && (
  <View className="absolute inset-x-0 bottom-0">
    <SettingsView onClose={closeSettings} />
  </View>
)}
```

There is no backdrop: the menu behind the sheet stays bright and fully clickable, and there is no tap-to-dismiss outside the sheet. The same backdrop-less pattern is also used for the note/reminder detail sheet directly above it in the same file.

The codebase already has a gold-standard "modal + animated scrim + tap-to-dismiss + slide-up" pattern in `src/pages/chat/components/task-picker/task-picker-sheet.tsx`:

- React Native `Modal` with `transparent` + `animationType="none"`, closed via `onRequestClose`.
- A full-screen `Pressable` wired to `onClose`, holding an `Animated.View` scrim styled `bg-inverse-surface/30`, faded in with `react-native-reanimated` (`useSharedValue` + `withTiming`, 220 ms).
- The sheet content slides up via an `Animated.View` `translateY`, anchored to the bottom (`flex-1 justify-end`), respecting the safe area via `useSafeAreaInsets`.
- A `GestureHandlerRootView` inside the Modal (Modal renders in a detached native view hierarchy outside the root `GestureHandlerRootView` in `app/_layout.tsx`, so gesture handling must be re-rooted inside it).

The settings content is presented through a two-layer composition this plan owns:

- `src/layout/components/menu-settings/settings-view.tsx` — container: reads `useAuthStore` for the user, owns the sign-out flow + `signOutState`, and delegates to `SettingsSheet`. Receives `onClose` from the page.
- `src/layout/components/menu-settings/settings-sheet.tsx` — presentational: renders the profile/sign-out/error UI inside the shared `MenuSheet` (`src/layout/components/menu/menu-sheet.tsx`, the rounded safe-area sheet base — **read-only reference, owned by another plan, not modified**). Owns the `onClose` X button.

State lives in `src/layout/stores/menu-store.ts`: `isSettingsOpen: boolean`, `closeSettings: () => void`. The store already works correctly and is **not** modified by this plan.

### Ownership / parallelism constraints

This plan OWNS and may only modify:
- `src/pages/menu/page.tsx`
- everything under `src/layout/components/menu-settings/` (existing `settings-view.tsx`, `settings-sheet.tsx`, plus any new file added there)

It MUST NOT touch:
- `src/layout/components/menu/*` (e.g. `menu-sheet.tsx`, `menu-sidebar.tsx`) — owned by Plan 04. `MenuSheet` is only imported/reused, never edited.
- `src/layout/stores/menu-store.ts` — read-only; its `isSettingsOpen`/`closeSettings` are reused as-is.
- the task-picker files — read-only reference only.

If a shared backdrop wrapper is needed it is created under `menu-settings/`, never under `menu/`.

## Decisions

1. **Add a reusable backdrop/modal wrapper component under `menu-settings/`** (per the simple plan, preferred). New file: `src/layout/components/menu-settings/settings-sheet-overlay.tsx`, exporting `SettingsSheetOverlay`.

   Justification:
   - Keeps `menu/page.tsx` declarative — it just renders `<SettingsSheetOverlay isOpen={...} onClose={...}>` and forwards content — instead of inlining Modal + animated scrim + slide-up wiring (the simple plan calls this out explicitly).
   - Mirrors the existing "view wraps sheet" composition in this area, and keeps everything this plan owns self-contained, without touching `menu/` or the store.
   - Faithfully reuses the gold-standard `task-picker-sheet.tsx` pattern (transparent native Modal + animated `bg-inverse-surface/30` scrim + tappable backdrop wired to close + content slide-up), so behavior and visuals match the rest of the app.

2. **Make the wrapper a generic content host, not settings-specific.** `SettingsSheetOverlay` takes `isOpen`, `onClose`, and `children`, and renders the Modal/scrim/slide-up shell. It does **not** itself render `MenuSheet` or any settings UI — the caller passes the already-rounded sheet content (`<SettingsView />`, which renders `MenuSheet` internally). This avoids double-wrapping in `MenuSheet` and keeps `SettingsView`/`SettingsSheet` unchanged.

   - The wrapper provides only the slide-up animated container that the rounded sheet sits in. Because `SettingsView` → `SettingsSheet` → `MenuSheet` already supplies the `rounded-t-3xl bg-surface-container-lowest` surface, the wrapper's animated container is an unstyled (transparent) `Animated.View` anchored bottom — it only carries the `translateY` transform. This mirrors how `task-picker-sheet` owns the surface, except here the surface comes from `MenuSheet`; we therefore do not re-apply background/rounding/padding in the wrapper, letting `MenuSheet` keep ownership of safe-area padding (`insets.bottom`) and styling. No visual regression to the existing settings sheet.

3. **Tap-to-dismiss only; no pan/swipe-to-dismiss gesture.** The briefing/simple plan require: dimmed scrim, unclickable menu behind, tap-backdrop-to-close, slide-up. They do **not** require swipe-to-dismiss. Omitting the `Gesture.Pan` keeps the wrapper minimal and avoids pulling in `GestureHandlerRootView`/`GestureDetector` for a behavior not requested. The backdrop `Pressable` + `Modal onRequestClose` (Android back button) fully satisfy dismissal. If swipe-to-dismiss is desired later it can be added following the task-picker exactly.

4. **Unclickable menu behind is achieved structurally by the `Modal`.** A `transparent` RN `Modal` renders its content in a separate top-level native view that intercepts all touches; the menu underneath cannot receive taps while it is visible. The full-screen backdrop `Pressable` both dims (via its child `Animated.View` scrim) and captures outside taps to call `onClose`. The sheet content sits above the backdrop in the same `flex-1 justify-end` column, so its controls (profile, Sign out, retry, X close) stay fully interactive.

5. **Animation parity with the reference.** Reuse `useSharedValue` + `withTiming(..., { duration: 220 })` for both `backdropOpacity` (0 → 1 fade) and `translateY`. Initialize `translateY` to a positive offset so the sheet starts below the screen and slides up to `0` on open, matching the slide-up feel. (The reference starts `translateY` at `0`; because its sheet is bottom-anchored and the Modal mounts/unmounts with the sheet, the visible motion there comes mainly from the backdrop fade. To make the slide-up explicit and unmistakable for the settings sheet — the required deliverable — initialize `translateY` to a small positive value, e.g. the sheet's measured height fallback `600`, and animate to `0`. A simple, dependency-free approach: start at a fixed offscreen offset and `withTiming` to `0` on open.)

6. **Apply the same wrapper to the note/reminder detail sheet too (secondary, justified).** This plan owns `page.tsx`, and the detail sheet directly above the settings block uses the identical backdrop-less `<View className="absolute inset-x-0 bottom-0">` pattern. Wrapping it in the same `SettingsSheetOverlay` (driven by `detailTarget != null` / `closeDetail`) removes the inconsistency the briefing notes, costs nothing extra, and touches only the owned `page.tsx`. The wrapper is content-agnostic (decision 2), so it hosts the detail `MenuSheet` content identically. **Settings remains the priority and the required deliverable;** the detail-sheet change is a consistency bonus contained entirely within owned files. Wrapper name stays `SettingsSheetOverlay` since it lives under `menu-settings/` and the settings sheet is its primary purpose; it is generic enough to also host the detail content. (Alternative considered: a fully neutral name/location — rejected because a neutral location would be `menu/` or a shared dir, which this plan does not own.)

7. **No store changes.** `isSettingsOpen`, `closeSettings`, `detailTarget`, `closeDetail` already exist and are correct. The wrapper is driven entirely by props from `page.tsx`.

## Existing code to reuse

- `src/pages/chat/components/task-picker/task-picker-sheet.tsx` — pattern source for `Modal`/scrim/slide-up/`Pressable`-close (read-only).
- `src/layout/components/menu/menu-sheet.tsx` — `MenuSheet` already provides the rounded surface + safe-area bottom padding; reused unchanged via `SettingsView`/`SettingsSheet` (and the detail components). Not modified.
- `src/layout/stores/menu-store.ts` — `isSettingsOpen`, `closeSettings`, `detailTarget`, `closeDetail`. Reused unchanged.
- `react-native-reanimated` (`Animated`, `useSharedValue`, `useAnimatedStyle`, `withTiming`) and `react-native-safe-area-context` (`useSafeAreaInsets`) — already used by the reference; available dependencies (Expo SDK 54 stack).
- NativeWind theme tokens `bg-inverse-surface/30` and `bg-surface-container-lowest` — already used by the reference.

## Files to create

### `src/layout/components/menu-settings/settings-sheet-overlay.tsx` (new)

A content-agnostic bottom-sheet overlay: transparent Modal + animated dim scrim (tap-to-close) + slide-up animated container that hosts the caller's already-styled sheet content.

```tsx
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Modal, Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type SettingsSheetOverlayProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const SLIDE_OFFSET = 600
const ANIMATION_DURATION = 220

export function SettingsSheetOverlay({
  isOpen,
  onClose,
  children,
}: SettingsSheetOverlayProps) {
  const translateY = useSharedValue(SLIDE_OFFSET)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION })
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION })
    } else {
      translateY.value = SLIDE_OFFSET
      backdropOpacity.value = 0
    }
  }, [isOpen, translateY, backdropOpacity])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose}>
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-inverse-surface/30"
          />
        </Pressable>

        <Animated.View style={sheetStyle} className="w-full">
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}
```

Notes:
- No `GestureHandlerRootView`/`GestureDetector`: there is no pan gesture (decision 3), so they are unnecessary. The root `app/_layout.tsx` `GestureHandlerRootView` is irrelevant here because no gestures are used inside this Modal.
- The animated sheet container is `w-full` only (transparent, no padding/background/rounding) — the rounded surface + safe-area bottom padding come from the `MenuSheet` rendered inside `children`, preserving the current settings/detail visuals exactly (decision 2).
- Resetting the shared values in the `else` branch ensures the next open always starts from the offscreen/transparent state (the Modal unmounts its tree when `visible` is false, but resetting is explicit and cheap).

## Files to modify

### `src/pages/menu/page.tsx`

Replace the two bare `absolute inset-x-0 bottom-0` wrappers with `SettingsSheetOverlay`. The settings sheet is the required change; the detail sheet is wrapped too for consistency (decision 6).

Add the import:

```tsx
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
```

Replace the detail block:

```tsx
      {detailTarget && (
        <View className="absolute inset-x-0 bottom-0">
          <MenuSheet>
            {detailTarget.kind === 'note' ? (
              <NoteDetail noteId={detailTarget.id} onClose={closeDetail} />
            ) : (
              <ReminderDetail
                reminderId={detailTarget.id}
                onClose={closeDetail}
              />
            )}
          </MenuSheet>
        </View>
      )}
```

with:

```tsx
      <SettingsSheetOverlay isOpen={detailTarget != null} onClose={closeDetail}>
        {detailTarget && (
          <MenuSheet>
            {detailTarget.kind === 'note' ? (
              <NoteDetail noteId={detailTarget.id} onClose={closeDetail} />
            ) : (
              <ReminderDetail
                reminderId={detailTarget.id}
                onClose={closeDetail}
              />
            )}
          </MenuSheet>
        )}
      </SettingsSheetOverlay>
```

Replace the settings block:

```tsx
      {isSettingsOpen && (
        <View className="absolute inset-x-0 bottom-0">
          <SettingsView onClose={closeSettings} />
        </View>
      )}
```

with:

```tsx
      <SettingsSheetOverlay isOpen={isSettingsOpen} onClose={closeSettings}>
        <SettingsView onClose={closeSettings} />
      </SettingsSheetOverlay>
```

Resulting full file:

```tsx
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { MenuSidebarView } from '@/layout/components/menu/menu-sidebar-view'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { NoteDetail } from '@/layout/components/menu-detail/note-detail'
import { ReminderDetail } from '@/layout/components/menu-detail/reminder-detail'
import { MenuNotesView } from '@/layout/components/menu-notes/menu-notes-view'
import { MenuRemindersView } from '@/layout/components/menu-reminders/menu-reminders-view'
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
import { SettingsView } from '@/layout/components/menu-settings/settings-view'
import { MenuTasksView } from '@/layout/components/menu-tasks/menu-tasks-view'
import { useMenuStore } from '@/layout/stores/menu-store'

export function Menu() {
  const router = useRouter()
  const view = useMenuStore((store) => store.view)
  const detailTarget = useMenuStore((store) => store.detailTarget)
  const isSettingsOpen = useMenuStore((store) => store.isSettingsOpen)
  const closeDetail = useMenuStore((store) => store.closeDetail)
  const closeSettings = useMenuStore((store) => store.closeSettings)
  const reset = useMenuStore((store) => store.reset)

  useEffect(() => () => reset(), [reset])

  return (
    <View className="flex-1 bg-surface-container-lowest">
      {view === 'menu' && <MenuSidebarView onClose={() => router.back()} />}
      {view === 'tasks' && <MenuTasksView />}
      {view === 'notes' && <MenuNotesView />}
      {view === 'reminders' && <MenuRemindersView />}

      <SettingsSheetOverlay isOpen={detailTarget != null} onClose={closeDetail}>
        {detailTarget && (
          <MenuSheet>
            {detailTarget.kind === 'note' ? (
              <NoteDetail noteId={detailTarget.id} onClose={closeDetail} />
            ) : (
              <ReminderDetail
                reminderId={detailTarget.id}
                onClose={closeDetail}
              />
            )}
          </MenuSheet>
        )}
      </SettingsSheetOverlay>

      <SettingsSheetOverlay isOpen={isSettingsOpen} onClose={closeSettings}>
        <SettingsView onClose={closeSettings} />
      </SettingsSheetOverlay>
    </View>
  )
}
```

Notes:
- `MenuSheet` import stays (still used inside the detail overlay).
- `View` import stays (still used for the page root).
- Rendering `SettingsSheetOverlay` unconditionally and gating visibility via the `isOpen` prop matches the `ActiveTaskPicker`/`TaskPickerSheet` usage convention (the Modal handles mount/unmount via `visible`). The `children` are still guarded (`detailTarget && ...`) so detail data is only read when present; `SettingsView` is cheap and safe to keep mounted but is only visible while the Modal is open.

## No changes required

- `src/layout/components/menu-settings/settings-view.tsx` — unchanged; still receives `onClose` and renders `SettingsSheet`.
- `src/layout/components/menu-settings/settings-sheet.tsx` — unchanged; still renders inside `MenuSheet` with its X close button.
- `src/layout/stores/menu-store.ts` — unchanged.
- `src/layout/components/menu/menu-sheet.tsx` — unchanged (read-only reuse).

## Edge cases & impact

- **Sign-out flow:** `SettingsView.handleSignOut` calls `router.replace(ROUTES.login)`. The Settings overlay Modal will unmount on navigation as the menu route unmounts; `closeSettings` state reset on unmount (`reset()` in the page effect) keeps state clean. No change needed.
- **Android back button:** now closes the sheet via `Modal onRequestClose` → `onClose`, an improvement over the previous bare-`View` version (which had no back handling).
- **Detail + settings simultaneously:** the store allows both `detailTarget` and `isSettingsOpen`; previously both bare views could stack. With two `Modal`s the later-declared one (settings) renders on top, same as before. Not a regression and not a real flow (entries are mutually exclusive in practice).
- **Scrim token:** `bg-inverse-surface/30` is the established dim value from the reference; matches design consistency.

## Verification

This plan does NOT run any formatting step (`npm run lint:fix`) per instructions.

Type-check only:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Expected: no new type errors. Manual UI verification (optional, via the mobile browser tester): open the menu → tap Settings → confirm the rest of the screen dims, is unclickable, the sheet slides up, the X and Sign out remain tappable, and tapping the dimmed area closes the sheet; repeat for a note/reminder detail.
```
