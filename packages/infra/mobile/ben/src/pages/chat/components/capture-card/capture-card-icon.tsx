import { Alarm, Kanban, Note } from 'phosphor-react-native'
import { View } from 'react-native'
import {
  brandDeep,
  iconNote,
  iconReminder,
  onSurfaceVariantMuted,
  textError,
} from '@/layout/utils/colors'
import { useCaptureCard } from './contexts/capture-card-context'
import type { CaptureCardIconComponent, CaptureKind } from './types'

type KindIcon = { Icon: CaptureCardIconComponent; color: string }

const KIND_ICON: Record<CaptureKind, KindIcon> = {
  note: { Icon: Note, color: iconNote },
  reminder: { Icon: Alarm, color: iconReminder },
  task: { Icon: Kanban, color: brandDeep },
}

export function CaptureCardIcon() {
  const { kind, state } = useCaptureCard()
  const isError = state === 'error'
  const isMuted = state === 'fired' || state === 'finished'
  const { Icon, color } = KIND_ICON[kind]
  const resolvedColor = resolveColor(color, isError, isMuted)

  return (
    <View className="size-[30px] shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
      <Icon size={17} color={resolvedColor} />
    </View>
  )
}

function resolveColor(kindColor: string, isError: boolean, isMuted: boolean) {
  if (isError) {
    return textError
  }
  if (isMuted) {
    return onSurfaceVariantMuted
  }
  return kindColor
}
