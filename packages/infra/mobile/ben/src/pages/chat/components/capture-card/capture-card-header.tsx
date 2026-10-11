import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { captureCardStrings } from '@/pages/chat/strings/capture-card-strings'
import { useCaptureCard } from './contexts/capture-card-context'

export function CaptureCardHeader() {
  const strings = useStrings(captureCardStrings)
  const { kind, state } = useCaptureCard()
  const isError = state === 'error'
  const isFired = state === 'fired'
  const isActive = state === 'active'

  return (
    <View className="flex-row items-center gap-1.5">
      <Typography
        variant="label-caps"
        className={isError ? 'text-text-error' : 'text-on-surface-variant'}
      >
        {strings.kindLabel[kind]}
      </Typography>
      {isFired && (
        <Typography
          variant="label-caps"
          className="text-[10px] tracking-wider text-on-surface-variant/60"
        >
          {strings.fired}
        </Typography>
      )}
      {isActive && (
        <Typography
          variant="label-caps"
          className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] tracking-wider text-primary"
        >
          {strings.active}
        </Typography>
      )}
    </View>
  )
}
