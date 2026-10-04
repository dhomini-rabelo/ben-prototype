import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Typography } from '@/layout/components/ui/typography'
import type { MenuEntryId } from '@/layout/stores/menu-store'

export type CountValue = number | 'skeleton' | 'dash' | undefined

function CountSkeleton() {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={style}
      className="h-4 w-12 rounded-full bg-outline-variant/40"
    />
  )
}

type CountBadgeProps = {
  entryId: MenuEntryId
  value: CountValue
  formatCount?: (n: number) => string
}

export function CountBadge({ entryId, value, formatCount }: CountBadgeProps) {
  if (value === undefined) return null
  if (value === 'skeleton') return <CountSkeleton />
  if (value === 'dash') {
    return (
      <Typography
        variant="label-caps"
        className="normal-case text-on-surface-variant/60"
      >
        —
      </Typography>
    )
  }

  const text =
    entryId === 'tasks' && formatCount ? formatCount(value) : `${value}`

  return (
    <Typography
      variant="label-caps"
      className="normal-case text-on-surface-variant"
    >
      {text}
    </Typography>
  )
}
