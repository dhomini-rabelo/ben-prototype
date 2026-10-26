import { ArrowClockwise } from 'phosphor-react-native'
import { Pressable } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { textError } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useVoiceStore } from '@/layout/stores/voice-store'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type RetryFooterProps = { className?: string }

export function RetryFooter({ className }: RetryFooterProps) {
  const strings = useStrings(chatStrings)
  const retryVoice = useVoiceStore((store) => store.retryVoice)

  return (
    <Pressable
      onPress={retryVoice}
      className={cn('mt-1 flex-row items-center gap-1.5 pr-2', className)}
    >
      <ArrowClockwise size={14} color={textError} />
      <Typography variant="label-caps" className="text-text-error">
        {strings.tapToRetry}
      </Typography>
    </Pressable>
  )
}
