import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'

const WAVE_MIN_SCALE = 0.4

type WaveBarProps = {
  height: number
  phase: number
  clock: SharedValue<number>
}

export function WaveBar({ height, phase, clock }: WaveBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const shifted = (clock.value + phase) % 1
    const wave = Math.sin(shifted * Math.PI)
    const scaleY = WAVE_MIN_SCALE + (1 - WAVE_MIN_SCALE) * wave
    return { transform: [{ scaleY }] }
  })

  return (
    <Animated.View
      className="w-1 rounded-full bg-primary/80"
      style={[{ height }, animatedStyle]}
    />
  )
}
