import { ChevronRight, Play } from 'lucide-react-native'
import { Pressable, Text } from 'react-native'
import { onPrimary, onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useCaptureCard } from './contexts/capture-card-context'
import type { CaptureCardState } from './types'

const DEFAULT_TASK_ACTION_LABEL: Record<CaptureCardState, string> = {
  default: 'Start',
  pending: 'Start',
  active: 'Continue',
  finished: 'View',
  error: 'Start',
  fired: 'Start',
}

type CaptureCardActionButtonProps = {
  actionLabel?: string
  onAction?: () => void
}

export function CaptureCardActionButton({
  actionLabel,
  onAction,
}: CaptureCardActionButtonProps) {
  const { kind, state } = useCaptureCard()

  if (kind !== 'task' || state === 'error') {
    return null
  }

  const isPending = state === 'pending'
  const isActive = state === 'active'
  const isFinished = state === 'finished'
  const resolvedActionLabel = actionLabel ?? DEFAULT_TASK_ACTION_LABEL[state]
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
