import { ArrowClockwise } from 'phosphor-react-native'
import { Pressable, Text } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { textError } from '@/layout/utils/colors'
import { captureCardStrings } from '@/pages/chat/strings/capture-card-strings'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardErrorButtonProps = {
  errorMessage?: string
  onAction?: () => void
}

export function CaptureCardErrorButton({
  errorMessage,
  onAction,
}: CaptureCardErrorButtonProps) {
  const strings = useStrings(captureCardStrings)
  const { kind, state } = useCaptureCard()

  if (state !== 'error') {
    return null
  }

  return (
    <Pressable
      onPress={onAction}
      className="mt-1 flex-row items-center gap-1.5 self-start"
    >
      <ArrowClockwise size={14} color={textError} />
      <Text className="font-sans-semibold text-xs text-text-error">
        {errorMessage ?? strings.errorMessage[kind]}
      </Text>
    </Pressable>
  )
}
