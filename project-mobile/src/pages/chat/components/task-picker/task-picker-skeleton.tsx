import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

const SKELETON_ROWS = [0, 1, 2]

export function TaskPickerSkeleton() {
  const pulse = useSharedValue(0.4)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
  }, [pulse])

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))

  return (
    <View className="flex-col gap-1 px-3 pb-4">
      {SKELETON_ROWS.map((index) => (
        <View
          key={index}
          className="flex-row items-center gap-3 rounded-xl px-2 py-2.5"
        >
          <Animated.View
            style={pulseStyle}
            className="size-8 rounded-lg bg-outline-variant/40"
          />
          <View className="flex-1 flex-col gap-1.5">
            <Animated.View
              style={pulseStyle}
              className="h-3.5 w-3/4 rounded bg-outline-variant/40"
            />
            <Animated.View
              style={pulseStyle}
              className="h-2.5 w-1/3 rounded bg-outline-variant/30"
            />
          </View>
        </View>
      ))}
    </View>
  )
}
