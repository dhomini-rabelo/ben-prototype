import { ArrowRight } from 'phosphor-react-native'
import { Pressable, Text } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { onSurfaceVariant, ink } from '@/layout/utils/colors'
import { captureCardStrings } from '@/pages/chat/strings/capture-card-strings'
import { cn } from '@/layout/utils/styles'
import { useCaptureCard } from './contexts/capture-card-context'

const ACTION_HIT_SLOP = { top: 7, bottom: 7, left: 4, right: 4 }

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
  const isFinished = state === 'finished'
  const resolvedActionLabel = actionLabel ?? strings.actionLabel[state]
  const labelColor = isFinished ? 'text-on-surface-variant' : 'text-ink'
  const iconColor = isFinished ? onSurfaceVariant : ink

  return (
    <Pressable
      onPress={onAction}
      disabled={isPending}
      hitSlop={ACTION_HIT_SLOP}
      className={cn(
        'ml-1 h-[30px] shrink-0 flex-row items-center gap-[5px] rounded-full pl-3 pr-[11px]',
        isFinished ? 'bg-transparent' : 'bg-primary',
        isPending && 'opacity-60',
      )}
    >
      <Text className={cn('font-sans-semibold text-[13px]', labelColor)}>
        {resolvedActionLabel}
      </Text>
      <ArrowRight size={14} color={iconColor} />
    </Pressable>
  )
}
