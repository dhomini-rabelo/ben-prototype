# Plan 03 — Chat screen keyboard adaptation (code-level)

## Context

When the text keyboard opens on the chat screen (`project-mobile/src/pages/chat/page.tsx`), the input footer is hidden behind the keyboard and the layout does not adapt (Image 4 in the briefing).

Root cause, confirmed in the current `page.tsx`:

- The input footer is wrapped in a `KeyboardAvoidingView` that is itself `position: absolute; inset-x-0; bottom-0; z-50` (`className="absolute inset-x-0 bottom-0 z-50"`), with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.
- `KeyboardAvoidingView` works by adjusting its **own** height/padding based on its measured frame relative to the keyboard. But this view is already pinned to the bottom edge via absolute positioning, so on Android (`behavior="height"`) it cannot lift the footer — the footer stays behind the keyboard. On iOS `behavior="padding"` adds bottom padding inside a zero-flex absolute container, which also fails to raise it reliably.
- The history list (`ChatHistory`) and the empty state receive `bottomInset = footerHeight + FOOTER_GAP`, which reserves space only for the resting footer — not for the keyboard.

### Environment (verified)

- Expo SDK 54 (`expo: ~54.0.0`), React Native `0.81.5`, `newArchEnabled: true` (from `app.config.ts`).
- **Android edge-to-edge is the only mode in SDK 54** and is enabled by default. There is no `android.softwareKeyboardLayoutMode` / `windowSoftInputMode="adjustResize"` escape hatch configured, and the legacy "resize" behavior is unreliable under edge-to-edge. This is exactly why a `KeyboardAvoidingView` cannot be relied on here.
- Installed, reusable dependencies: React Native core `Keyboard` API, `react-native-safe-area-context` (`~5.6.0`, already used via `SafeAreaView` / `useSafeAreaInsets`), `react-native-reanimated` (`~4.1.0`). **No** `react-native-keyboard-controller` is installed — and this plan must NOT add one.
- RN `Keyboard` API (verified in `node_modules/react-native/.../Keyboard.d.ts`): `keyboardDidShow` / `keyboardDidHide` fire on both platforms; `keyboardWillShow` / `keyboardWillHide` are iOS-only. The event payload exposes `endCoordinates: { height, ... }`.

## Decision

**Approach: RN `Keyboard` listeners tracking keyboard height, then offset the absolutely-positioned footer's `bottom` and add the same height to the list/empty-state `bottomInset`.** A `KeyboardAvoidingView` is removed.

Why this over `KeyboardAvoidingView`:

- The footer is intentionally absolutely positioned (it overlays the history list with `z-50`, so the inverted `FlatList` scrolls underneath it). A `KeyboardAvoidingView` cannot lift an already-bottom-pinned absolute element on Android edge-to-edge. The briefing's Plan steps 1–4 explicitly call for the height-tracking + offset approach and for removing the ineffective avoidance wrapper.
- It keeps full control of the exact pixel offset, which we already need because the same number must be fed into `bottomInset` so the message history stays visible (briefing step 3).
- It uses only already-installed capabilities (briefing step 4 — no new native keyboard dependency). Plain RN `Keyboard` is sufficient and is the simplest correct primitive; `react-native-reanimated`'s `useAnimatedKeyboard` is available but is not needed and would add complexity without a clear benefit for a non-interactive bottom offset.

Why not iOS-only `keyboardWillShow`: we subscribe to both `Will*` (iOS, for smoother timing) and `Did*` (Android + iOS fallback) so behavior is consistent cross-platform, as required by briefing step 1.

### Safe-area / edge-to-edge correctness

The screen is wrapped in `<SafeAreaView edges={['top', 'bottom']}>`, so the footer already sits **above** the bottom safe-area inset at rest. `endCoordinates.height` from the keyboard event is measured from the physical bottom of the screen, so it **includes** the bottom safe-area inset region. If we offset the footer by the full keyboard height, it would float too high by `insets.bottom`.

Therefore the effective lift is `max(keyboardHeight - insets.bottom, 0)`. We compute this inside the keyboard hook using `useSafeAreaInsets()` (already used elsewhere in the project, e.g. `task-picker-sheet.tsx`, `menu-sheet.tsx`), so callers get a ready-to-use value.

### Where the logic lives

