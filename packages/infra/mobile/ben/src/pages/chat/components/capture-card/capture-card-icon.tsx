import { Bell, List, NotebookPen, Type } from 'lucide-react-native'
import { View } from 'react-native'
import {
  onSurfaceVariant,
  onSurfaceVariantMuted,
  textError,
} from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useCaptureCard } from './contexts/capture-card-context'
import type { CaptureCardIconComponent, CaptureKind, TaskShape } from './types'

const KIND_ICON: Record<CaptureKind, CaptureCardIconComponent> = {
  note: NotebookPen,
  reminder: Bell,
  task: Type,
}

const TASK_SHAPE_ICON: Record<TaskShape, CaptureCardIconComponent> = {
  text: Type,
  list: List,
}

function iconColor(isError: boolean, isMuted: boolean) {
  if (isError) {
    return textError
  }
  if (isMuted) {
    return onSurfaceVariantMuted
  }
  return onSurfaceVariant
}

export function CaptureCardIcon() {
  const { kind, state, taskShape } = useCaptureCard()
  const isError = state === 'error'
  const isMuted = state === 'fired' || state === 'finished'
  const Icon = kind === 'task' ? TASK_SHAPE_ICON[taskShape] : KIND_ICON[kind]

  return (
    <View
      className={cn(
        'mt-0.5 size-7 shrink-0 items-center justify-center rounded-lg',
        isError ? 'bg-surface-error' : 'bg-surface-container-high',
      )}
    >
      <Icon size={16} strokeWidth={1.75} color={iconColor(isError, isMuted)} />
    </View>
  )
}
