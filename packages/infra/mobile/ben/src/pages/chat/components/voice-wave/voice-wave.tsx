import { Text, View } from 'react-native'

type VoiceWaveProps = {
  durationMs: number
}

const MIN_BAR_COUNT = 3
const MAX_BAR_COUNT = 24
const BARS_PER_SECOND = 3
const BAR_HEIGHT_STRIDE = 7
const BAR_HEIGHTS = [5, 9, 13, 7, 11, 6, 12, 8, 10, 5, 9, 14, 7, 11, 6]
const SECONDS_PER_MINUTE = 60
const TABULAR_NUMBERS = { fontVariant: ['tabular-nums' as const] }

function getBarCount(seconds: number) {
  return Math.min(
    MAX_BAR_COUNT,
    Math.max(MIN_BAR_COUNT, seconds * BARS_PER_SECOND),
  )
}

function getBarHeights(seconds: number) {
  return Array.from(
    { length: getBarCount(seconds) },
    (_, index) =>
      BAR_HEIGHTS[(index * BAR_HEIGHT_STRIDE + seconds) % BAR_HEIGHTS.length],
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
  const remainingSeconds = seconds % SECONDS_PER_MINUTE
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function VoiceWave({ durationMs }: VoiceWaveProps) {
  const seconds = Math.round(durationMs / 1000)

  return (
    <View className="h-3.5 flex-row items-center gap-0.5">
      {getBarHeights(seconds).map((height, index) => (
        <View
          key={index}
          className="w-0.5 rounded-sm bg-wave"
          style={{ height }}
        />
      ))}
      <Text
        className="ml-1 text-[12px] font-sans-semibold leading-4 text-brand-deep"
        style={TABULAR_NUMBERS}
      >
        {formatDuration(seconds)}
      </Text>
    </View>
  )
}
