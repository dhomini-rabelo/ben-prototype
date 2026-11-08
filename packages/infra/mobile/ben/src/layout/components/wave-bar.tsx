import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated'
import { wave } from '@/layout/utils/colors'

const WAVE_MIN_SCALE = 0.4

type WaveBarProps = {
  height: number
  phase: number
  clock: SharedValue<number>
}

export function WaveBar({ height, phase, clock }: WaveBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const shifted = (clock.value + phase) % 1
    const waveProgress = Math.sin(shifted * Math.PI)
    const scaleY = WAVE_MIN_SCALE + (1 - WAVE_MIN_SCALE) * waveProgress
    return { transform: [{ scaleY }] }
  })

  return (
    <Animated.View
      style={[
        { width: 4, borderRadius: 2, backgroundColor: wave, height },
        animatedStyle,
      ]}
    />
  )
}
