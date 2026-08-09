# Mobile Bottom Sheet Overlay Pattern

How `project-mobile` builds a reusable slide-up bottom sheet that hosts arbitrary content.

## One reusable overlay, not inline blocks

A slide-up sheet has a fixed shape: a transparent `Modal`, a dimmed scrim, a tap-to-dismiss area, and bottom-anchored content. Capture it in a single reusable component (e.g. `BottomSheetOverlay`) rather than copying inline `absolute inset-x-0 bottom-0` blocks into each screen. The overlay owns the animation, scrim, and dismissal; the hosted content owns its own rounded surface and safe-area padding.

## The overlay shape

- Use a transparent RN `Modal` with `animationType="none"` (Reanimated drives the animation) and wire `onRequestClose` so the Android hardware back button closes the sheet.
- Animate `translateY` (slide up from below) and the backdrop opacity with Reanimated `withTiming`.
- Dim the background with a scrim using the `bg-inverse-surface/30` token.
- Put a full-area `Pressable` behind the content, wired to `onClose`, for tap-to-dismiss.
- Anchor the content to the bottom with `flex-1 justify-end`.

```tsx
// Correct way — single reusable overlay component
import { Modal, Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

type BottomSheetOverlayProps = {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheetOverlay({ visible, onClose, children }: BottomSheetOverlayProps) {
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(visible ? 0 : SHEET_HEIGHT) }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0),
  }))

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View style={backdropStyle} className="absolute inset-0 bg-inverse-surface/30">
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View style={sheetStyle}>{children}</Animated.View>
      </View>
    </Modal>
  )
}
```

```tsx
// Wrong way — duplicated inline overlay in every screen, no reuse, no back-button handling
<View className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl">
  {/* sheet content mixed with overlay concerns */}
</View>
```

## The rule

- Build one reusable overlay component; never duplicate inline `absolute inset-x-0 bottom-0` overlay blocks.
- Drive the slide-up `translateY` and backdrop opacity with Reanimated `withTiming`.
- Use a transparent `Modal` with `animationType="none"` and handle `onRequestClose` for the Android back button.
- Dim the scrim with `bg-inverse-surface/30` and cover it with a `Pressable` wired to `onClose`.
- Keep the rounded surface and safe-area padding in the **hosted content**, not in the overlay.
