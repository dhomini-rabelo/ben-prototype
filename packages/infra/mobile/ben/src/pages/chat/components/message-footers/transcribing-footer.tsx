import { X } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { useVoiceStore } from '@/layout/stores/voice-store'
import { BouncingDots } from '@/pages/chat/components/bouncing-dots'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type TranscribingFooterProps = { className?: string }

export function TranscribingFooter({ className }: TranscribingFooterProps) {
  const strings = useStrings(chatStrings)
  const cancelTranscribing = useVoiceStore((store) => store.cancelTranscribing)

  return (
    <View className={cn('flex-row items-center gap-1.5 pr-2', className)}>
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.hearingYou}
      </Typography>
      <BouncingDots size={4} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.cancelTranscription}
        onPress={cancelTranscribing}
        className="ml-1 size-4 items-center justify-center rounded-full"
      >
        <X size={12} color={onSurfaceVariant} />
      </Pressable>
    </View>
  )
}
