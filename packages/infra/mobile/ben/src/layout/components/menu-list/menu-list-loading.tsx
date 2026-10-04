import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

const SKELETON_ROWS = [0, 1, 2, 3, 4]

export function MenuListLoading() {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [opacity])

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <View className="gap-1 pt-2">
      {SKELETON_ROWS.map((index) => (
        <View
          key={index}
          className="flex-row items-start gap-3 rounded-xl px-3 py-3"
        >
          <Animated.View
            style={pulse}
            className="size-9 rounded-lg bg-outline-variant/40"
          />
          <View className="flex-1 gap-2">
            <Animated.View
              style={pulse}
              className="h-4 w-2/3 rounded bg-outline-variant/40"
            />
            <Animated.View
              style={pulse}
              className="h-3 w-full rounded bg-outline-variant/30"
            />
            <Animated.View
              style={pulse}
              className="h-3 w-1/4 rounded bg-outline-variant/30"
            />
          </View>
        </View>
      ))}
    </View>
  )
}
