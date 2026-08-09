# Keyboard-Aware Absolute Footer Pattern

How `project-mobile` lifts an absolutely-positioned input footer above the keyboard.

## Why not KeyboardAvoidingView

`KeyboardAvoidingView` resizes or pads its own layout, so it cannot lift a child that is pinned to the bottom with `absolute`. Under Android edge-to-edge it fails outright: the bottom-pinned element stays behind the keyboard. For an absolute footer, track the keyboard height yourself with a small `Keyboard` hook and apply the offset manually.

## Track keyboard height with a hook

Subscribe to the platform-correct events and reset to `0` on hide. iOS fires `keyboardWillShow`/`keyboardWillHide` (animated, early); Android fires `keyboardDidShow`/`keyboardDidHide`.

```tsx
// Correct way — height hook
import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const show = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height))
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0))

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return height
}
```

```tsx
// Wrong way — KeyboardAvoidingView cannot lift a bottom-pinned absolute element
<KeyboardAvoidingView behavior="padding">
  <ScrollView>{/* messages */}</ScrollView>
  <View className="absolute inset-x-0 bottom-0">{/* input footer */}</View>
</KeyboardAvoidingView>
```

## Subtract the safe-area bottom inset

When the screen uses `SafeAreaView edges={['bottom']}`, the footer already sits above the bottom inset. Subtracting it avoids double-counting, and `Math.max(..., 0)` keeps the offset non-negative while the keyboard is closed.

```tsx
// Correct way — height hook drives both the footer and the scroll inset
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const insets = useSafeAreaInsets()
const keyboardHeight = useKeyboardHeight()
const offset = Math.max(keyboardHeight - insets.bottom, 0)

<View className="absolute inset-x-0" style={{ bottom: offset }}>
  {/* input footer */}
</View>

<ScrollView contentContainerStyle={{ paddingBottom: offset }}>
  {/* messages stay visible above the lifted footer */}
</ScrollView>
```

## The rule

- Prefer a `Keyboard` height hook over `KeyboardAvoidingView` for an absolutely-positioned footer.
- Subscribe to `keyboardWillShow`/`keyboardWillHide` on iOS and `keyboardDidShow`/`keyboardDidHide` on Android; reset to `0` on hide.
- Compute the offset as `Math.max(keyboardHeight - insets.bottom, 0)` to account for `SafeAreaView edges={['bottom']}`.
- Apply the same offset to **both** the footer's `bottom` and the scroll content's bottom inset so content never hides behind the footer.
