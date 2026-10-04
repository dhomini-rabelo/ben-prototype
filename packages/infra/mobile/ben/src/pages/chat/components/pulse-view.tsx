import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type PulseViewProps = {
  className?: string
  children?: ReactNode
}

export function PulseView({ className, children }: PulseViewProps) {
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true)
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View className={className} style={style}>
      {children}
    </Animated.View>
  )
}
