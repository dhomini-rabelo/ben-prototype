import { ArrowUp, Mic } from 'lucide-react-native'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useVoiceStore } from '@/layout/stores/voice-store'
import { onPrimary, onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { Typography } from './ui/typography'
import { WaveBar } from './wave-bar'

const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
]

const WAVE_DURATION = 450
const WAVE_STAGGER = 60
const CANCEL_THRESHOLD = 56

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type RecordingBarProps = {
  className?: string
}

export function RecordingBar({ className }: RecordingBarProps) {
  const elapsedSeconds = useVoiceStore((store) => store.recordingSeconds)
  const stopRecording = useVoiceStore((store) => store.stopRecording)
  const cancelRecording = useVoiceStore((store) => store.cancelRecording)

  const dotPulse = useSharedValue(1)
  const waveClock = useSharedValue(0)
  const dragY = useSharedValue(0)

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  }, [])

  useEffect(() => {
    dotPulse.value = withRepeat(
      withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [dotPulse])

  useEffect(() => {
    waveClock.value = withRepeat(
      withTiming(1, {
        duration: WAVE_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [waveClock])

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotPulse.value }))

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
    opacity: 1 + dragY.value / (CANCEL_THRESHOLD * 3),
  }))

  function handleStop() {
    stopRecording()
  }

  function handleCancel() {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {})
    cancelRecording()
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      dragY.value = Math.min(0, event.translationY)
    })
    .onEnd((event) => {
      if (event.translationY <= -CANCEL_THRESHOLD) {
        runOnJS(handleCancel)()
      } else {
        dragY.value = withSpring(0)
      }
    })

  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          className="flex-1 gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
          style={cardStyle}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Animated.View
                className="size-2 rounded-full bg-text-error"
                style={dotStyle}
              />
              <Typography variant="label-caps" className="text-text-error">
                Recording
              </Typography>
            </View>
            <Typography
              variant="label-caps"
              className="font-mono normal-case text-on-surface-variant"
            >
              {formatTime(elapsedSeconds)}
            </Typography>
          </View>

          <View className="h-8 flex-row items-center justify-center gap-1">
            {WAVEFORM_BARS.map((height, index) => (
              <WaveBar
                key={index}
                height={height}
                phase={(index * WAVE_STAGGER) / WAVE_DURATION}
                clock={waveClock}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel recording"
            onPress={handleCancel}
            className="flex-row items-center justify-center gap-2"
          >
            <ArrowUp color={onSurfaceVariant} size={14} />
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Slide up to cancel
            </Typography>
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Stop recording"
        onPress={handleStop}
        className="size-12 shrink-0 items-center justify-center rounded-full bg-text-error"
      >
        <Mic color={onPrimary} size={20} />
      </Pressable>
    </View>
  )
}