Extract the listener + height math into a new page-scoped hook `src/pages/chat/hooks/use-keyboard-height.ts` (matches the existing `hooks/` convention — `use-connectivity.ts`, `use-scroll-to-bottom.ts`, etc., and the page-structure design). `page.tsx` consumes it and threads the offset into both the footer style and the `bottomInset`. This keeps `page.tsx` thin and the keyboard concern reusable/testable, consistent with the React single-responsibility pattern.

### Scope guardrails

- OWNS `src/pages/chat/page.tsx` and may add `src/pages/chat/hooks/use-keyboard-height.ts` (new file, inside the chat page folder — not a shared/other-plan file).
- Does **not** touch `chat-footer.tsx` (Plan 01). The footer wrapper `<View onLayout={handleFooterLayout} …>` in `page.tsx` is owned here; only the outer wrapper changes, not `<ChatFooter />` itself.
- `chat-history/chat-history.tsx` already accepts and applies `bottomInset` correctly (`contentContainerStyle={{ paddingTop: bottomInset }}` on the inverted list) — **no edit needed there**. We only change the value passed from `page.tsx`. The `chat-history/` folder is therefore left untouched.
- No new dependency. No formatting step.

## Files to modify

### 1. New file — `project-mobile/src/pages/chat/hooks/use-keyboard-height.ts`

A hook that tracks the current keyboard height and returns the effective bottom offset (keyboard height minus the bottom safe-area inset, floored at 0). It subscribes to `Will*` events on iOS and `Did*` events on Android, and resets to `0` on hide.

```ts
import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useKeyboardHeight() {
  const insets = useSafeAreaInsets()
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const keyboardOffset =
    keyboardHeight > 0 ? Math.max(keyboardHeight - insets.bottom, 0) : 0

  return { keyboardOffset }
}
```

Notes:
- `Keyboard.addListener` returns an `EmitterSubscription` with `.remove()` — this is the current RN 0.81 API (the legacy `Keyboard.removeListener` is removed). Verified against the installed `Keyboard.d.ts`.
- Returning an object (`{ keyboardOffset }`) mirrors the existing hooks' return style (e.g. `useScrollToBottom` returns `{ listRef }`, `useConnectivity` returns `{ isOffline }`).

### 2. `project-mobile/src/pages/chat/page.tsx`

Four edits.

**Edit 2a — imports.** Remove `KeyboardAvoidingView` (no longer used) and the now-unused `Platform` import; keep `View` and `type LayoutChangeEvent`. Add the new hook import alongside the other chat hook imports.

Current:

```tsx
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  View,
  type LayoutChangeEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
```

New:

```tsx
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View, type LayoutChangeEvent } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
```

And add the hook import next to `useScrollToBottom` (keep import ordering consistent with the existing alphabetical-by-path grouping of `@/pages/chat/hooks/*`):

```tsx
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import { useKeyboardHeight } from '@/pages/chat/hooks/use-keyboard-height'
import { useScrollToBottom } from '@/pages/chat/hooks/use-scroll-to-bottom'
```

**Edit 2b — consume the hook.** Add the hook call next to the other hook calls in the component body (after `useScrollToBottom`):

Current:

```tsx
  const { listRef } = useScrollToBottom({ messages, isAwaitingReply })

  const router = useRouter()
```

New:

```tsx
  const { listRef } = useScrollToBottom({ messages, isAwaitingReply })
  const { keyboardOffset } = useKeyboardHeight()

  const router = useRouter()
```

**Edit 2c — add the keyboard offset to the reserved bottom space** of both the empty state and the history list. This keeps the existing `footerHeight + FOOTER_GAP` reservation intact and just adds the keyboard offset on top, satisfying briefing step 3 (recent messages / empty state never covered).

Current:

```tsx
          ) : historyState.isEmpty && !hasVoiceBubble ? (
            <View
              className="flex-1 px-4"
              style={{
                paddingTop: headerHeight,
                paddingBottom: footerHeight + FOOTER_GAP,
              }}
            >
              <ChatEmptyState />
            </View>
          ) : (
            <ChatHistory
              listRef={listRef}
              bottomInset={footerHeight + FOOTER_GAP}
            />
          )}
```

New:

```tsx
          ) : historyState.isEmpty && !hasVoiceBubble ? (
            <View
              className="flex-1 px-4"
              style={{
                paddingTop: headerHeight,
                paddingBottom: footerHeight + FOOTER_GAP + keyboardOffset,
              }}
            >
              <ChatEmptyState />
            </View>
          ) : (
            <ChatHistory
              listRef={listRef}
              bottomInset={footerHeight + FOOTER_GAP + keyboardOffset}
            />
          )}
```

