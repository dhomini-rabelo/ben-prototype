import { ChevronRight, Play } from 'lucide-react-native'
import { Pressable, Text } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { onPrimary, onSurfaceVariant } from '@/layout/utils/colors'
import { captureCardStrings } from '@/pages/chat/strings/capture-card-strings'
import { cn } from '@/layout/utils/styles'
import { useCaptureCard } from './contexts/capture-card-context'
type CaptureCardActionButtonProps = {
  actionLabel?: string
  onAction?: () => void
}

export function CaptureCardActionButton({
  actionLabel,
  onAction,
}: CaptureCardActionButtonProps) {
  const strings = useStrings(captureCardStrings)
  const { kind, state } = useCaptureCard()

  if (kind !== 'task' || state === 'error') {
    return null
  }

  const isPending = state === 'pending'
  const isActive = state === 'active'
  const isFinished = state === 'finished'
  const resolvedActionLabel = actionLabel ?? strings.actionLabel[state]
  const labelColor = isFinished ? 'text-on-surface-variant' : 'text-on-primary'
  const iconColor = isFinished ? onSurfaceVariant : onPrimary

  return (
    <Pressable
      onPress={onAction}
      disabled={isPending}
      className={cn(
        'mt-2 shrink-0 flex-row items-center gap-1 self-end rounded-full px-3 py-1.5',
        isFinished ? 'bg-transparent' : 'bg-primary',
        isPending && 'opacity-60',
      )}
    >
      {!isFinished && !isActive && (
        <Play size={12} strokeWidth={2.5} color={iconColor} />
      )}
      <Text
        className={cn(
          'text-label-caps font-mono font-semibold uppercase tracking-wider',
          labelColor,
        )}
      >
        {resolvedActionLabel}
      </Text>
      {isFinished && <ChevronRight size={14} color={iconColor} />}
    </Pressable>
  )
}
