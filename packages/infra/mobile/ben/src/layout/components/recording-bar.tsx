import { ArrowUp, X } from 'phosphor-react-native'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useStrings } from '@/layout/hooks/use-strings'
import { useVoiceStore } from '@/layout/stores/voice-store'
import { recordingStrings } from '@/layout/strings/recording-strings'
import { ink, onSurface, textError } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { ChatInput } from './chat-input'
import { Typography } from './ui/typography'
import { WaveBar } from './wave-bar'

const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
]

const WAVE_DURATION = 450
const WAVE_STAGGER = 60

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
  const strings = useStrings(recordingStrings)
  const elapsedSeconds = useVoiceStore((store) => store.recordingSeconds)
  const stopRecording = useVoiceStore((store) => store.stopRecording)
  const cancelRecording = useVoiceStore((store) => store.cancelRecording)

  const dotPulse = useSharedValue(1)
  const waveClock = useSharedValue(0)

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

  function handleStop() {
    stopRecording()
  }

  function handleCancel() {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {})
    cancelRecording()
  }

  return (
    <View
      className={cn(
        'h-[44px] flex-row items-center gap-2 rounded-full border-[1.5px] border-field-border bg-surface-container-lowest px-1.5',
        className,
      )}
    >
      <ChatInput.IconButton
        variant="subtle"
        label={strings.cancelRecording}
        onPress={handleCancel}
      >
        <X size={16} color={onSurface} />
      </ChatInput.IconButton>
      <Animated.View
        style={[
          {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: textError,
          },
          dotStyle,
        ]}
      />
      <Typography
        variant="label-caps"
        className="font-mono normal-case text-on-surface-variant"
      >
        {formatTime(elapsedSeconds)}
      </Typography>
      <View className="h-7 flex-1 flex-row items-center justify-center gap-1">
        {WAVEFORM_BARS.map((height, index) => (
          <WaveBar
            key={index}
            height={height}
            phase={(index * WAVE_STAGGER) / WAVE_DURATION}
            clock={waveClock}
          />
        ))}
      </View>
      <ChatInput.IconButton
        variant="primary"
        label={strings.stopRecording}
        onPress={handleStop}
      >
        <ArrowUp size={16} color={ink} />
      </ChatInput.IconButton>
    </View>
  )
}