(The empty-state container uses normal top→bottom flow with `paddingBottom`, so the bump pushes its content up above the lifted footer; the inverted `FlatList` applies `bottomInset` as its `paddingTop` at the visual bottom — both already behave correctly with a larger value.)

**Edit 2d — replace the `KeyboardAvoidingView` wrapper with a plain `View` whose `bottom` is offset by the keyboard.** Keep the inner `<View onLayout={handleFooterLayout} …>` and its children exactly as-is (preserves `footerHeight` measurement and does not touch `ChatFooter` / `ActiveTaskPicker`). Apply `style={{ bottom: keyboardOffset }}` to the absolute wrapper.

Current:

```tsx
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pb-2 pt-2"
          >
            {!isRecording && <ActiveTaskPicker />}
            <ChatFooter
              onStartRecording={() => useVoiceStore.getState().startRecording()}
            />
          </View>
        </KeyboardAvoidingView>
```

New:

```tsx
        <View
          className="absolute inset-x-0 bottom-0 z-50"
          style={{ bottom: keyboardOffset }}
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pb-2 pt-2"
          >
            {!isRecording && <ActiveTaskPicker />}
            <ChatFooter
              onStartRecording={() => useVoiceStore.getState().startRecording()}
            />
          </View>
        </View>
```

The NativeWind `bottom-0` class and the inline `style.bottom` resolve to the same property; inline style wins at runtime, so at rest (`keyboardOffset === 0`) the footer stays pinned to the bottom exactly as before, and when the keyboard opens it lifts by `keyboardOffset`. The `bottom-0` class is kept for parity with the existing markup / the sibling `task-workspace` footer and as a harmless default.

## Existing code to reuse

- `useSafeAreaInsets()` from `react-native-safe-area-context` — already used in `task-picker-sheet.tsx`, `menu-sheet.tsx`, `menu-list-shell.tsx`; reused inside the new hook for the edge-to-edge inset correction.
- The existing `footerHeight` / `headerHeight` `onLayout` measurement (`handleFooterLayout`, `handleHeaderLayout`) and the `FOOTER_GAP` constant are preserved unchanged; the keyboard offset is purely additive.
- `ChatHistory`'s existing `bottomInset` prop and its `contentContainerStyle={{ paddingTop: bottomInset }}` on the inverted list — reused as-is; only the passed value changes.
- `keyboardShouldPersistTaps="handled"` is already set on the `FlatList` (`chat-history.tsx`), so tapping a message/list item while the keyboard is open is preserved without changes (briefing step 5).
- `useScrollToBottom` continues to drive auto-scroll on new messages / reply-state changes — untouched, so briefing step 5's scroll behavior is preserved.
- Hook return-shape and `useEffect` cleanup style mirror `use-connectivity.ts` and `use-scroll-to-bottom.ts`.

## Cross-flow impact

- `task-workspace/page.tsx` uses the same ineffective `KeyboardAvoidingView` pattern but is **owned by another plan / out of scope** here; this plan does not modify it. The new `use-keyboard-height.ts` hook lives under the chat page folder, so it does not implicitly change task-workspace.
- The loading skeleton (`ChatHistorySkeleton`) renders a non-scrolling bottom-anchored column and is shown only while loading; it does not take `bottomInset` and is unaffected. Its branch is unchanged.
- `hasVoiceBubble` / recording states: when recording, `ActiveTaskPicker` is hidden and the soft keyboard is not open, so `keyboardOffset` is `0` and layout is identical to today.

## Verification

1. Type-check (required):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
   ```

   Expect no new errors. In particular confirm: no unused-import error for `Platform` / `KeyboardAvoidingView` (both removed), and `Keyboard.addListener(...).remove()` and `event.endCoordinates.height` type-check against RN 0.81 types.

2. Manual / runtime expectations (not run as part of this plan):
   - Keyboard open → footer sits directly above the keyboard; most recent messages (inverted list bottom) and the empty state remain visible above the footer and scrollable.
   - Keyboard closed → footer rests at the bottom edge exactly as before (offset `0`).
   - Behavior consistent on iOS (`keyboardWillShow/Hide`) and Android edge-to-edge (`keyboardDidShow/Hide`).
   - Tapping a message/list item while the keyboard is open still works (`keyboardShouldPersistTaps="handled"`).

   The `browser-mobile-tester` agent can be used post-implementation to confirm the chat flow renders, though the on-screen keyboard offset is best validated on a device/emulator.

3. Do **not** run any formatting step (`npm run lint:fix`) as part of this plan.
