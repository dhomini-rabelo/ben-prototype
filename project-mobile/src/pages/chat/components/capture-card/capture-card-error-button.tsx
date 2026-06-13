import { RotateCw } from 'lucide-react-native'
import { Pressable, Text } from 'react-native'
import { textError } from '@/layout/utils/colors'
import { useCaptureCard } from './contexts/capture-card-context'
import type { CaptureKind } from './types'

const DEFAULT_ERROR_MESSAGES: Record<CaptureKind, string> = {
  note: "couldn't save this note — retry",
  reminder: "couldn't save this reminder — retry",
  task: "couldn't set this up — retry",
}

type CaptureCardErrorButtonProps = {
  errorMessage?: string
  onAction?: () => void
}

export function CaptureCardErrorButton({
  errorMessage,
  onAction,
}: CaptureCardErrorButtonProps) {
  const { kind, state } = useCaptureCard()

  if (state !== 'error') {
    return null
  }

  return (
    <Pressable
      onPress={onAction}
      className="mt-1 flex-row items-center gap-1.5 self-start"
    >
      <RotateCw size={14} color={textError} />
      <Text className="text-label-caps font-mono uppercase text-text-error">
        {errorMessage ?? DEFAULT_ERROR_MESSAGES[kind]}
      </Text>
    </Pressable>
  )
}
