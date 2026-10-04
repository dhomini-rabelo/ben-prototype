import { RotateCw } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { textError } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useVoiceStore } from '@/layout/stores/voice-store'

type RetryFooterProps = { className?: string }

export function RetryFooter({ className }: RetryFooterProps) {
  const retryVoice = useVoiceStore((store) => store.retryVoice)

  return (
    <Pressable
      onPress={retryVoice}
      className={cn('mt-1 flex-row items-center gap-1.5 pr-2', className)}
    >
      <RotateCw size={14} color={textError} />
      <Typography variant="label-caps" className="text-text-error">
        Tap to retry
      </Typography>
    </Pressable>
  )
}
