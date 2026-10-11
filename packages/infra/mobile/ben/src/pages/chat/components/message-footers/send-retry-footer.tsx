import { RotateCw } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'
import { textError } from '@/layout/utils/colors'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type SendRetryFooterProps = { className?: string }

export function SendRetryFooter({ className }: SendRetryFooterProps) {
  const strings = useStrings(chatStrings)
  const retrySend = useMessagesStore((store) => store.retrySend)

  return (
    <Pressable
      onPress={() => void retrySend()}
      className={cn('mt-1 flex-row items-center gap-1.5 pr-2', className)}
    >
      <RotateCw size={14} color={textError} />
      <Typography variant="label-caps" className="text-text-error">
        {strings.sendRetry}
      </Typography>
    </Pressable>
  )
}
