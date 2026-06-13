import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { cn } from '@/layout/utils/styles'

const DELAYS = [0, 100, 200]

type BouncingDotsProps = {
  size?: number
  className?: string
}

function Dot({ delay, size }: { delay: number; size: number }) {
  const offset = useSharedValue(0)

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-3, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    )
  }, [delay, offset])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }))

  return (
    <Animated.View
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      className="bg-on-surface-variant"
    />
  )
}

export function BouncingDots({ size = 6, className }: BouncingDotsProps) {
  return (
    <View className={cn('flex-row items-center gap-1', className)}>
      {DELAYS.map((delay) => (
        <Dot key={delay} delay={delay} size={size} />
      ))}
    </View>
  )
}
